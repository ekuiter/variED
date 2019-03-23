(ns kernel.core.compound-operation
  "Compound Operation, CO for short.
  Compound operations are sequences of primitive operations ([[kernel.core.primitive-operation]]).
  They correspond to feature modeling operations.

  They are considered atomic as they have to be sent and received together (so that no
  other operations interleave). Compound operations also serve as input to the MOVIC
  algorithm ([[kernel.core.movic]]) to determine conflicts.

  We provide an initial set of compound operations which may be extended. Below we give
  some guidance when designing new compound operations.

  Compound operations have preconditions which should hold when the operation is generated
  (which is easy), but also whenever it is applied on another site's feature model - this has
  to be ensured by the conflict detection ([[kernel.core.conflict-relation]]).
  For example, create-feature-above requires the supplied features to be siblings.

  Some compound operations (e.g., create-feature-above) use information from the current
  feature model at generation time. This is legitimate, but may result in additional
  preconditions (e.g., supplied features must be siblings).

  We always send compound operations over the wire, which in turn always consist of
  primitive operations. This makes it easy to compose compound operations, by just
  flattening their respective primitive operation sequences.

  Compound operations should avoid setting the same feature attribute multiple times as
  this may raise false positives. For example, if a compound operation sets an attribute
  from A to B and later back to A, this operation has no net impact on said attribute.
  Nevertheless, this will cause a conflict with any other concurrent operation that
  targets the same attribute.

  If a compound operation has to set the same feature attribute twice nonetheless,
  it is recommended to simplify them locally at generation time. For example,
  two updates targeting the same attribute can be merged into one.
  In this initial set of compound operations, we use local simplification to filter
  nop primitive operations from compound operations, as they have no effect to the
  feature model ([[kernel.core.primitive-operation/remove-nop]]).

  Some of the compound operations' preconditions introduce false-positives.
  For example, concurrent create-feature-above root and remove-feature root is considered
  a conflict, but may not be perceived as one.
  We argue that this is useful behaviour, as these cases may still be perceived conflicts,
  at least they target closely related features.
  Further, these preconditions help guaranteeing basic consistency properties like the
  single-root rule ([[remove-feature]]) and are simple to check and implement.

  **TODO**: We currently do not consider the order of feature siblings or constraints.
  This means it is impossible to reorder feature siblings or constraints, or to create
  sibling features. We could introduce a reordering operation that treats concurrent
  writes to the same group of children as conflicts."
  (:require [clojure.string :as string]
            [kernel.core.vector-clock :as VC]
            [kernel.core.feature-model :as FM]
            [kernel.core.primitive-operation :as PO]
            [kernel.helpers :refer [log]]
            #?(:clj  [taoensso.tufte :as tufte :refer (defnp p profiled profile)]
               :cljs [taoensso.tufte :as tufte :refer-macros (defnp p profiled profile)])))

; constructor

(defn make
  "For a sequence of primitive operations, creates a compound operation.
  Every compound operation has an identifier to distinguish it from other
  compound operations with the same PO sequence and to allow for undo/redo.
  Every CO carries a vector clock to relate it causally to other operations."
  [PO-sequence ID VC]
  {:PO-sequence PO-sequence
   :ID          ID
   :VC          VC})

; getters and setters

(defn get-ID
  "Returns the identifier of a compound operation."
  [CO]
  (CO :ID))

(defn get-VC
  "Returns the vector clock of a compound operation."
  [CO]
  (CO :VC))

(defn update-VC
  "Updates the vector clock of a compound operation."
  [CO f]
  (update CO :VC f))

(defn get-PO-sequence
  "Returns the sequence of primitive operations of a compound operation."
  [CO]
  (CO :PO-sequence))

; causal ordering

(defn preceding?
  "Returns whether a compound operation causally precedes another compound operation.
  **OPTIMIZE**: Possibly, we could also check whether CO-a is in CP(CO-b), this would be O(1)."
  [CO-a CO-b]
  (p ::preceding?
     (VC/_< (CO-a :VC) (CO-b :VC))))

