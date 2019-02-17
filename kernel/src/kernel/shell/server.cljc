(ns kernel.shell.server
  "Server site control.

  Generates and receives messages at the server site.
  Modifies the global context.
  Site control operations are assumed to run atomically in a single thread,
  no synchronization is performed."
  (:require [kernel.core.vector-clock :as VC]
            [kernel.core.garbage-collector :as GC]
            [kernel.core.message :as message]
            [kernel.shell.site :as site]
            [kernel.shell.context :refer [*context* set-context]]
            [kernel.helpers :refer [log]]
            #?(:clj  [taoensso.tufte :as tufte :refer (defnp p profiled profile)]
               :cljs [taoensso.tufte :as tufte :refer-macros (defnp p profiled profile)])))

; constructors

(defn GC-filter
  "Removes the server coordinate from a vector clock.
  This is required so that no client site unnecessarily takes into account the server coordinate."
  [server-VC]
  (dissoc server-VC :server))

(defn initialize-context-star-topology
  "Initializes global context for the server site in a star topology.
  Called when first client site connects and requests to edit a given feature model.

  The server receives all operations eventually. The server's vector clock
  is the maximum of all its received operation's vector clocks (save for its
  own vector clock coordinate)."
  [initial-FM]
  (log "initializing server context")
  (-> (site/initialize-context-mesh-topology :server initial-FM)
      (assoc :GC (atom {:server (VC/initialize)}))
      (assoc :offline-sites (atom #{}))))

(defn initialize-context-star-topology!
  "Initializes global context for the server site in a star topology.
  Resets the global context."
  [initial-FM]
  (p ::initialize-context-star-topology!
     (set-context (initialize-context-star-topology initial-FM))))

; server API

(defn generate-heartbeat!
  "Generates a heartbeat message at the server site.
  Only required to improve the performance of garbage collection.
  Only sent explicitly if no messages have been forwarded for a while."
  []
  (log "generating heartbeat message")
  (p ::generate-heartbeat!
     (swap! (*context* :VC) #(VC/increment % :server))      ; not strictly necessary as we ignore this coordinate
     (let [message (message/make-heartbeat (GC-filter @(*context* :VC)) :server)]
       (swap! (*context* :GC) #(GC/insert % (message/get-site-ID message) (message/get-VC message)))
       message)))

(defn forward-message!
  "Receives, processes and forwards a message from a client site to all other client sites.
  If a site has left in the meantime, removes its vector clock coordinate from forwarded messages
  (as other sites have already been notified about the leaving site).
  Returns the message that is to be forwarded."
  [message]
  (log "forwarding message from" (message/get-site-ID message))
  (p ::forward-message!
     (let [new-message (message/update-VC message #(reduce VC/remove-site % @(*context* :offline-sites)))]
       (site/receive-message! new-message)                  ; ignore returned feature model on the server
       (generate-heartbeat!)
       (swap! (*context* :GC) #(GC/insert % :server (GC-filter @(*context* :VC))))
       (message/with-server-VC new-message (GC-filter @(*context* :VC))))))

(defn site-joined!
  "Processes a newly joined site.
  Prepares an initial context for the new site.
  Updates the server's global context to include the new site.
  Generates an initial heartbeat message for the new site that is to be forwarded to other sites
  (effectively simulating that the first message received by the site is this very heartbeat).
  Returns the new site's initial context and the generated heartbeat message."
  [site-ID]
  (log "new site" site-ID "has joined, generating initial context and heartbeat message")
  (p ::site-joined!
     (let [site-VC (VC/increment (GC-filter @(*context* :VC)) site-ID)
           message (message/make-heartbeat site-VC site-ID)]
       (swap! (*context* :VC) #(VC/_merge (VC/increment % :server) site-VC))
       (swap! (*context* :GC) #(GC/insert % :server (GC-filter @(*context* :VC))))
       (swap! (*context* :GC) #(GC/insert % (message/get-site-ID message) (message/get-VC message)))
       ; if a site re-joins, it is online again (but passed a completely new context)
       (swap! (*context* :offline-sites) #(disj % site-ID))
       [{:VC      site-VC
         :CDAG    @(*context* :CDAG)
         :base-FM @(*context* :base-FM)
         :HB      @(*context* :HB)
         :CC      @(*context* :CC)
         :MCGS    @(*context* :MCGS)
         :FM      @(*context* :FM)                          ; TODO: optimize this away
         :GC      @(*context* :GC)}
        (message/with-server-VC message (GC-filter @(*context* :VC)))])))

(defn site-left!
  "Processes a leaving site.
  Generates a leave message for the new site that is to be forwarded to other sites
  (effectively simulating that the last message received by the site is this leave message).
  Adds the site to the list of offline sites so that forwarded messages can be pruned of
  this site's coordinate.
  **TODO**: Garbage collect the list of offline sites after every user has seen the leave
  (e.g., attach this to a heartbeat that everyone has to succeed)."
  [site-ID]
  (log "site" site-ID "has left, generating leave message")
  (p ::site-left!
     (let [message (message/make-leave site-ID)]
       (site/receive-leave! message)
       (swap! (*context* :offline-sites) #(conj % site-ID))
       message)))

(def GC!
  "Runs the garbage collector at a client site.
  Updates the global context."
  site/GC!)