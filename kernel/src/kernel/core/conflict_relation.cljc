(ns kernel.core.conflict-relation
  "Conflict relation used by the MOVIC algorithm ([[kernel.core.movic]] to detect conflicts between competing operations.

  The default conflict relation of the MOVIC algorithm is not suitable for feature modeling as it does not
  consider the particular structure and rules for consistent feature models.
  Instead, we introduce two new conflict relations: [[CO-conflicting?]] and [[conflicting?]].

  CO-conflicting? checks whether two compound operations are conflicting, provided that all operations
  leading up to (causally preceding) these operations did not trigger a conflict.
  Primitive operations in a compound operation are then subsequently applied to the feature model
  and a number of consistency properties are checked. If all pass, the operations are considered
  compatible, else a conflict is declared.

  conflicting? ensures the precondition of CO-conflicting? that causally preceding operations
  have to be compatible and provides a feature model for applying primitive operation.

  The conflict detection results are stored in a conflict cache to improve performance
  (because conflicting? is implemented recursively)."
  (:require [clojure.set :as set]
            [kernel.core.i18n :as i18n]
            [kernel.core.history-buffer :as HB]
            [kernel.core.causal-dag :as CDAG]
            [kernel.core.conflict-cache :as CC]
            [kernel.core.feature-model :as FM]
            [kernel.core.primitive-operation :as PO]
            [kernel.core.compound-operation :as CO]
            [kernel.core.topological-sort :as topological-sort]
            [kernel.helpers :refer [log]]
            #?(:clj  [taoensso.tufte :as tufte :refer (defnp p profiled profile)]
               :cljs [taoensso.tufte :as tufte :refer-macros (defnp p profiled profile)])))

