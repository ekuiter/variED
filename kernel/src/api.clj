(ns api
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
  - The system is considered frozen whenever [[client-receive-message!]] reports
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
    [[core.compound-operation]]."
  (:require [core.compound-operation :as CO]
            [shell.client :as client]
            [shell.server :as server])
  (:use shell.context))

; client API

(defn client-initialize!
  "When a client first enters the system, it announces itself at the server.
  The server assigns it a site identifier and an initial context, which the
  client must call client-initialize! with."
  [site-ID context]
  (client/initialize-context-star-topology! site-ID context))

(defn client-generate-operation!
  "At any time the system is not frozen, the client may call
  client-generate-operation! with a valid PO sequence (see operations API)
  to generate and immediately apply a new operation.
  **TODO**: Right now, the PO sequence is *not* sanity-checked, so the
  client is responsible to respect basic consistency rules (e.g., only
  submit operations that make sense on the current feature model).
  client-generate-operation! returns a feature model that the client may
  consume. It also returns an operation message that the client must send
  to the server."
  [PO-sequence]
  (client/generate-operation! PO-sequence))

(defn client-generate-inverse-operation!
  "**TODO**: Generate inverse operations."
  []
  (client/generate-inverse-operation!))

(defn client-generate-heartbeat!
  "If no operations have been generated for a while (and when no other API
  calls are in progress and the system is not frozen), the client must call
  client-generate-heartbeat! and send the resulting message to the server.
  This is to ensure smooth garbage collection."
  []
  (client/generate-heartbeat!))

(defn client-receive-message!
  "When a message arrives from the server, the client must call
  client-receive-message! with the received message.
  The call returns either a new feature model that may be consumed by the
  client, or **TODO** information about how emerged conflicts may be resolved.
  **TODO**: When a conflict occurs, before un-freezing the system, all
  conflicting operations have to be completely purged from the system."
  [message]
  (client/receive-message! message))

(defn client-GC!
  "Periodically (and when no other API calls are in progress and the system
  is not frozen), the client must call client-GC!."
  []
  (client/GC!))

; server API

(defn server-initialize!
  "When a client first enters the system and requests to edit a given feature
  model, the server must call server-initialize! with said feature model."
  [initial-FM]
  (server/initialize-context-star-topology! initial-FM))

(defn server-generate-heartbeat!
  "If the server has not forwarded any operations for a while (and when no other API
  calls are in progress and the system is not frozen), the server must call
  server-generate-heartbeat! and send the resulting message to all client sites.
  This may happen for example when only one client site is connected."
  []
  (server/generate-heartbeat!))

(defn server-forward-message!
  "After receiving a message from a client, the server must call
  server-forward-message! with the received message.
  The returned message is then forwarded to all sites but the original site."
  [message]
  (server/forward-message! message))

(defn server-site-joined!
  "Whenever a new site requests to join, the server must call server-site-joined!
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
  (server/site-joined! site-ID))

(defn server-site-left!
  "When a site leaves, the server must call server-site-left! and forward
  the returned leave message to all other sites immediately."
  [site-ID]
  (server/site-left! site-ID))

(defn server-GC!
  "Periodically (and when no other API calls are in progress and the system
  is not frozen), the server must call server-GC!."
  []
  (server/GC!))

; operations API

(defn operation-compose
  "Composes multiple compound operations into one compound operation."
  [& PO-sequences]
  (apply CO/compose-PO-sequences PO-sequences))

(defn operation-create-feature-below!
  "Creates a feature below another feature."
  [parent-ID]
  (CO/create-feature-below (*context* :FM) parent-ID))

(defn operation-create-feature-above!
  "Creates a feature above a set of sibling features."
  [& IDs]
  (apply CO/create-feature-above (*context* :FM) IDs))

(defn operation-remove-feature-subtree!
  "Removes an entire feature subtree rooted at a feature."
  [ID]
  (CO/remove-feature-subtree (*context* :FM) ID))

(defn operation-move-feature-subtree!
  "Moves an entire feature subtree rooted at a feature below another feature."
  [ID parent-ID]
  (CO/move-feature-subtree (*context* :FM) ID parent-ID))

(defn operation-remove-feature!
  "Removes a single feature."
  [ID]
  (CO/remove-feature (*context* :FM) ID))

(defn operation-set-feature-optional?!
  "Sets the optional attribute of a feature."
  [ID optional?]
  (CO/set-feature-optional? (*context* :FM) ID optional?))

(defn operation-set-feature-group-type!
  "Sets the group type attribute of a feature."
  [ID group-type]
  (CO/set-feature-group-type (*context* :FM) ID group-type))

(defn operation-set-feature-property!
  "Sets some additional property of a feature."
  [ID property value]
  (CO/set-feature-property (*context* :FM) ID property value))

(defn operation-create-constraint!
  "Creates a constraint and initializes it with a given propositional formula."
  [formula]
  (CO/create-constraint (*context* :FM) formula))

(defn operation-set-constraint!
  "Sets the propositional formula of a constraint."
  [ID formula]
  (CO/set-constraint (*context* :FM) ID formula))

(defn operation-remove-constraint!
  "Removes a constraint."
  [ID]
  (CO/remove-constraint (*context* :FM) ID))