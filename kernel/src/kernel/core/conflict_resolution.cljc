(ns kernel.core.conflict-resolution
  "Utilities for assisting in conflict resolution."
  (:require [kernel.core.vector-clock :as VC]
            [kernel.core.history-buffer :as HB]
            [kernel.core.conflict-cache :as CC]
            [kernel.core.garbage-collector :as GC]
            [kernel.core.topological-sort :as topological-sort]
            [kernel.core.compound-operation :as CO]
            [kernel.core.movic :as MOVIC]
            [kernel.helpers :refer [log]]
            #?(:clj  [taoensso.tufte :as tufte :refer (defnp p profiled profile)]
               :cljs [taoensso.tufte :as tufte :refer-macros (defnp p profiled profile)])))

(defn conflict-aware?
  "Determines whether another site is aware of a conflict, i.e., is in conflict resolution mode.
  Only called when the local site is already in conflict resolution.
  This is a sufficient, but not necessary condition for synchronizing all sites, i.e.,
  every site will eventually be conflict-aware according to this function, but may
  also be conflict-aware already when this function does not say so (because the local
  site need not already have seen the same conflicts as the checked site)."
  [GC site-ID HB CC]
  (p ::conflict-aware?
     (let [res (some #(let [CO-ID-a (first %)
                            CO-ID-b (first (disj % CO-ID-a))]
                        (and (VC/_< ((HB/lookup HB CO-ID-a) :VC) (GC/get-site-VC GC site-ID))
                             (VC/_< ((HB/lookup HB CO-ID-b) :VC) (GC/get-site-VC GC site-ID))))
                     (CC/get-all-conflicts CC))]
       (log "conflict-aware?" site-ID res)
       res)))

(defn synchronized?
  "Determines whether all sites are aware of a conflict, i.e., are in conflict resolution mode.
  Until synchronization, no resolution and voting is allowed.
  When all sites are conflict-aware (i.e., frozen), no more operations can be in flight - because
  if there were some, they would have been generated in a frozen state, which is not allowed."
  [GC HB CC]
  (p ::synchronized?
     (let [res (every? #(conflict-aware? GC % HB CC) (GC/get-site-IDs GC))]
       (log "synchronized?" res)
       res)))

(defn conflict-descriptor
  "A conflict descriptor contains information about a conflict situation.
  It consists of a map of versions, where a CG's string hash is mapped to a sequence
  of topologically ordered operations. Further, a neutral CG is included under
  they key :neutral. The :conflicts key then maps from CG hashes to maps, which
  in turn map from operations to another map, which maps from operations to conflicts.
  The :metadata key maps from operation IDs to metadata, e.g., human-readable descriptions.
  The :synchronized key maps to a boolean which indicates whether all sites are synchronized yet."
  [MCGS CDAG HB CC GC]
  (p ::conflict-descriptor
     (let [versions (reduce (fn [acc MCG]
                              (assoc acc (MOVIC/MCG-identifier MCG)
                                         (topological-sort/CO-topological-sort CDAG MCG)))
                            {} (MOVIC/MCGs MCGS))
           versions (assoc versions :neutral (topological-sort/CO-topological-sort CDAG (MOVIC/neutral-CG MCGS)))
           conflicts (reduce (fn [acc MCG]
                               (assoc acc (MOVIC/MCG-identifier MCG)
                                          (reduce (fn [acc CO-ID]
                                                    (assoc acc CO-ID (CC/get-conflicts CC CO-ID)))
                                                  {} MCG)))
                             {} (MOVIC/MCGs MCGS))
           conflicts (assoc conflicts :neutral #{})
           metadata (reduce #(assoc %1 %2 (let [CO (HB/lookup HB %2)]
                                            {:description (CO/get-description CO)
                                             :icon        (CO/get-icon CO)
                                             :timestamp   (CO/get-timestamp CO)
                                             :siteID      (CO/get-site-ID CO)}))
                            {} (MOVIC/get-all-operations MCGS))]
       {:versions     versions
        :conflicts    conflicts
        :metadata     metadata
        :synchronized (synchronized? GC HB CC)})))