(defn CO-conflict-reducer
  "For each primitive operation from one compound operation CO-x, checks whether applying
  it would compromise feature model consistency assuming that another compound operation
  CO-y has already been applied.

  Some rules access to the feature model (e.g., children implicitly targeted by an operation),
  which has to be obtained by actually applying the operations to intermediate feature models.
  This is potentially slow, although this is only required if operations are eligible for conflict,
  i.e. concurrent, which is not the most common case.

  Multiple rules are checked to guarantee basic feature model consistency (called
  syntactic consistency):

  - The *no-overwrites rule* flags two updates that target the same feature/constraint attribute as conflict.
  - The *no-cycles rule* flags any two updates as conflict that introduce a cycle to the feature tree.
  - The *no-graveyarded rule* flags an update and a remove (which is in turn a special update)
    as conflict when the update targets the removed feature/constraint or an implicit child of the removed feature.
    A special case must be considered, namely un-removing a removed or created feature/constraint
    (setting the parent from :graveyard to something else).
  - The *group-children rule* flags two updates as conflict if one changes a feature group to :or or
    :alternative, and the other sets a child of said feature to mandatory or optional.
  - The *assert-no-child-added rule* flags two updates as conflict if one asserts that no feature
    children may be added by the other, but the other adds feature children nonetheless
    (see [[kernel.core.compound-operation/remove-feature]]).

  All rules included here are checked in a short-circuiting way, so they may build upon each other,
  and they should return true if a conflict is present.
  These rules assume that CO-y has been applied and everything up to, but excluding PO-x."
  [base-FM+preceding-CO-y base-FM+preceding-CO-y+CO-y]
  (fn [FM-up-to-PO-x PO-x]                                  ; more precise: "base-FM+preceding-CO-y+CO-y+preceding-PO-x"
    (p ::CO-conflict-reducer
       (let [type (PO/get-type PO-x)
             ID (PO/get-ID PO-x)
             attribute (PO/get-attribute PO-x)
             old-value (PO/get-old-value PO-x)
             new-value (PO/get-new-value PO-x)]
         (if-let [conflict
                  (p ::conflict-rules
                     (or
                       (when (and (= type :update-feature)
                                  (not (FM/attribute=
                                         old-value
                                         (PO/get-feature-attribute FM-up-to-PO-x ID attribute))))
                         (i18n/t [:conflict-relation :no-overwrite-features] (name attribute) (FM/get-feature-property base-FM+preceding-CO-y ID :name)))
                       (when (and (= type :update-constraint)
                                  (not (FM/attribute=
                                         old-value
                                         (PO/get-constraint-attribute FM-up-to-PO-x ID attribute))))
                         (i18n/t [:conflict-relation :no-overwrite-constraints] (name attribute) (FM/get-constraint-formula base-FM+preceding-CO-y ID)))
                       (when (and (= type :update-feature)
                                  (= attribute :parent-ID)
                                  (let [path-before (FM/get-path-to-root base-FM+preceding-CO-y new-value)
                                        path-after (FM/get-path-to-root base-FM+preceding-CO-y+CO-y new-value)]
                                    (not= path-before path-after)))
                         (i18n/t [:conflict-relation :no-cycles]))
                       (when (and (= type :update-feature)
                                  (FM/graveyarded-feature? FM-up-to-PO-x ID)
                                  ; after the no-overwrites rule, we know for parent updates that old-value == current parent
                                  (not (and (= attribute :parent-ID) (= old-value :graveyard))))
                         (i18n/t [:conflict-relation :no-graveyarded-targeted-features] (FM/get-feature-property base-FM+preceding-CO-y ID :name)))
                       (when (and (= type :update-feature)
                                  (= attribute :parent-ID)
                                  (FM/graveyarded-feature? FM-up-to-PO-x new-value))
                         (i18n/t [:conflict-relation :no-graveyarded-parent-features] (FM/get-feature-property base-FM+preceding-CO-y new-value :name)))
                       (when (and (= type :update-constraint)
                                  (FM/graveyarded-constraint? FM-up-to-PO-x ID)
                                  (not (and (= attribute :graveyarded?) (= old-value true))))
                         (i18n/t [:conflict-relation :no-graveyarded-constraints] (FM/get-constraint-formula base-FM+preceding-CO-y ID)))
                       (when (and (= type :update-feature)
                                  (= attribute :optional?)
                                  (not (FM/part-of-and-group? FM-up-to-PO-x ID)))
                         (i18n/t [:conflict-relation :group-children] (FM/get-feature-property base-FM+preceding-CO-y ID :name)))
                       (when (and (= type :assert-no-child-added)
                                  (let [children-IDs-before (FM/get-feature-children-IDs base-FM+preceding-CO-y ID)
                                        children-IDs-after (FM/get-feature-children-IDs base-FM+preceding-CO-y+CO-y ID)]
                                    (not-empty (set/difference children-IDs-after children-IDs-before))))
                         (i18n/t [:conflict-relation :assert-no-child-added] (FM/get-feature-property base-FM+preceding-CO-y ID :name)))))]
           (reduced conflict)                               ; short-circuiting reduce
           (PO/_apply FM-up-to-PO-x PO-x))))))

