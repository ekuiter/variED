(ns kernel.shell.client
  "Client site control.

  Generates and receives messages at a client site.
  Modifies the global context.
  Site control operations are assumed to run atomically in a single thread,
  no synchronization is performed."
  (:require [kernel.helpers :as helpers :refer [log]]
            [kernel.core.vector-clock :as VC]
            [kernel.core.causal-dag :as CDAG]
            [kernel.core.history-buffer :as HB]
            [kernel.core.conflict-cache :as CC]
            [kernel.core.movic :as MOVIC]
            [kernel.core.garbage-collector :as GC]
            [kernel.core.compound-operation :as CO]
            [kernel.core.message :as message]
            [kernel.shell.site :as site]
            [kernel.shell.context :refer [*context* set-context]]
            #?(:clj  [taoensso.tufte :as tufte :refer (defnp p profiled profile)]
               :cljs [taoensso.tufte :as tufte :refer-macros (defnp p profiled profile)])))

; constructors

(defn initialize-context-star-topology
  "Initializes global context for a new client site in a star topology.
  Called when the site is ready to generate and receive operations
  and the server has transmitted the initial context."
  [site-ID
   {VC      :VC
    CDAG    :CDAG
    base-FM :base-FM
    HB      :HB
    CC      :CC
    MCGS    :MCGS
    FM      :FM
    GC      :GC}]
  (log "initializing client context")
  {:site-ID site-ID
   :VC      (atom VC)
   :CDAG    (atom CDAG)
   :base-FM (atom base-FM)
   :HB      (atom HB)
   :CC      (atom CC)
   :MCGS    (atom MCGS)
   :FM      (atom FM)
   :GC      (atom GC)})

(defn initialize-context-star-topology!
  "Initializes global context for a new client site in a star topology.
  Resets the global context."
  [site-ID context]
  (p ::initialize-context-star-topology!
     (set-context (initialize-context-star-topology site-ID context))))

; client API

(defn generate-operation!
  "Generates a new operation message from a sequence of primitive operations at a client site.
  The PO sequence CO is assumed to be a valid operation on the current feature model.
  No operation may be generated when the system is frozen due to conflict.

  Creates a compound operation from the PO sequence, then updates the global
  context.
  **OPTIMIZE**: Because generation happens atomically with processing and application,
  some optimizations are possible:
  Because CO was generated on the most recent CDAG and HB (and there
  is also only one CG, otherwise the system is frozen so no conflicts in CP are possible)
  CP(CO) = all operations in CDAG and HB, so this can be implemented faster than CDAG-insert
  (whereas the CIP can not be optimized easily).

  Calls the MOVIC algorithm with the new operation *after* the CDAG, HB and CC have been updated.
  **OPTIMIZE**: We know (see above), that at generation time there is only one CG and CO has
  been generated and valid (and targeted at that CG), i.e., the new MCGS will simply be
  MCGS = {old-CG + {CO}} (CO conjoined on the old CG).

  Returns the (updated) current feature model and the generated operation message."
  [PO-sequence]
  (log "generating next feature model and operation message from" (count PO-sequence) "primitive operations")
  (p ::generate-operation!
     (swap! (*context* :VC) #(VC/increment % (*context* :site-ID)))
     (let [CO (CO/make PO-sequence (helpers/generate-ID) @(*context* :VC) (*context* :site-ID))]
       (swap! (*context* :CDAG) #(CDAG/insert % @(*context* :HB) CO))
       (swap! (*context* :HB) #(HB/insert % CO))
       (swap! (*context* :GC) #(GC/insert % (CO/get-site-ID CO) (CO/get-VC CO)))
       (swap! (*context* :CC) #(CC/with-most-recent % (CO/get-ID CO)))
       (swap! (*context* :MCGS) #(MOVIC/MOVIC % CO @(*context* :CDAG) @(*context* :HB) @(*context* :base-FM) (*context* :CC)))
       ; not required, just to be clear that this information is only needed by the MOVIC call
       (swap! (*context* :CC) #(CC/with-most-recent % nil))
       (let [next-FM (site/next-FM @(*context* :MCGS) @(*context* :CDAG) @(*context* :HB) @(*context* :CC) @(*context* :base-FM))]
         (reset! (*context* :FM) next-FM)
         [next-FM CO]))))

(defn generate-inverse-operation!
  "**TODO**: Generates an inverse operation concurrent to all following operations.
  It should be sufficient to just take the inverted operation's timestamp, increment it,
  and use that as the inverse operation's timestamp."
  []
  nil)

(defn generate-heartbeat!
  "Generates a heartbeat message at a client site.
  Only required to improve the performance of garbage collection."
  []
  (log "generating heartbeat message")
  (p ::generate-heartbeat!
     (swap! (*context* :VC) #(VC/increment % (*context* :site-ID)))
     (let [message (message/make-heartbeat @(*context* :VC) (*context* :site-ID))]
       (swap! (*context* :GC) #(GC/insert % (message/get-site-ID message) (message/get-VC message)))
       message)))

(def receive-message!
  "Receives a message at a client site.
  Returns the (updated) current feature model."
  site/receive-message!)

(def GC!
  "Runs the garbage collector at a client site.
  Updates the global context."
  site/GC!)