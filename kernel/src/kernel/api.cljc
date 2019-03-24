(ns kernel.api
  "API of the kernel.

  This API is exposed to consumers (i.e., client and server sites).
  Most details of the kernel's data structures are encapsulated and hidden from the consumer.

  Notation used in this documentation:

  - **TODO** marks missing features
  - **OPTIMIZE** marks possible optimizations
  - `&` at the end of a variable denotes that it is passed as an atom
  - `_` at the beginning of a function name avoids name clashes with Clojure built-ins
  - `!` at the end of a function name signifies that it reads or mutates the global context

  Below, we describe the client, server and operations API. Some general remarks:

  - Note that unless otherwise specified, all calls to the API must be atomic
    (not interrupted) and from a single thread, as no synchronization is done.
  - Further, every action specified must be done as soon as possible (e.g.,
    right after a user left, the leave message has to be propagated), before
    any other API functions are called.
    In particular, while changes are still being reflected in the user interface,
    no API calls are allowed.
  - Unless otherwise specified, *periodically* and *for a while* can refer to
    arbitrary periods of time, although it would be reasonable to use the same
    time periods at all sites.
  - The system is considered frozen whenever [[clientReceiveMessage]] reports
    conflicts. The system is only un-frozen when all conflicts are resolved.
  - When a client wants to leave, no special API call is necessary.
    It can simply discard all its metadata and notify the server
    that it is leaving.
    **TODO**: Right now, no timeout for leaving is considered. In other words,
    a site can not join again using the same site identifier and context once
    left, and it must register as a new site (no short-time offline editing).
  - The server does not generate messages itself (apart from occasional
    explicit heartbeats).
  - For more information on the individual operations, refer to
    [[kernel.core.compound-operation]].

  Data structures that are intended to be sent over the wire to other sites are
  serialized with [Transit](https://github.com/cognitect/transit-format)."
  (:require [kernel.core.compound-operation :as CO]
            [kernel.shell.client :as client]
            [kernel.shell.server :as server]
            [kernel.shell.context :refer [*context* get-context set-context]]
            [kernel.helpers :as helpers :refer [log]]
            #?(:clj  [taoensso.tufte :as tufte :refer (defnp p profiled profile)]
               :cljs [taoensso.tufte :as tufte :refer-macros (defnp p profiled profile)])))

; client API

(defn ^:export clientInitialize
  "When a client first enters the system, it announces itself at the server.
  The server assigns it a site identifier and an initial context, which the
  client must call clientInitialize with."
  [site-ID context]
  (profile
    {}
    (client/initialize-context-star-topology! site-ID (helpers/decode context))
    (helpers/FM-encode @(*context* :FM))))

(defn ^:export clientGenerateOperation
  "At any time the system is not frozen, the client may call
  clientGenerateOperation with a valid PO sequence (see operations API)
  to generate and immediately apply a new operation.
  **TODO**: Right now, the PO sequence is *not* sanity-checked, so the
  client is responsible to respect basic consistency rules (e.g., only
  submit operations that make sense on the current feature model).
  clientGenerateOperation returns a feature model that the client may
  consume. It also returns an operation message that the client must send
  to the server."
  [PO-sequence]
  (profile
    {}
    (let [[next-FM operation] (client/generate-operation! PO-sequence)]
      (into-array [(helpers/FM-encode next-FM)
                   (helpers/encode operation)]))))

(defn ^:export clientGenerateInverseOperation
  "**TODO**: Generate inverse operations."
  []
  (profile
    {}
    (helpers/encode (client/generate-inverse-operation!))))

(defn ^:export clientGenerateHeartbeat
  "If no operations have been generated for a while (and when no other API
  calls are in progress and the system is not frozen), the client must call
  clientGenerateHeartbeat and send the resulting message to the server.
  This is to ensure smooth garbage collection."
  []
  (profile
    {}
    (helpers/encode (client/generate-heartbeat!))))

(defn ^:export clientReceiveMessage
  "When a message arrives from the server, the client must call
  clientReceiveMessage with the received message.
  The call returns either a new feature model that may be consumed by the
  client, or **TODO** information about how emerged conflicts may be resolved.
  **TODO**: When a conflict occurs, before un-freezing the system, all
  conflicting operations have to be completely purged from the system."
  [message]
  (profile
    {}
    (helpers/FM-encode (client/receive-message! (helpers/decode message)))))

(defn ^:export clientGC
  "Periodically (and when no other API calls are in progress and the system
  is not frozen), the client must call clientGC."
  []
  (profile
    {}
    (client/GC!)))

; server API (not exported to the client)

(defn serverInitialize
  "When a client first enters the system and requests to edit a given feature
  model, the server must call serverInitialize with said feature model."
  [initial-FM]
  (profile
    {}
    (server/initialize-context-star-topology! initial-FM)))

(defn serverGenerateHeartbeat
  "If the server has not forwarded any operations for a while (and when no other API
  calls are in progress and the system is not frozen), the server must call
  serverGenerateHeartbeat and send the resulting message to all client sites.
  This may happen for example when only one client site is connected."
  []
  (profile
    {}
    (helpers/encode (server/generate-heartbeat!))))

(defn serverForwardMessage
  "After receiving a message from a client, the server must call
  serverForwardMessage with the received message.
  The returned message is then forwarded to all sites but the original site."
  [message]
  (profile
    {}
    (helpers/encode (server/forward-message! (helpers/decode message)))))