(defn CO-syntactically-conflicting?
  "Determines whether two compound operations are in syntactic conflict, according
  to the rules defined in [[CO-conflict-reducer]].

  For that, produces a feature model suitable for subsequently applying CO-x.
  The feature models are well-defined, because the CDAG has all information
  regarding CP-x and CP-y across all sites (due to causality preservation),
  and we may simply assume base-FM to represent the CDAG garbage collected up
  to this point (so the base-FM can be seen as an implementation detail of the
  CDAG, i.e., if there was no base-FM, we would just use the entire CDAG on an
  empty initial feature model, which is clearly correct).

  First applies `(set/intersection CP-x CP-y)` to `base-FM`, then
  `(set/difference CP-y (set/intersection CP-x CP-y))`. Because the intermediate
  result is not needed, their union can directly be applied, which is CP-y,
  yielding `base-FM+preceding-CO-y`.

  Next, CO-y is applied, yielding `base-FM+preceding-CO-y+CO-y`.
  Both of these are required to ensure CO-conflict-reducer's assert-no-child-added rule.

  Next, `(set/difference CP-x (set/intersection CP-x CP-y))` is applied,
  which simplifies to `(set/difference CP-x CP-y)`, yielding
  `base-FM+preceding-CO-y+CO-y+preceding-CO-x`.

  This feature model is fed into CO-conflict-reducer which subsequently applies
  all primitive operations contained in CO-x to produce a final
  `base-FM+preceding-CO-y+CO-y+preceding-CO-x+CO-x`."
  [CO-x CO-y CDAG HB base-FM arg continue]
  (log "checking whether" (CO/get-ID CO-x) "causes a syntactic conflict after" (CO/get-ID CO-y) "has already been applied")
  (p ::CO-syntactically-conflicting?
     (let [CP-x (CDAG/get-CP CDAG (CO/get-ID CO-x))
           CP-y (CDAG/get-CP CDAG (CO/get-ID CO-y))
           base-FM+preceding-CO-y
           (topological-sort/apply-compatible* CDAG HB base-FM CP-y)
           base-FM+preceding-CO-y+CO-y
           (CO/_apply base-FM+preceding-CO-y CO-y)
           base-FM+preceding-CO-y+CO-y+preceding-CO-x
           (topological-sort/apply-compatible* CDAG HB base-FM+preceding-CO-y+CO-y (set/difference CP-x CP-y))
           base-FM+preceding-CO-y+CO-y+preceding-CO-x+CO-x
           (reduce (CO-conflict-reducer base-FM+preceding-CO-y base-FM+preceding-CO-y+CO-y)
                   base-FM+preceding-CO-y+CO-y+preceding-CO-x (CO/get-PO-sequence CO-x))]
       (if (CC/conflict? base-FM+preceding-CO-y+CO-y+preceding-CO-x+CO-x)
         base-FM+preceding-CO-y+CO-y+preceding-CO-x+CO-x    ; early return
         (continue arg base-FM+preceding-CO-y+CO-y+preceding-CO-x+CO-x))))) ; continuation

