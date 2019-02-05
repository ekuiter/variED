(ns kernel.core.topological-sort
  "Sorts a set of compatible operations topologically according to [[kernel.core.compound-operation/preceding?]].

  Sometimes, a site has to apply a given set of operations to a feature model.
  The order of operations matters, but there is a solution if the operations are pairwise compatible.
  In that case, it can be proven that operations commute if they are concurrent.
  Order of operations then only matters for causal chains of operations in the set.
  For example, if {A, B, C} should be sorted where A || B and B -> C, a valid
  order can execute A at any time, but has to execute B before C.
  This corresponds to a topological sorting of the operation set using the causally-preceding relation.

  Topological sort is not guaranteed to be unique, but as concurrent operations commute,
  the resulting feature model is guaranteed to be equal for any topological sorting
  (and therefore across all sites).

  Algorithm adapted from rosettacode.org."
  (:require [clojure.set :as set]
            [kernel.core.causal-dag :as CDAG]
            [kernel.core.history-buffer :as HB]
            [kernel.core.compound-operation :as CO]
            [kernel.helpers :refer [log]]))

(defn single-dependency-map
  "Constructs a single-key dependence, represented as a map from
   item to a set of items, ensuring that item is not in the set."
  [item items]
  {item (set/difference (set items) (list item))})

(defn sources
  "Returns all keys from the argument which have no (i.e. empty) dependencies."
  [deps]
  (filter #(empty? (deps %)) (keys deps)))

(defn remove-items
  "Returns a dependence map with the specified items removed from keys
   and from all dependence sets of remaining keys."
  [deps items]
  (let [items-to-remove (set items)
        remaining-keys (set/difference (set (keys deps)) items-to-remove)
        remaining-deps (fn [x] (single-dependency-map x (set/difference (deps x) items-to-remove)))]
    (apply merge (map remaining-deps remaining-keys))))

(defn topological-sort
  "Given a dependence map assumed to have no cycles, returns a list of items
  in which each item follows all of its successors."
  [deps]
  (loop [remaining-deps deps
         result '()]
    (if (empty? remaining-deps)
      (reverse result)
      (let [ready-items (sources remaining-deps)]
        (recur (remove-items remaining-deps ready-items)
               (concat ready-items result))))))

(defn CO-dependency-map
  "Constructs a dependency map from operations to their CIPs, only including
  direct dependencies (CIP) that are in the set of operations to be sorted."
  [CDAG CO-IDs]
  (apply merge (map #(single-dependency-map % (set/intersection CO-IDs (CDAG/get-CIP CDAG %))) CO-IDs)))

(defn CO-topological-sort
  "Sorts a set of compatible operations topologically according to the causally-preceding relation."
  [CDAG CO-IDs]
  (topological-sort (CO-dependency-map CDAG CO-IDs)))

(defn apply-compatible*
  "Applies a set of compatible compound operations to a feature model.
  First, sorts the operations topologically with [[CO-topological-sort]],
  then applies the operations in that order."
  [CDAG HB FM CO-IDs]
  (log "applying a set of" (count CO-IDs) "compatible operations on a feature model")
  (->> CO-IDs
       (CO-topological-sort CDAG)
       (HB/lookup* HB)
       (CO/apply* FM)))