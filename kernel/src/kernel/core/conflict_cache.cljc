(ns kernel.core.conflict-cache
  "Conflict Cache, CC for short.
  Caches all conflicts a site detected.

  The conflict cache is only a performance optimization and not essential.
  It is useful because conflict detection is pure (always yields the same results) and expensive.

  Conflicts are cached by mapping from pairs of conflicting operations to a Conflict
  record, which currently stores the human-readable reason for the conflict.

  Note that only conflicts are stored.
  If two operations are compatible, nothing is stored (this is the expected case).
  Therefore, the most recently arrived operation is saved (if any).
  This is used to identify whether the cache may be used ([[hittable?]]).

  As the conflict detection also considers conflict-succeeding operations a conflict,
  those operations will also be stored in the conflict cache.

  Without garbage collection, the conflict cache may grow quadratically with time."
  (:require [kernel.helpers :refer [log]]
            #?(:clj  [taoensso.tufte :as tufte :refer (defnp p profiled profile)]
               :cljs [taoensso.tufte :as tufte :refer-macros (defnp p profiled profile)])))

; Conflict record

(defrecord Conflict [reason])

(defn make-conflict
  "Creates a new Conflict record that includes a reason for a conflict."
  [& reason]
  (let [reason (apply str reason)]
    (log "conflict detected, reason:" reason)
    (->Conflict reason)))

(defn conflict?
  "Returns whether a given object is a Conflict record."
  [conflict]
  (instance? Conflict conflict))

; constructor

(defn initialize
  "Initializes an empty conflict cache."
  []
  {:conflicts {} :most-recent-CO-ID nil})

; getters and setters

(defn hittable?
  "Returns whether the conflict cache may be used for two particular operations in O(1).
  The conflict cache can only be hit for two operations that have not just arrived,
  as only then the cache has previously been written."
  [CC CO-ID-a CO-ID-b]
  (let [most-recent-CO-ID (CC :most-recent-CO-ID)]
    (not (or (= most-recent-CO-ID CO-ID-a)
             (= most-recent-CO-ID CO-ID-b)))))

(defn get-conflict
  "Hits the cache for two given operations in O(1).
  Returns the Conflict record of the operations conflict.
  Otherwise, returns nil.
  Requires previous check whether the cache is [[hittable?]]."
  [CC CO-ID-a CO-ID-b]
  (log "conflict cache hit for" CO-ID-a "and" CO-ID-b)
  ((CC :conflicts) (hash-set CO-ID-a CO-ID-b)))

(defn get-conflicts
  "Returns all operations conflicting with a given operation as a mapping from operation IDs
  to Conflict records."
  [CC CO-ID]
  (reduce-kv (fn [acc k v] (if (k CO-ID) (assoc acc (first (disj k CO-ID)) v) acc))
             {} (CC :conflicts)))

(defn get-all-conflicts
  "Returns all conflicts stored in the conflict cache, which are all conflicts known to the system."
  [CC]
  (keys (CC :conflicts)))

(defn with-most-recent
  "Sets the conflict cache's most recently arrived operation."
  [CC CO-ID]
  (assoc CC :most-recent-CO-ID CO-ID))

; methods

(defn insert
  "Inserts a new conflict for two operations into the conflict cache in O(1)."
  [CC CO-ID-a CO-ID-b conflict]
  (log "conflict cache written for" CO-ID-a "and" CO-ID-b "- cache now contains" (count (CC :conflicts)) "conflicts")
  (update CC :conflicts #(assoc % (hash-set CO-ID-a CO-ID-b) conflict)))

(defn _remove
  "Removes all conflicts which involve a given operation in O(n).
  Called by the garbage collector, which is in turn only called between operation
  generation/reception, i.e., the most recent compound operation is always nil
  and does not have to be checked."
  [CC CO-ID]
  (p ::_remove
     (update CC :conflicts
             (fn [conflicts]
               (reduce-kv #(if (contains? %2 CO-ID) %1 (assoc %1 %2 %3)) {} conflicts)))))