(defn CO-semantically-conflicting?
  "Determines whether two compound operations are in semantic conflict, according
  to the rules defined in [[kernel.core.feature-model/semantic-rules]]."
  [FM+preceding-CO-a+CO-a+preceding-CO-b+CO-b]
  (log "checking for semantic conflicts")
  (p ::CO-semantically-conflicting?
     (when (some #(% FM+preceding-CO-a+CO-a+preceding-CO-b+CO-b) (FM/semantic-rules))
       (CC/make-conflict "complex semantics rule"))))

(defn CO-conflicting?
  "Determines whether two compound operations are in conflict, assuming that no
  causally preceding operations were in conflict.

  First, it is checked whether subsequently applying CO-a (assuming CO-b has already
  been applied) yields a conflict.
  The same is then checked the other way by subsequently applying CO-b (assuming CO-a
  has already been applied).
  Finally, any additional semantic rules are checked.

  The CDAG, HB and base-FM arguments are passed down as context for [[CO-syntactically-conflicting?]].

  **OPTIMIZE**: Remove the assertion."
  [CO-a CO-b CDAG HB base-FM]
  (p ::CO-conflicting?
     (CO-syntactically-conflicting?
       CO-a CO-b CDAG HB base-FM nil
       (fn [_ FM+preceding-CO-b+CO-b+preceding-CO-a+CO-a]
         (CO-syntactically-conflicting?
           CO-b CO-a CDAG HB base-FM
           FM+preceding-CO-b+CO-b+preceding-CO-a+CO-a
           (fn [FM+preceding-CO-b+CO-b+preceding-CO-a+CO-a
                FM+preceding-CO-a+CO-a+preceding-CO-b+CO-b]
             ; assert that CO-a and CO-b commute, this is guaranteed by the no-overwrites rule
             (assert (FM/_=
                       FM+preceding-CO-b+CO-b+preceding-CO-a+CO-a
                       FM+preceding-CO-a+CO-a+preceding-CO-b+CO-b))
             (CO-semantically-conflicting? FM+preceding-CO-a+CO-a+preceding-CO-b+CO-b)))))))

; forward declaration for mutual recursion
(declare cached-conflicting*?)

(defn uncached-conflicting*?
  "Determines whether two compound operations are in conflict. If they are, causally
   succeeding operations are also in conflict (a transitivity of sorts).

   As this relation is only used by MOVIC when a new operation arrives,
   we may assume that if one of CO-a or CO-b is the new operation, it is CO-b
   (this does not impact the result, it is only an optimization).

   The CDAG, HB, base-FM and CC& arguments are passed down as context.
   This function only uses CDAG to obtain CIPs of CO-a and CO-b.

   Algorithm pseudocode (CACHE is only a performance optimization and not essential):

   ```
   conflicting?(CO-a, CO-b): (assuming that if a new operation is supplied, it is CO-b)
   CACHE: if CO-a, CO-b are known, return whether #{CO-a, CO-b} is in the cache; else continue
   if CO-a not concurrent CO-b, or CO-a == CO-b: return false (respect causal order and irreflexivity)
   foreach CIP(CO-a) and CIP(CO-b), if (conflicting? CIP(CO-a) CIP(CO-b)), goto return_true
   foreach CIP(CO-b), if (conflicting? CO-a CIP(CO-b)), goto return_true (this one goes first, as we may hit the cache)
   foreach CIP(CO-a), if (conflicting? CIP(CO-a) CO-b), goto return_true (from here on, the cache is not hittable)
   if (CO-conflicting? CO-a CO-b), goto return_true
   else return false
   return_true:
   CACHE: add #{CO-a, CO-b} to the cache
   return true
   ```

   For better separation of concerns, conflicting? is split up over two functions,
   uncached-conflicting*? and [[cached-conflicting*?]]."
  [CO-a CO-b CDAG HB base-FM CC&]
  (p ::uncached-conflicting*?
     (if (or (not (CO/concurrent? CO-a CO-b))
             (= (CO/get-ID CO-a) (CO/get-ID CO-b)))
       false
       (let [CIP-a (CDAG/get-CIP CDAG (CO/get-ID CO-a))
             CIP-b (CDAG/get-CIP CDAG (CO/get-ID CO-b))]
         (or (reduce (fn [_ O-a]
                       (if-let [conflict (some #(cached-conflicting*? (HB/lookup HB O-a) (HB/lookup HB %)
                                                                      CDAG HB base-FM CC&) CIP-b)]
                         (reduced conflict)
                         false))
                     false CIP-a)
             (some #(cached-conflicting*? CO-a (HB/lookup HB %) CDAG HB base-FM CC&) CIP-b)
             (some #(cached-conflicting*? (HB/lookup HB %) CO-b CDAG HB base-FM CC&) CIP-a)
             (CO-conflicting? CO-a CO-b CDAG HB base-FM))))))

(defn cached-conflicting*?
  "Mutually recurses with [[uncached-conflicting*?]] to cache conflict detection results.

  The CDAG, HB, base-FM and CC& arguments are passed down as context.
  This function only uses (and modifies) the conflict cache."
  [CO-a CO-b CDAG HB base-FM CC&]
  (p ::cached-conflicting*?
     (let [CO-ID-a (CO/get-ID CO-a)
           CO-ID-b (CO/get-ID CO-b)]
       (if (CC/hittable? @CC& CO-ID-a CO-ID-b)
         (CC/get-conflict @CC& CO-ID-a CO-ID-b)
         (if-let [conflict (uncached-conflicting*? CO-a CO-b CDAG HB base-FM CC&)]
           (do
             (swap! CC& #(CC/insert % CO-ID-a CO-ID-b conflict))
             conflict)
           false)))))

(defn conflicting?
  "Determines whether two compound operations are in conflict with each other.
  This may only be the case for concurrent operations, as causally ordered
  operations can be guaranteed compatible at generation time.
  This relation should be irreflexive and symmetric. It is not generally transitive.
  When called with a newly arrived operation, it should be the second one to allow for optimization."
  [CO-a CO-b CDAG HB base-FM CC&]
  (log "determining conflict relation for" (CO/get-ID CO-a) "and" (CO/get-ID CO-b))
  (p ::conflicting?
     (cached-conflicting*? CO-a CO-b CDAG HB base-FM CC&)))

(def compatible?
  "Determines whether two operations are compatible with each other.
  As it is derived from the conflict relation, it is reflexive and symmetric, but not transitive.
  This kind of relation is also known as compatibility relation. This guarantees convergence,
  but it is only a necessary, not sufficient condition for intention preservation (Xue et al., 2003)."
  (complement conflicting?))