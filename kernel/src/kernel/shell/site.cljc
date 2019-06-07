(ns kernel.shell.site
  "Site control shared both by clients and the server.

  Generates and receives messages at a site.
  Modifies the global context.
  Site control operations are assumed to run atomically in a single thread,
  no synchronization is performed."
  (:require [kernel.core.vector-clock :as VC]
            [kernel.core.history-buffer :as HB]
            [kernel.core.causal-dag :as CDAG]
            [kernel.core.conflict-cache :as CC]
            [kernel.core.topological-sort :as topological-sort]
            [kernel.core.movic :as MOVIC]
            [kernel.core.garbage-collector :as GC]
            [kernel.core.compound-operation :as CO]
            [kernel.core.feature-model :as FM]
            [kernel.core.message :as message]
            [kernel.shell.context :refer [*context*]]
            [kernel.helpers :refer [log]]
            #?(:clj  [taoensso.tufte :as tufte :refer (defnp p profiled profile)]
               :cljs [taoensso.tufte :as tufte :refer-macros (defnp p profiled profile)])))

(defn initialize-context-mesh-topology
  "Initializes global context for a new site in a mesh topology.
  Called when the site is ready to generate and receive operations."
  [site-ID initial-FM]
  (let [initial-FM (FM/initialize initial-FM)]
    {:site-ID site-ID
     :VC      (atom (VC/initialize))
     :CDAG    (atom (CDAG/initialize))
     :base-FM (atom initial-FM)
     :HB      (atom (HB/initialize))
     :CC      (atom (CC/initialize))
     :MCGS    (atom (MOVIC/MCGS-initialize))
     :FM      (atom initial-FM)
     :GC      (atom (GC/initialize))}))

(defn next-FM
  "Based on the result the MOVIC algorithm returned, checks whether
  one CG was produced, in that case applying and returning the correct
  feature model. Otherwise, returns a conflict descriptor."
  [MCGS CDAG HB CC base-FM]
  (if (= (count MCGS) 1)
    (log "no conflict occured, producing feature model")
    (log "conflicts occured," (count MCGS) "maximum compatible groups created"))
  (if (= (count MCGS) 1)
    (topological-sort/apply-compatible* CDAG HB base-FM (first MCGS))
    (MOVIC/conflict-descriptor MCGS CDAG HB CC)))

(defn receive-operation!
  "Receives an operation message at a site.
  Extracts the operation from the message, then updating the global
  context.
  Calls the MOVIC algorithm with the new operation *after* the CDAG,
  HB and CC have been updated.
  Returns the (updated) current feature model."
  [message]
  (log "receiving operation message from" (message/get-site-ID message))
  (let [CO (message/operation->CO message)]
    (swap! (*context* :VC) #(VC/_merge (VC/increment % (*context* :site-ID)) (CO/get-VC CO)))
    (swap! (*context* :CDAG) #(CDAG/insert % @(*context* :HB) CO))
    (swap! (*context* :HB) #(HB/insert % CO))
    (swap! (*context* :GC) #(GC/insert % (message/get-site-ID message) (CO/get-VC CO)))
    (swap! (*context* :CC) #(CC/with-most-recent % (CO/get-ID CO)))
    (swap! (*context* :MCGS) #(MOVIC/MOVIC % CO @(*context* :CDAG) @(*context* :HB) @(*context* :base-FM) (*context* :CC)))
    (swap! (*context* :CC) #(CC/with-most-recent % nil))    ; not required, just to be clear
    (let [next-FM (next-FM @(*context* :MCGS) @(*context* :CDAG) @(*context* :HB) @(*context* :CC) @(*context* :base-FM))]
      (reset! (*context* :FM) next-FM)
      next-FM)))

(defn receive-heartbeat!
  "Receives a heartbeat message at a site.
  Updates the global context and returns the current feature model."
  [message]
  (log "receiving heartbeat message from" (message/get-site-ID message))
  (swap! (*context* :VC) #(VC/_merge (VC/increment % (*context* :site-ID)) (message/get-VC message)))
  (swap! (*context* :GC) #(GC/insert % (message/get-site-ID message) (message/get-VC message)))
  @(*context* :FM))

(defn receive-leave!
  "Receives a leave message at a site.
  Updates the global context and returns the current feature model."
  [message]
  (log "receiving leave message from" (message/get-site-ID message))
  (let [site-ID (message/get-site-ID message)]
    (swap! (*context* :VC) #(VC/remove-site % site-ID))
    (swap! (*context* :HB) #(HB/remove-site % site-ID))
    (swap! (*context* :GC) #(GC/remove-site % site-ID)))
  @(*context* :FM))

(defn receive-message!
  "Receives a message at a site.
  If a server vector clock is attached, updates its garbage collector (irrelevant for mesh topologies).
  Checks which kind of message has been received and dispatches to the according receive function.
  Returns the (updated) current feature model."
  [message]
  (p ::receive-message!
     (when (message/get-server-VC message)
       (swap! (*context* :GC) #(GC/insert % :server (message/get-server-VC message))))
     (let [new-message (message/remove-server-VC message)]
       (case (message/get-type message)
         :heartbeat (receive-heartbeat! new-message)
         :leave (receive-leave! new-message)
         (receive-operation! new-message)))))

(defn GC!
  "Runs the garbage collector at a site.
  Updates the global context."
  []
  (p ::GC!
     (let [{CDAG    :CDAG
            HB      :HB
            base-FM :base-FM
            CC      :CC
            MCGS    :MCGS}
           (GC/GC @(*context* :GC) @(*context* :CDAG) @(*context* :HB)
                  @(*context* :base-FM) @(*context* :CC) @(*context* :MCGS))]
       (reset! (*context* :CDAG) CDAG)
       (reset! (*context* :HB) HB)
       (reset! (*context* :base-FM) base-FM)
       (reset! (*context* :CC) CC)
       (reset! (*context* :MCGS) MCGS))
     nil))