(defn concurrent?
  "Returns whether two compound operations are concurrent, i.e., no one causally precedes the other."
  [CO-a CO-b]
  (p ::concurrent?
     (not (or (preceding? CO-a CO-b)
              (preceding? CO-b CO-a)))))

; PO sequences

(defn make-PO-sequence
  "Simplifies a sequence of primitive operations by removing any nop POs."
  [& POs]
  (p ::make-PO-sequence
     (PO/remove-nop POs)))

(defn compose-PO-sequences
  "Composes multiple compound operations into one compound operation."
  [& PO-sequences]
  (log "composing" (count PO-sequences) "primitive operation sequences")
  (p ::compose-PO-sequences
     (flatten PO-sequences)))

(defn invert-PO-sequence
  "Inverts a compound operation by inverting and reversing its primitive operations (socks-shoes property)."
  [PO-sequence]
  (p ::invert-PO-sequence
     (PO/remove-nop (map PO/invert (reverse PO-sequence)))))

; operation application

(defn _apply
  "Applies a given compound operation to a feature model.
  Does so by subsequently applying the compound operation's primitive operations in order."
  [FM CO]
  (p ::_apply
     (reduce PO/_apply FM (CO :PO-sequence))))

(defn apply*
  "Applies a sequence of compound operations in order to a feature model."
  [FM COs]
  (p ::apply*
     (reduce _apply FM COs)))

; operation definitions

(defn create-feature-below
  "Creates a feature below another feature.
  The parent feature must be valid."
  [_FM parent-ID]
  (log "CO create-feature-below" parent-ID)
  (p ::create-feature-below
     (let [PO-create-feature (PO/create-feature)
           ID (PO/get-ID PO-create-feature)]
       (make-PO-sequence
         PO-create-feature
         (PO/update-feature ID :parent-ID (FM/default-feature-parent) parent-ID)))))

