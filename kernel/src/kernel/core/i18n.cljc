(ns kernel.core.i18n
  "Defines strings for internationalization purposes."
  (:require [kernel.core.conflict-cache :as CC]
            [kernel.core.primitive-operation :as PO]))

(def translation-map
  {[:compound-operation :create-feature-below]            #(PO/metadata :description "Create a feature below <i>" % "</i>")
   [:compound-operation :create-feature-above]            #(PO/metadata :description "Create a feature above <i>" % "</i>")
   [:compound-operation :remove-feature-subtree]          #(PO/metadata :description "Remove features below <i>" % "</i>")
   [:compound-operation :move-feature-subtree]            #(PO/metadata :description "Move feature subtree <i>" %1 "</i> below <i>" %2 "</i>")
   [:compound-operation :remove-feature]                  #(PO/metadata :description "Remove feature <i>" % "</i>")
   [:compound-operation :set-feature-optional?]           #(PO/metadata :description "Set feature <i>" %1 "</i> to " (if %2 "optional" "mandatory"))
   [:compound-operation :set-feature-group-type]          #(PO/metadata :description "Set feature <i>" %1 "</i> to " %2 "-group")
   [:compound-operation :set-feature-property]            #(PO/metadata :description "Set property <i>" %2 "</i> of feature <i>" %1 "</i> to <i>" %3 "</i>")
   [:compound-operation :create-constraint]               #(PO/metadata :description "Create constraint <i>" % "</i>")
   [:compound-operation :set-constraint]                  #(PO/metadata :description "Set constraint <i>" %1 "</i> to <i>" %2 "</i>")
   [:compound-operation :remove-constraint]               #(PO/metadata :description "Remove constraint <i>" % "</i>")

   [:conflict-relation :no-overwrite-features]            #(CC/make-conflict "Both operations change the attribute <i>" %1 "</i> of the feature <i>" %2 ".")
   [:conflict-relation :no-overwrite-constraints]         #(CC/make-conflict "Both operations change the attribute <i>" %1 "</i> of the constraint <i>" %2 ".")
   [:conflict-relation :no-cycles]                        (CC/make-conflict "Together, both operations may introduce a cycle to the feature model.")
   [:conflict-relation :no-graveyarded-targeted-features] #(CC/make-conflict "The feature <i>" % "</i> targeted by one operation is removed by the other.")
   [:conflict-relation :no-graveyarded-parent-features]   #(CC/make-conflict "The new parent feature <i>" % "</i> targeted by one operation is removed by the other.")
   [:conflict-relation :no-graveyarded-constraints]       #(CC/make-conflict "The constraint <i>" % "</i> targeted by one operation is removed by the other.")
   [:conflict-relation :group-children]                   #(CC/make-conflict "The feature <i>" % "</i> targeted by one operation is no longer part of an and-group.")
   [:conflict-relation :assert-no-child-added]            #(CC/make-conflict "The children features of the feature <i>" % "</i> have changed unexpectedly.")})

(defn t [key & args]
  (let [res (translation-map key)]
    (if (empty? args)
      res
      (apply res args))))