(defn serverSiteJoined
  "Whenever a new site requests to join, the server must call serverSiteJoined
  and send the returned initial context to the site. It also has to forward the
  returned heartbeat message to all other sites immediately.
  The new site's identifier may be chosen by the client or server site, as
  long as it is unique.
  **OPTIMIZE**: The conflict cache and feature model may be omitted from the
  initial context to save network bandwidth, as they can be produced from the
  other data structures. However, this imposes additional time complexity
  for the newly joined site, so for now we just transmit everything.

  The heartbeat message is generated because directly after the join, the server
  has to notify all other sites about the new site. This may be done by blocking
  the server until the new site sends its first heartbeat, but it is more
  efficient to generate this heartbeat message directly at the server (which
  is equivalent) and forward it everyone else immediately."
  [site-ID]
  (profile
    {}
    (let [[context heartbeat-message] (server/site-joined! site-ID)]
      (into-array [(helpers/encode context)
                   (helpers/encode heartbeat-message)]))))

(defn serverSiteLeft
  "When a site leaves, the server must call serverSiteLeft and forward
  the returned leave message to all other sites immediately."
  [site-ID]
  (profile
    {}
    (helpers/encode (server/site-left! site-ID))))

(defn serverGC
  "Periodically (and when no other API calls are in progress and the system
  is not frozen), the server must call serverGC."
  []
  (profile
    {}
    (server/GC!)))

; operations API

(defn ^:export operationCompose
  "Composes multiple compound operations into one compound operation."
  [& PO-sequences]
  (profile
    {}
    (apply CO/compose-PO-sequences PO-sequences)))

(defn ^:export operationCreateFeatureBelow
  "Creates a feature below another feature."
  [parent-ID]
  (profile
    {}
    (CO/create-feature-below @(*context* :FM) parent-ID)))

(defn ^:export operationCreateFeatureAbove
  "Creates a feature above a set of sibling features."
  [& IDs]
  (profile
    {}
    (apply CO/create-feature-above @(*context* :FM) IDs)))

(defn ^:export operationRemoveFeatureSubtree
  "Removes an entire feature subtree rooted at a feature."
  [ID]
  (profile
    {}
    (CO/remove-feature-subtree @(*context* :FM) ID)))

(defn ^:export operationMoveFeatureSubtree
  "Moves an entire feature subtree rooted at a feature below another feature."
  [ID parent-ID]
  (profile
    {}
    (CO/move-feature-subtree @(*context* :FM) ID parent-ID)))

(defn ^:export operationRemoveFeature
  "Removes a single feature."
  [ID]
  (profile
    {}
    (CO/remove-feature @(*context* :FM) ID)))

(defn ^:export operationSetFeatureOptional
  "Sets the optional attribute of a feature."
  [ID optional?]
  (profile
    {}
    (CO/set-feature-optional? @(*context* :FM) ID optional?)))

(defn ^:export operationSetFeatureGroupType
  "Sets the group type attribute of a feature."
  [ID group-type-str]
  (profile
    {}
    (CO/set-feature-group-type @(*context* :FM) ID (keyword group-type-str))))

(defn ^:export operationSetFeatureProperty
  "Sets some additional property of a feature."
  [ID property-str value]
  (profile
    {}
    (CO/set-feature-property @(*context* :FM) ID (keyword property-str) value)))

(defn ^:export operationCreateConstraint
  "Creates a constraint and initializes it with a given propositional formula."
  [formula]
  (profile
    {}
    (CO/create-constraint @(*context* :FM) (helpers/formula-decode formula))))

(defn ^:export operationSetConstraint
  "Sets the propositional formula of a constraint."
  [ID formula]
  (profile
    {}
    (CO/set-constraint @(*context* :FM) ID (helpers/formula-decode formula))))

(defn ^:export operationRemoveConstraint
  "Removes a constraint."
  [ID]
  (profile
    {}
    (CO/remove-constraint @(*context* :FM) ID)))

; helper functions

(defn ^:export getContext
  "Returns the global context."
  []
  (profile
    {}
    (get-context)))

(defn ^:export setContext
  "Sets the global context.
  May be used to switch between different contexts, e.g., when editing different feature models."
  [context]
  (profile
    {}
    (set-context context)))

(defn ^:export setLoggerFunction
  "Sets a function that is used to allow for verbose logging.
  logger-fn is expected to take one string argument and not return anything."
  [logger-fn]
  (profile
    {}
    (helpers/set-logger-fn logger-fn)))

(defn ^:export setGenerateIDFunction
  "Sets a function that is used to generate unique identifiers.
  This function is only used on the client.
  generate-ID-fn is expected to take no arguments and return a UUIDv4 string."
  [generate-ID-fn]
  (profile
    {}
    (helpers/set-generate-ID-fn generate-ID-fn)))

(defn ^:export setSemanticRulesFunction
  "Sets a sequence of functions that are used to check semantic consistency of a feature model.
  Each function is expected to take an encoded feature model and return true if the feature
  model is inconsistent, false otherwise."
  [semantic-rules-fn]
  (profile
    {}
    (helpers/set-semantic-rules semantic-rules-fn)))

; profiling

(def stats-accumulator (tufte/add-accumulating-handler! {}))

(defn ^:export logProfile
  []
  (log (tufte/format-grouped-pstats
         @stats-accumulator
         {:format-pstats-opts {:columns [:n-calls :min :p50 :p90 :p95 :p99 :max :mean :clock :total]}})))