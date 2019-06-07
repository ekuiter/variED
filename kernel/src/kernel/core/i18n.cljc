(ns kernel.core.i18n
  "Defines strings for internationalization purposes."
  (:require [kernel.core.conflict-cache :as CC]))

(def translation-map
  {[:conflict-relation :no-overwrite-features]            #(CC/make-conflict "Both operations change the attribute <i>" %1 "</i> of the feature <i>" %2 ".")
   [:conflict-relation :no-overwrite-constraints]         #(CC/make-conflict "Both operations change the attribute <i>" %1 "</i> of the constraint <i>" %2 ".")
   [:conflict-relation :no-cycles]                        (CC/make-conflict "Together, both operations may introduce a cycle to the feature model.")
   [:conflict-relation :no-graveyarded-targeted-features] #(CC/make-conflict "The feature <i>" %1 "</i> targeted by one operation is removed by the other.")
   [:conflict-relation :no-graveyarded-parent-features]   #(CC/make-conflict "The new parent feature <i>" %1 "</i> targeted by one operation is removed by the other.")
   [:conflict-relation :no-graveyarded-constraints]       #(CC/make-conflict "The constraint <i>" %1 "</i> targeted by one operation is removed by the other.")
   [:conflict-relation :group-children]                   #(CC/make-conflict "The feature <i>" %1 "</i> targeted by one operation is no longer part of an and-group.")
   [:conflict-relation :assert-no-child-added]            #(CC/make-conflict "The children features of the feature <i>" %1 "</i> have changed unexpectedly.")})

(defn t [key & args]
  (let [res (translation-map key)]
    (if (empty? args)
      res
      (apply res args))))