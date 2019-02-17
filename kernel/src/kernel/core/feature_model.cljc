(ns kernel.core.feature-model
  "Feature Model, FM for short.
  Implements a feature model representation and mutation operators.

  This is the interface to the actual application.
  Every operation on the feature model is encapsulated and may be replaced with a
  more efficient / more suitable implementation (i.e., an existing implementation).

  Here we implement a feature model as a hash table that contains a feature tree and
  constraints. This is the trivial implementation that directly corresponds to our
  concept. The feature tree is essentially a hash table from feature identifiers
  to attribute-value pairs with the following attributes:

  - *parent-ID*: identifier of the parent feature (or :graveyard for removed features, nil for the root).
    children are not saved explicitly (but implicitly) and may be stored by the implementation for
    performance reasons. In this implementation, a children cache is maintained.
  - *optional?*: boolean, whether a feature is optional or mandatory
  - *group-type*: :and, :or or :alternative
  - additional custom properties, such as name or abstract.

  The constraints are a hash table from constraint identifiers to attribute-value
  pairs with the following attributes:

  - *formula*: a propositional formula (represented as vectors of feature IDs and operators,
    including :not, :disj, :conj, :eq, and :imp)
  - *graveyarded?*: boolean, whether the constraint is removed or not

  All interactions with the feature model happen through a defined API, so the implementation
  may be changed (as long as the API is correctly implemented).
  The efficiency of the implementation is critical and O(1) is desired (and possible for most functions).
  Our concept is tailored towards not-extended, no-cardinalities feature models with arbitrary cross-tree
  constraints and group types/optional flags. The approach is certainly adaptable to other FM types, but
  this requires touching the conflict relation.
  This implementation is assumed to be *mutation-free*, i.e. mutating functions always return a mutated
  (structurally sharing) copy of the original. Also this API defines certain data types (i.e., sets)
  to be returned. This should be respected for efficiency reasons.

  Before mutation, the parameters have to be checked (does the feature actually exist etc.) to detect
  mistakes and manipulation attempts.
  **TODO*: Right now, the implementation assumes that does not happen.
  The passed feature model, however, does not have to be checked. The implementation may assume that
  the passed feature model is valid and free of any inconsistencies.
  Provided that all other parameters are then valid, the implementation is expected to again return
  a consistent modified feature model."
  (:require [kernel.helpers :as helpers]
            [clojure.set :as set]
            #?(:clj  [taoensso.tufte :as tufte :refer (defnp p profiled profile)]
               :cljs [taoensso.tufte :as tufte :refer-macros (defnp p profiled profile)])))

; constructor

