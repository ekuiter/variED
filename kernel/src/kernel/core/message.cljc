(ns kernel.core.message
  "Defines what kinds of messages are exchanged among sites.

  There are three kinds of messages:

  - An operation message carries a compound operation that is to be executed
    on all sites in the system.
  - A heartbeat message carries a site's latest vector clock.
    This is used as a performance optimization for the garbage collector
    (without periodic heartbeats, no operations can be garbage collected).
    They also announce a newly joined site.
  - A leave message announces that a site has left.

  Every message forwarded by the server contains the server's own vector clock.
  This is required for garbage collection, as the server also has to receive
  an operation for it to be [[kernel.core.garbage-collector/eligible?]].
  This is particularly important when only one client is connected to the server,
  so that the client does not immediately garbage collect its own operations.")

; constructors

(defn make-heartbeat
  "Creates a heartbeat message."
  [VC site-ID]
  {:type    :heartbeat
   :VC      VC
   :site-ID site-ID})

(defn make-leave
  "Creates a leave message."
  [site-ID]
  {:type    :leave
   :site-ID site-ID})

; getters and setters

(defn get-type
  "Returns a message's type, one of :heartbeat, :leave or nil (operation)."
  [message]
  (message :type))

(defn get-VC
  "Returns a message's vector clock, if any.
  Leave messages do not carry a vector clock."
  [message]
  (message :VC))

(defn update-VC
  "Updates a message's vector clock with a given updater function."
  [message f]
  (update message :VC f))

(defn get-server-VC
  "Returns a message's server vector clock.
  Not every message carries this vector clock (i.e., forwarded messages
  and heartbeats for joined sites)."
  [message]
  (message :server-VC))

(defn remove-server-VC
  "Removes a message's server vector clock."
  [message]
  (dissoc message :server-VC))

(defn with-server-VC
  "Updates a message's server vector clock."
  [message server-VC]
  (assoc message :server-VC server-VC))

(defn get-site-ID
  "Returns a message's site.
  This is the site that issued the message, or a site that has left."
  [message]
  (message :site-ID))