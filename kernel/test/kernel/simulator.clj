(ns kernel.simulator
  "Provides utilities to simulate collaborative feature modeling activities."
  (:require [clojure.test :refer :all]
            [kernel.core.history-buffer :as HB]
            [kernel.core.garbage-collector :as GC]
            [kernel.shell.client :as client]
            [kernel.shell.server :as server]
            [kernel.shell.site :as site]
            [kernel.core.compound-operation :as CO]
            [kernel.shell.context :refer [*context*]]))

(def ^:dynamic *contexts*
  "Captures all state in the simulation system.
  Maps from site identifiers to their respective contexts."
  {})

(defn initialize-mesh-topology!
  "Peer-to-peer network, but the set of sites is static and has to be known in advance
  in this implementation."
  [initial-FM & site-IDs]
  (def ^:dynamic *contexts*
    (apply merge (map (fn [site-ID]
                        {site-ID (site/initialize-context-mesh-topology site-ID initial-FM)})
                      site-IDs)))
  nil)

(defn initialize-star-topology!
  "Client-server network. Includes a server and allows dynamically joining and leaving sites."
  [initial-FM]
  (def ^:dynamic *contexts* {:server (server/initialize-context-star-topology initial-FM)}))

(defn do-at-site
  "Runs code in the context of a specific site."
  [site-ID continue]
  (is (contains? *contexts* site-ID) "site not initialized")
  (with-redefs [*context* (get *contexts* site-ID)]
    (continue)))

(defn generate-at-site!
  "Shorthand for generating an operation message in the context of a specific site.
  Returns the (updated) combined effect and the operation message."
  [site-ID CO-or-CO-fn]
  (do-at-site
    site-ID
    #(client/generate-operation!
       (if (fn? CO-or-CO-fn)
         (CO-or-CO-fn @(*context* :FM))
         CO-or-CO-fn))))

(defn receive-at-site!
  "Shorthand for receiving a message in the context of a specific site."
  [site-ID CO]
  (do-at-site site-ID #(site/receive-message! CO)))

(defn is-at-site
  "Shorthand for an assertion in the context of a specific site."
  [site-ID continue]
  (do-at-site site-ID #(is (continue))))

(defn GC!
  "Shorthand for running the garbage collector in the context of a specific site."
  [site-ID]
  (do-at-site site-ID site/GC!))

(defn generate!
  "Shorthand for generating an operation message in the context of a specific site.
  Returns the operation message."
  [site-ID CO-or-CO-fn]
  (second (generate-at-site! site-ID CO-or-CO-fn)))

(defn generate-heartbeat!
  "Shorthand for generating a heartbeat message in the context of a specific site.
  Returns the heartbeat message."
  [site-ID]
  (do-at-site site-ID #(client/generate-heartbeat!)))

(defn receive!
  "Shorthand for receiving multiple messages in the context of a specific site."
  [site-ID & COs]
  (doseq [CO COs]
    (receive-at-site! site-ID CO)))

(defn receive*!
  "Shorthand for receiving a message in the context of the server.
  Returns the message that is to be forwarded to all other sites."
  [CO]
  (do-at-site :server #(server/forward-message! CO)))

(defn generate-heartbeat*!
  "Shorthand for generating a heartbeat message in the context of the server.
  Returns the heartbeat message."
  []
  (do-at-site :server #(server/generate-heartbeat!)))

(defn join!
  "Shorthand for joining a new site.
  Returns the new site's first heartbeat message that is to be forwarded to all other sites."
  [site-ID]
  (let [[context message] (do-at-site :server #(server/site-joined! site-ID))]
    (def ^:dynamic *contexts*
      (assoc *contexts*
        site-ID
        (client/initialize-context-star-topology site-ID context)))
    message))

(defn leave!
  "Shorthand for when a site has left.
  Returns the leave message that is to be forwarded to all other sites."
  [site-ID]
  (def ^:dynamic *contexts* (dissoc *contexts* site-ID))
  (do-at-site :server #(server/site-left! site-ID)))

(defn is-site=
  "Asserts that two given sites arrived at the same state."
  [site-ID-a site-ID-b]
  (when (not= site-ID-a site-ID-b)
    (let [{base-FM-a :base-FM
           CDAG-a    :CDAG
           HB-a      :HB
           CC-a      :CC
           MCGS-a    :MCGS}
          (GC/GC @(get-in *contexts* [site-ID-a :GC])
                 @(get-in *contexts* [site-ID-a :CDAG])
                 @(get-in *contexts* [site-ID-a :HB])
                 @(get-in *contexts* [site-ID-a :base-FM])
                 @(get-in *contexts* [site-ID-a :CC])
                 @(get-in *contexts* [site-ID-a :MCGS]))
          {base-FM-b :base-FM
           CDAG-b    :CDAG
           HB-b      :HB
           CC-b      :CC
           MCGS-b    :MCGS}
          (GC/GC @(get-in *contexts* [site-ID-b :GC])
                 @(get-in *contexts* [site-ID-b :CDAG])
                 @(get-in *contexts* [site-ID-b :HB])
                 @(get-in *contexts* [site-ID-b :base-FM])
                 @(get-in *contexts* [site-ID-b :CC])
                 @(get-in *contexts* [site-ID-b :MCGS]))]
      ; no sites can ever have equal vector clocks
      (is (not= @(get-in *contexts* [site-ID-a :VC])
                @(get-in *contexts* [site-ID-b :VC])))
      ; at quiescence, the following are equal, save for GC
      ; so simulate GC on both sites, then they should be equal
      (is (= base-FM-a base-FM-b))
      (is (= CDAG-a CDAG-b))
      (is (= HB-a HB-b))
      (is (= CC-a CC-b))
      (is (= MCGS-a MCGS-b))
      ; the current feature model always has to be equal,
      ; this is one major correctness criterion for our system
      (is (= @(get-in *contexts* [site-ID-a :FM])
             @(get-in *contexts* [site-ID-b :FM]))))))

(defn is-sync
  "Asserts that all sites have converged to the same state.
  Has to hold whenever the system is at quiescence."
  []
  (doseq [site-ID-a (keys *contexts*)
          site-ID-b (keys *contexts*)]
    (is-site= site-ID-a site-ID-b)))

(defn FM
  "Returns the current feature model at a specific site."
  [site-ID]
  @(get-in *contexts* [site-ID :FM]))

(defn MCGS
  "Returns the current maximum compatible group set at a specific site."
  [site-ID]
  @(get-in *contexts* [site-ID :MCGS]))

(defn HB
  "Returns the current history buffer at a specific site."
  [site-ID]
  @(get-in *contexts* [site-ID :HB]))

(defn GC'd?
  "Returns whether an operation has been garbage collected at a specific site."
  [site-ID CO]
  (nil? (HB/lookup @(get-in *contexts* [site-ID :HB]) (CO/get-ID CO))))

(defn CO-created-ID
  "Returns the identifier for a new object an operation creates.
  Assumes that the create primitive operation is first in the compound operation."
  [CO]
  ; first and second are PO/metadata, third is create operation
  (-> CO CO/get-PO-sequence (nth 2) CO/get-ID))