(defn initialize
  "For a given initial representation of a feature model, initializes
  the feature model (if necessary) for other implementation functions to use.

  In this specific implementation, the feature model is expected as a hash table with the following keys:

  - :features is a feature tree as described above
  - :constraints is a constraint map as described above

  A cache with the key :children-cache is created for saving children identifiers
  so that the tree can be efficiently traversed in both directions.
  The graveyard is initially expected to be empty.
  OPTIMIZE: Instead of transferring the initialized feature model over the wire,
  we could just transfer the uninitialized feature model and build the children
  cache at the client (to save bandwidth)."
  [FM]
  (assoc FM :children-cache
    (reduce-kv (fn [acc ID {parent-ID :parent-ID}]
                 (update acc parent-ID #(if % (conj % ID) #{ID})))
               {} (FM :features))))

; default values

(defn default-feature-parent
  "Returns the default parent for a newly created feature.
  Newly created features are not part of the feature tree until explicitly inserted and therefore graveyarded."
  [] :graveyard)

(defn default-feature-optional?
  "Returns the default optional attribute for a newly created feature.
  By convention, newly created features are optional."
  []
  true)

(defn default-feature-group-type
  "Returns the default group type attribute for a newly created feature.
  By convention, newly created features form an and group."
  []
  :and)

(defn default-constraint-graveyarded?
  "Returns the default graveyarded attribute for a newly created constraint.
  Newly created constraints are graveyarded until explicitly shown."
  []
  true)

(defn default-constraint-formula
  "Returns the default formula attribute for a newly created constraint.
  We start with no formula at all."
  []
  nil)

; getters

(defn get-feature-parent-ID
  "Returns the identifier of the given feature's parent.
  Returns nil for the root feature.
  Returns :graveyard for explicitly removed features.
  A return value other than :graveyard may still mean that the feature is graveyarded implicitly."
  [FM ID]
  (get-in FM [:features ID :parent-ID]))

(defn get-feature-children-IDs
  "Returns a set of all immediate children identifiers for a given feature."
  [FM ID]
  (get-in FM [:children-cache ID] #{}))

(defn get-feature-optional?
  "Returns the boolean optional flag of a feature."
  [FM ID]
  (get-in FM [:features ID :optional?]))

(defn get-feature-group-type
  "Returns the group type of a feature.
  This includes :and, :or and :alternative."
  [FM ID]
  (get-in FM [:features ID :group-type]))

(defn get-feature-property
  "Returns the value of a custom property of the given feature.
  The implementation may define which properties are allowed here (the same as in the setter).
  Additional property validation has to be done locally at generation time and in the conflict relation."
  [FM ID property]
  (get-in FM [:features ID property]))

(defn get-constraint-formula
  "Returns the formula of a constraint."
  [FM ID]
  (get-in FM [:constraints ID :formula]))

(defn get-constraint-graveyarded?
  "Returns the boolean graveyarded flag of a constraint."
  [FM ID]
  (get-in FM [:constraints ID :graveyarded?]))

(defn referenced-feature-ID-set [formula]
  (if (vector? formula)
    (reduce #(set/union %1 (referenced-feature-ID-set %2))
            #{} (subvec formula 1))
    #{formula}))

(defn get-constraint-referenced-feature-IDs
  "Returns a set of all identifiers of features referenced in a constraint's propositional formula."
  [FM ID]
  (if-let [formula (get-constraint-formula FM ID)]
    (referenced-feature-ID-set formula)
    #{}))

; mutations

(defn create-feature
  "Creates a new feature with the given new identifier.
  Returns the new feature model or, in case the identifier already exists, the unchanged feature model.
  Uses the default attribute values defined above.
  (The ID should be a globally new identifier for each created feature, so this function is not
  usually expected to be called twice with the same identifier.)"
  [FM ID]
  (if (contains? (FM :features) ID)
    FM
    (assoc-in FM [:features ID]
              {:parent-ID  (default-feature-parent)
               :optional?  (default-feature-optional?)
               :group-type (default-feature-group-type)})))

(defn set-feature-parent-ID
  "Sets the identifier of the given feature's parent.
  For the value nil, sets the root feature.
  For the value :graveyard, removes the given feature and its subtree (while keeping all metadata)."
  [FM ID parent-ID]
  (let [new-FM (-> FM
                   (assoc-in [:features ID :parent-ID] parent-ID)
                   ; update the children cache
                   (update-in [:children-cache (get-in FM [:features ID :parent-ID])]
                              #(disj % ID)))]
    (if (= parent-ID :graveyard)
      new-FM                                                ; it is unnecessary to cache removed features
      (update-in new-FM
                 [:children-cache parent-ID]
                 #(if % (conj % ID) #{ID})))))

(defn set-feature-optional?
  "Sets the given feature's optional flag."
  [FM ID optional?]
  (assoc-in FM [:features ID :optional?] optional?))

(defn set-feature-group-type
  "Sets the given feature's group type."
  [FM ID group-type]
  (assoc-in FM [:features ID :group-type] group-type))

(defn set-feature-property
  "Sets the value of a custom property of the given feature. See [[get-feature-property]]."
  [FM ID property value]
  (assoc-in FM [:features ID property] value))

(defn create-constraint
  "Creates a new constraint with the given new identifier.
  Returns the new feature model or, in case the identifier already exists, the unchanged feature model.
  Uses the default attribute values defined above.
  (The ID should be a globally new identifier for each created feature, so this function is not
  usually expected to be called twice with the same identifier.)"
  [FM ID]
  (if (contains? (FM :constraints) ID)
    FM
    (assoc-in FM [:constraints ID]
              {:graveyarded? (default-constraint-graveyarded?)
               :formula      (default-constraint-formula)})))

(defn set-constraint-graveyarded?
  "Sets the given constraint's graveyarded flag."
  [FM ID graveyarded?]
  (assoc-in FM [:constraints ID :graveyarded?] graveyarded?))

(defn set-constraint-formula
  "Sets the given constraint's formula."
  [FM ID formula]
  (assoc-in FM [:constraints ID :formula] formula))

; helpers for conflict detection

(defn root?
  "Returns whether the given feature is the root feature."
  [FM ID]
  (nil? (get-feature-parent-ID FM ID)))

(defn graveyarded-feature?
  "Returns whether the given feature is im- or explicitly graveyarded."
  [_FM _ID]
  (p ::graveyarded-feature?
     (loop [FM _FM
            ID _ID]
       (if-let [parent-ID (get-feature-parent-ID FM ID)]
         (or (= parent-ID :graveyard)
             (recur FM parent-ID))
         false))))

(defn graveyarded-constraint?
  "Returns whether the given constraint is im- or explicitly graveyarded."
  [FM ID]
  (p ::graveyarded-constraint?
     (or (get-constraint-graveyarded? FM ID)
         (some (partial graveyarded-feature? FM) (get-constraint-referenced-feature-IDs FM ID)))))

(defn part-of-and-group?
  "Returns whether the given feature is included in an and group.
  The root feature is, by convention, considered as part of an and group
  (this avoids a special case in the conflict relation to guarantee that the root is always mandatory)."
  [FM ID]
  (if-let [parent-ID (get-feature-parent-ID FM ID)]
    (= (get-feature-group-type FM parent-ID) :and)
    true))

(defn cycle-in-path-to-root?
  "Returns whether a feature's path to root contains itself.
  This makes use of or's short-circuiting behaviour to guarantee termination."
  [FM ID parent-ID]
  (if-let [next-parent-ID (get-feature-parent-ID FM parent-ID)]
    (or (= next-parent-ID ID)
        (recur FM ID next-parent-ID))
    false))

(defn introduces-cycle?
  "Determines whether executing the given set-feature-parent operation would introduce
  a cycle in the graph. Note that this does not require a complex cycle check on the whole
  graph, only the feature's path to root (or lack thereof) has to be investigated.

  As the simple hash-table implementation just applies primitive operations in a dumb way
  we can assume this application to work and then check whether a cycle is included.
  Other implementations may not allow applying this primitive operation when it introduces
  a cycle, or may throw exceptions, so they may wish to customize this (e.g., a cycle is
  introduced if and only if a respective exception is thrown)."
  [FM ID parent-ID]
  (p ::introduces-cycle?
     (-> FM
         (set-feature-parent-ID ID parent-ID)
         (cycle-in-path-to-root? ID parent-ID))))

(defn attribute=
  "Determines whether two attribute values (including custom properties) are the same.
  Should be a value-based equality. When only primitive values are used, Clojure equality
  is sufficient (not necessarily when complex custom properties are included)."
  [attribute-a attribute-b]
  (= attribute-a attribute-b))

(defn _=
  "Determines whether two feature models are the same (deep equality).
  **OPTIMIZE**: This is only needed for testing purposes."
  [FM-a FM-b]
  (and (= (FM-a :features) (FM-b :features))
       (= (FM-a :constraints) (FM-b :constraints))))

(defn semantic-rules
  "A sequence of additional semantic rules to validate in conflict detection.
  A semantic rule is a function taking a feature model that returns true when a conflict is present.

  Here, this sequence is hard-coded. More effort is needed to dynamically en- or disable semantic
  rules because this has to be synchronized across all sites."
  []
  (helpers/semantic-rules))