(ns kernel.core.garbage-collector
  "Garbage Collector, GC for short.
  Periodically prunes a site's data structures to keep them as small as possible.

  This is a non-essential performance optimization, but highly recommended
  because these data structures may grow unbounded over time;
  as many algorithms run in O(n), the system may also slow down over time.

  The pruned data structures contain operations, so a criterion for determining
  operations suitable for garbage collection is provided by [[eligible?]].
  This criterion requires the garbage collector to store the most recently received
  vector clock from every site.

  The garbage collector's data grows in O(n) where n is the number of sites in the system."
  (:require [kernel.core.vector-clock :as VC]
            [kernel.core.history-buffer :as HB]
            [kernel.core.causal-dag :as CDAG]
            [kernel.core.conflict-cache :as CC]
            [kernel.core.topological-sort :as topological-sort]
            [kernel.core.movic :as MOVIC]
            [kernel.core.compound-operation :as CO]
            [kernel.helpers :refer [log]]
            #?(:clj  [taoensso.tufte :as tufte :refer (defnp p profiled profile)]
               :cljs [taoensso.tufte :as tufte :refer-macros (defnp p profiled profile)])))

; constructor

(defn initialize
  "Initializes the garbage collector with no sites."
  []
  {})

; getters

(defn eligible?
  "Returns whether an operation may be garbage collected in O(n) for n sites
  (considering [[kernel.core.vector-clock/_<]] as O(1)).
  An operation may be garbage collected if and only if it has been causally-succeeded
  by every site in the system.
  In that case, that operation can never again cause a conflict and is safe to discard.
  **TODO**: This has some interactions with undo/redo (i.e., an operation and its successors
  must not be discarded as long as any site may still request to undo it."
  [GC CO]
  (p ::eligible?
     (->> GC
          vals
          (every? (partial VC/_< (CO/get-VC CO))))))

; methods

(defn insert
  "Updates the garbage collector's most recently received vector clock for a given site in O(1)."
  [GC site-ID VC]
  (assoc GC site-ID VC))

(defn remove-site
  "Removes the garbage collector's most recently received vector clock for a given site in O(1)."
  [GC site-ID]
  (dissoc GC site-ID))

(defn get-site-IDs
  "Returns all sites known to the local site.
  Notably, this need not include recently joined sites (for which no heartbeat has arrived yet)
  and sites which have just left (for which no leave message has arrived yet)."
  [GC]
  (keys GC))

(defn get-other-client-site-IDs
  "Returns all sites known to the local site but the server and local site.
  This is done for synchronization, where the server need not be considered as it does not
  participate in conflict resolution. Also, the server is not per se obliged to send heartbeats
  as clients when they become conflict-aware.
  The local site is, when synchronizing, already conflict-aware by definition."
  [GC own-site-ID]
  (->> (get-site-IDs GC)
       (remove #(= % :server))
       (remove #(= % own-site-ID))))

(defn get-site-VC
  "Returns the garbage collector's most recently received vector clock for a given site.
  This is useful to determine whether a site has succeeded some other vector clock."
  [GC site-ID]
  (GC site-ID))

(defn GC
  "Performs garbage collection in O(n) for n operations.
  Returns the given data structures, only pruned from any operations [[eligible?]] for garbage collection.

  Assumes that CDAG, HB, (possibly) CC and MCGS contain the same operations,
  guarantees the same as a post-condition.

  All eligible operations have been succeeded by every site, so they may be
  applied in any topological order to produce a new base feature model:
  They are all compatible, otherwise no operation could succeed them all as the system
  is frozen on conflict; and there are no holes (i.e., missing operations) because the
  operation succeeding the hole would also not be eligible because it if it was,
  the hole would have been as well."
  [GC CDAG HB base-FM CC MCGS]
  (log "running garbage collector")
  (let [eligible-CO-IDs (HB/_filter HB (partial eligible? GC))]
    (log "found" (count eligible-CO-IDs) "operations eligible for garbage collection")
    {:CDAG    (reduce CDAG/_remove CDAG eligible-CO-IDs)
     :HB      (reduce HB/_remove HB eligible-CO-IDs)
     :base-FM (topological-sort/apply-compatible* CDAG HB base-FM eligible-CO-IDs)
     :CC      (reduce CC/_remove CC eligible-CO-IDs)
     :MCGS    (reduce MOVIC/MCGS-remove MCGS eligible-CO-IDs)}))