(ns kernel.core.history-buffer
  "History Buffer, HB for short.
  Serves as a central storage for operation metadata.
  Only a performance optimization and not essential.

  Operations have to be stored in various data structures of a site.
  To avoid redundancy, all operation metadata is kept in the history buffer.
  The history buffer maps operation IDs to operations, so that other data
  structures only need to save an operation's ID to be able to do a [[lookup]].
  It is guaranteed to contain operation metadata for all operations that
  have not been garbage collected.

  In contrast to other collaborative real-time editors, the history buffer
  is *not* ordered.

  Without garbage collection, the history buffer may grow linearly over time."
  (:require [kernel.core.vector-clock :as VC]
            [kernel.core.compound-operation :as CO]
            [kernel.helpers :refer [log]]
            #?(:clj  [taoensso.tufte :as tufte :refer (defnp p profiled profile)]
               :cljs [taoensso.tufte :as tufte :refer-macros (defnp p profiled profile)])))

; constructor

(defn initialize
  "Initializes a new history buffer without operations."
  []
  {})

; getters

(defn lookup
  "Returns the operation for a given operation ID in O(1), if any."
  [HB CO-ID]
  (HB CO-ID))

(defn lookup*
  "For a given sequence of operation IDs, returns the associated operations in the same order in O(n)."
  [HB CO-IDs]
  (map #(lookup HB %) CO-IDs))

(defn _filter
  "Returns a set of all operations in the history buffer that match a given predicate in O(n).
  The predicate is passed an operation."
  [HB fn]
  (p ::_filter
     (->> HB
          vals
          (filter fn)
          (map CO/get-ID)
          set)))

; methods

(defn insert
  "Inserts a newly received operation into the history buffer in O(1)."
  [HB CO]
  (log "inserting operation into history buffer with" (count HB) "operations")
  (assoc HB (CO/get-ID CO) CO))

(defn _remove
  "Removes an operation from the history buffer in O(1)."
  [HB CO-ID]
  (dissoc HB CO-ID))

(defn remove-site
  "Removes the given site from all operations' vector clocks in the history buffer in O(n)."
  [HB site-ID]
  (p ::remove-site
     (into {} (for [[CO-ID CO] HB] [CO-ID (CO/update-VC CO #(VC/remove-site % site-ID))]))))