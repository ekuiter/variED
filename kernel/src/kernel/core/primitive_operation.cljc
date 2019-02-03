(ns kernel.core.primitive-operation
  "Primitive operation, PO for short.
  Primitive operations create or update only one object in a feature model at a time.
  They are building blocks for more complex compound operations ([[kernel.core.compound-operation]]).

  Primitive operations are also used to detect conflicts for competing operations ([[kernel.core.conflict-relation]])."
  (:require [kernel.helpers :as helpers]
            [kernel.core.feature-model :as FM]))

; getters

(defn get-type
  "Returns the type of a primitive operation."
  [PO]
  (PO :type))

(defn get-ID
  "Returns the identifier in the feature model that an update PO targets."
  [PO]
  (PO :ID))

(defn get-attribute
  "Returns the attribute of a feature that an update PO targets."
  [PO]
  (PO :attribute))

(defn get-old-value
  "Returns the old value of a feature attribute that an update PO targets."
  [PO]
  (PO :old-value))

(defn get-new-value
  "Returns the new value of a feature attribute that an update PO targets."
  [PO]
  (PO :new-value))

(defn get-feature-attribute
  "Returns the current value of a targeted feature attribute in a given feature model."
  [FM ID attribute]
  (case attribute
    :parent-ID (FM/get-feature-parent-ID FM ID)
    :optional? (FM/get-feature-optional? FM ID)
    :group-type (FM/get-feature-group-type FM ID)
    (FM/get-feature-property FM ID attribute)))

; operation definitions

(defn nop
  "An operation that does nothing.
  Is filtered out when building a compound operation.
  Useful for nullifying the effect of an operation when inverting it."
  []
  nil)

(defn remove-nop
  "Removes all nop operations from a sequence of primitive operations."
  [POs]
  (filter some? POs))

(defn create-feature
  "Creates a new feature in the feature tree that is assumed to have the default
  values defined in [[kernel.core.feature-model]].
  Newly created features are not part of the feature tree until explicitly inserted."
  []
  {:type :create-feature
   :ID   (helpers/generate-ID)})

(defn update-feature
  "Updates a single attribute of a feature.
  For conflict detection and undo/redo, it is also necessary to store an attribute's old value for every update."
  [ID attribute old-value new-value]
  {:type      :update-feature
   :ID        ID
   :attribute attribute
   :old-value old-value
   :new-value new-value})

(defn create-constraint
  "Creates a new constraint."
  []
  {:type :create-constraint
   :ID   (helpers/generate-ID)})

(defn update-constraint
  "Updates a single attribute of a constraint.
  For conflict detection and undo/redo, it is also necessary to store an attribute's old value for every update."
  [ID attribute old-value new-value]
  {:type      :update-constraint
   :ID        ID
   :attribute attribute
   :old-value old-value
   :new-value new-value})

(defn assert-no-child-added
  "Asserts that no competing operations add children to the targeted feature.
  Required to ensure the preconditions of [[kernel.core.compound-operation/remove-feature]].
  This assertion operation has no actual execution effect on the feature model,
  it only affects the conflict detection."
  [ID]
  {:type :assert-no-child-added
   :ID   ID})

; inverse operations

(defmulti invert
          "Generates an inverse for a primitive operation.
          An inverse nullifies the original operation's execution effect.
          Inverting an inverse yields the original operation.

          Create operations do not visibly affect the feature model, they
          only add an entry to the feature tree/constraint map.
          As such, inverting a create operation does not do anything and
          can be a nop.

          Update operations are inverted by swapping their old and new values.

          Assert operations are kept unchanged as discussed in
          [[kernel.core.compound-operation/remove-feature]]."
          (fn [PO] (PO :type)))

(defmethod invert :create-feature [_PO]
  (nop))

(defmethod invert :update-feature
  [{ID        :ID
    attribute :attribute
    old-value :old-value
    new-value :new-value}]
  (update-feature ID attribute new-value old-value))

(defmethod invert :create-constraint [_PO]
  (nop))

(defmethod invert :update-constraint
  [{ID        :ID
    attribute :attribute
    old-value :old-value
    new-value :new-value}]
  (update-constraint ID attribute new-value old-value))

(defmethod invert :assert-no-child-added [PO] PO)

; operation application

(defmulti _apply
          "Applies a given primitive operation to a feature model.
          Utilizes the feature model implementation."
          (fn [_FM PO] (PO :type)))

(defmethod _apply :create-feature
  [FM {ID :ID}]
  (FM/create-feature FM ID))

(defmethod _apply :update-feature
  [FM
   {ID        :ID
    attribute :attribute
    new-value :new-value}]
  (case attribute
    :parent-ID (FM/set-feature-parent-ID FM ID new-value)
    :optional? (FM/set-feature-optional? FM ID new-value)
    :group-type (FM/set-feature-group-type FM ID new-value)
    (FM/set-feature-property FM ID attribute new-value)))

(defmethod _apply :create-constraint
  [FM {ID :ID}]
  (FM/create-constraint FM ID))

(defmethod _apply :update-constraint
  [FM
   {ID        :ID
    attribute :attribute
    new-value :new-value}]
  (case attribute
    :graveyarded? (FM/set-constraint-graveyarded? FM ID new-value)
    :formula (FM/set-constraint-formula FM ID new-value)))

(defmethod _apply :assert-no-child-added [FM _PO] FM)