(defn create-feature-above
  "Creates a feature above a set of sibling features.
  The set must not be empty and all contained features must be valid and siblings.
  Their parent must be the same as in the operation's generation context.
  This is guaranteed automatically by the fact that competing concurrent updates
  on any parent cause conflicts (because both operations set the parent)."
  [FM & IDs]
  (log "CO create-feature-above" (string/join " " IDs))
  (p ::create-feature-above
     (let [parent-ID (FM/get-feature-parent-ID FM (first IDs))
           PO-create-feature (PO/create-feature)
           ID (PO/get-ID PO-create-feature)]
       (apply make-PO-sequence
              PO-create-feature
              (concat (when parent-ID
                        (list (PO/update-feature            ; update group type if not creating above root
                                ID :group-type
                                (FM/default-feature-group-type)
                                (FM/get-feature-group-type FM parent-ID))))
                      (list (PO/update-feature ID :parent-ID (FM/default-feature-parent) parent-ID))
                      (map #(PO/update-feature % :parent-ID parent-ID ID) IDs))))))

(defn remove-feature-subtree
  "Removes an entire feature subtree rooted at a feature.
  The feature must be valid."
  [FM ID]
  (log "CO remove-feature-subtree" ID)
  (p ::remove-feature-subtree
     (make-PO-sequence
       (PO/update-feature
         ID :parent-ID
         (FM/get-feature-parent-ID FM ID)
         :graveyard))))

(defn move-feature-subtree
  "Moves an entire feature subtree rooted at a feature below another feature.
  Both must be valid features.
  The targeted feature subtree must not lie below the moved feature subtree."
  [FM ID parent-ID]
  (log "CO move-feature-subtree" ID parent-ID)
  (p ::move-feature-subtree
     (make-PO-sequence
       (PO/update-feature
         ID :parent-ID
         (FM/get-feature-parent-ID FM ID)
         parent-ID))))

(defn remove-feature
  "Removes a single feature.
  The feature must be valid.
  The feature's children must be the same as in the operation's generation context,
  otherwise concurrently added or removed child features may not be handled as expected.
  Removing child features provokes a conflict with the updates in the children's parents.
  Adding child features, however, does not conflict with this operation by default, this is
  forced by an assert operation ([[kernel.core.primitive-operation/assert-no-child-added]]).
  Also, the feature's parent must be the same as in the generation context.
  This is guaranteed because remove-feature also sets the feature's parent to :graveyard
  and this conflicts with any other updates on the feature's parent.

  Special care has to be taken when removing the root feature, as the feature tree is required
  to have a single root at all times. In particular, the root may only be removed if it has
  exactly one child feature. Any other competing concurrent operations that add or remove
  child features below the root must then be considered conflicting.
  Both cases are covered by the same rules as above:
  Competing removes conflict as they set the feature's parent, while the remove-root operation
  sets the child's parent to nil. Competing additions conflict per the assertion operation.
  In other words, no more precautions are necessary to guarantee the single-root rule.

  As for said assert operation, we insert it somewhere into the compound operation.
  It only serves as a conflict generator with update operations that add a child to the removed
  feature. When inverting this operation for undo/redo, it is kept unchanged. For undo, it could
  be a nop because the inverse of this operation un-removes the feature and moves the children
  (and as a concurrent inverse, it assumes that in the meanwhile the feature was not un-removed
  because that would generate a conflicting update, provoking a new version) and therefore,
  the children list was not manipulated, which guarantees the precondition automatically.
  But for redo, the assert operation needs to be preserved (and because of the above guarantee,
  it does not impact undo at all). Where the assert operation is placed is irrelevant, so order
  is also irrelevant for undo/redo."
  [FM ID]
  (log "CO remove-feature" ID)
  (p ::remove-feature
     (let [parent-ID (FM/get-feature-parent-ID FM ID)
           children-IDs (FM/get-feature-children-IDs FM ID)]
       (apply make-PO-sequence
              (PO/assert-no-child-added ID)
              (conj (map #(PO/update-feature % :parent-ID ID parent-ID) children-IDs)
                    (PO/update-feature ID :parent-ID parent-ID :graveyard))))))

(defn set-feature-optional?
  "Sets the optional attribute of a feature.
  The feature must be valid."
  [FM ID optional?]
  (log "CO set-feature-optional?" ID optional?)
  (p ::set-feature-optional?
     (make-PO-sequence (PO/update-feature ID :optional? (FM/get-feature-optional? FM ID) optional?))))

(defn set-feature-group-type
  "Sets the group type attribute of a feature.
  The feature must be valid."
  [FM ID group-type]
  (log "CO set-feature-group-type" ID group-type)
  (p ::set-feature-group-type
     (make-PO-sequence (PO/update-feature ID :group-type (FM/get-feature-group-type FM ID) group-type))))

(defn set-feature-property
  "Sets some additional property of a feature.
  These may be arbitrary properties such as name, hidden, abstract or description.
  The feature must be valid."
  [FM ID property value]
  (log "CO set-feature-property" ID property value)
  (p ::set-feature-property
     (make-PO-sequence (PO/update-feature ID property (FM/get-feature-property FM ID property) value))))

(defn create-constraint
  "Creates a constraint and initializes it with a given propositional formula."
  [_FM formula]
  (log "CO create-constraint" formula)
  (p ::create-constraint
     (let [PO-create-constraint (PO/create-constraint)
           ID (PO/get-ID PO-create-constraint)]
       (make-PO-sequence
         PO-create-constraint
         (PO/update-constraint ID :graveyarded? (FM/default-constraint-graveyarded?) false)
         (PO/update-constraint ID :formula (FM/default-constraint-formula) formula)))))

(defn set-constraint
  "Sets the propositional formula of a constraint."
  [FM ID formula]
  (log "CO set-constraint" ID formula)
  (p ::set-constraint
     (make-PO-sequence (PO/update-constraint ID :formula (FM/get-constraint-formula FM ID) formula))))

(defn remove-constraint
  "Removes a constraint."
  [FM ID]
  (log "CO remove-constraint" ID)
  (p ::remove-constraint
     (make-PO-sequence (PO/update-constraint ID :graveyarded? (FM/get-constraint-graveyarded? FM ID) true))))