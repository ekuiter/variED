## API Documentation

Here's a quick overview of the interface between server and client. This serves
as a quick reference, but also as a specification both the server and client
should comply with.

### Connection

variED has a *client-server architecture*, where every client communicates with
a central server that is the "single source of truth". Every client has a
long-running full-duplex connection to the server, which allows for low-overhead
real-time data transfer. This is currently implemented using *WebSockets* (more
or less ordinary TCP sockets).

As every client has to have a steady connection with the server, maintaining
this connection is vital. The client is responsible for

- establishing a connection when starting up
- closing it when shutting down
- handling connection errors appropriately (e.g., by warning the user or
  re-establishing the connection, TODO)

### Data Transfer

Data is transferred in the *JSON* format, which can be easily en-/decoded by
both parties. As of now, the server closes the connection on malformed input
(i.e., not parseable as JSON).

Data is organized in messages, where every message has [defined
semantics](#messages). As of now, if a message does not comply its specified
format, the server closes the connection.

### Data Model
#### Server

The server organizes editable entities (*artifacts*) in *projects*. The server
may manage 0..* projects, each of which may contain 0..* artifacts. As of now,
the only kind of artifacts are feature models.

Each artifact knows about its containing project and may therefore refer to
other artifacts in the same project. Foreign projects can not be referenced.
This way, related artifacts can be grouped together, while projects of different
users are isolated.

So far, only the "static" data organization was described. As for real-time
editing, each artifact is associated with a *collaborative session* which has a
set of collaborating users and a *state context* that holds the artifact's
contents (e.g., a feature model). A *user* is associated with a particular
WebSocket and the set of collaborative sessions she participates in.

Users and collaborative sessions are in a m:n relationship (a user can
[join](#join) any number of collaborative sessions, and a collaborative session
may comprise any number of users.)

#### Client

TODO: As of now, the client is oblivious to the project-artifact-organization on
the server and therefore incompatible. This is about to be fixed. The following
would be desirable:

The client knows as which user it is registered, in which collaborative sessions
it participates, as well as the associated state context and other participating
users. It receives all messages related to any collaborative session it
participates in. (Usually, the client is expected to only participate in one
particular collaborative session at a time. But this leaves us freedom for later
extensions, such as editing feature models and configurations in concert.)

### Messages

Every message is of the form `{"type": "...", ...}` where type is a string
denoting the message's type (discussed below). Messages that refer to a specific
artifact contain the *artifact* property, which is a string of form
*project::artifact*. If the client wants to send a message regarding a specific
artifact, it first has to join its collaborative session.

There are five kinds of messages:

- *encodable*: messages the server may send to the client
- *decodable*, *applicable*, *undoable*, *batch undoable*: messages the client
  may send to the server

The latter differ in the way they may be applied on the server (decodable: does
not refer to state context, applicable: applies a state change, undoable: like
applicable, but may be [un-/redone](#undo), batch undoable: see
[BATCH](#batch)). A *state change* models an operation on the state context.
Applicable and undoable messages may also directly return messages to the
client.

Details are provided for each message type below. Not all preconditions and
potential errors are listed, in favor of keeping things short and sweet.

#### ERROR

```
{type: "ERROR", error: "..."}
```

An encodable message. Informs the client about errors. TODO: This is just a
fill-in for a proper error handling system. A reference to the concerned
artifact (if any) is missing, no different error kinds are distinguished, errors
are not internationalized or formatted (see issue tracker).

#### JOIN

```
{type: "JOIN", artifact: "project::artifact"}
```

An en-/decodable message. A client sends this to the server to join the given
artifact's collaborative session. The server sends this to inform

- the joined client about other participants
- the other participants about the joined client

#### LEAVE

```
{type: "JOIN", artifact: "project::artifact"}
```

An en-/decodable message. A client sends this to the server to leave the given
artifact's collaborative session. The server sends this to inform the other
participants that the client left.

#### UNDO

```
{type: "UNDO", artifact: "project::artifact"}
```

An applicable message. A client sends this to the server to undo an operation
for the given artifact. Which operation is undone depends on the server's
undo/redo model. As of now, a primitive global undo/redo stack is used.

Returns the result of the undone state change (e.g., an updated feature model).

#### REDO

```
{type: "REDO", artifact: "project::artifact"}
```

An applicable message. A client sends this to the server to redo an operation
for the given artifact. Which operation is redone depends on the server's
undo/redo model. As of now, a primitive global undo/redo stack is used.

Returns the result of the redone state change (e.g., an updated feature model).

#### BATCH

```
{type: "BATCH", artifact: "project::artifact", messages: [{"type": "...", ...}, ...]}
```

An undoable message. A client sends this to the server to perform multiple
operations in one step. The artifact can (and should) be omitted from the
included messages. All included messages must be batch undoable and have the
same type.

The server applies the included messages as usual. When a batch message is
un-/redone, all included messages are un-/redone. If this fails for any message,
previous state changes (if any) are rolled back to guarantee atomicity.

Returns the result of the last included state change (which, as of now, is
assumed to include all relevant information of the previous state changes).

#### FEATURE_DIAGRAM_FEATURE_MODEL

```
{"type": "FEATURE_DIAGRAM_FEATURE_MODEL", "artifact": "project::artifact", "featureModel": ...}
```

An encodable message. A representation of a feature model artifact. The server
sends this to the client to notify it about updates. TODO: This is very
inefficient (see issue tracker). To support proper concurrency, this will most
likely be rewritten completely.

As of now, feature models are serialized to a tree-like JSON object. This may
change in the future as well, if there is a more suitable representation.

#### FEATURE_DIAGRAM_FEATURE_ADD_BELOW

```
{"type": "FEATURE_DIAGRAM_FEATURE_ADD_BELOW", "artifact": "project::artifact", belowFeature: "feature"}
```

An undoable message. Adds a new feature below the specified feature.

Returns the updated feature model.

#### FEATURE_DIAGRAM_FEATURE_ADD_ABOVE

```
{"type": "FEATURE_DIAGRAM_FEATURE_ADD_ABOVE", "artifact": "project::artifact", aboveFeatures: ["feature", ...]}
```

An undoable message. Adds a new feature above the specified features.

Returns the updated feature model.

#### FEATURE_DIAGRAM_FEATURE_REMOVE

```
{"type": "FEATURE_DIAGRAM_FEATURE_REMOVE", "artifact": "project::artifact", feature: "feature"}
```

A batch undoable message. Removes the specified feature.

Returns the updated feature model.

#### FEATURE_DIAGRAM_FEATURE_REMOVE_BELOW

```
{"type": "FEATURE_DIAGRAM_FEATURE_REMOVE_BELOW", "artifact": "project::artifact", feature: "feature"}
```

A batch undoable message. Removes the specified feature and all features below.

Returns the updated feature model.

#### FEATURE_DIAGRAM_FEATURE_RENAME

```
{"type": "FEATURE_DIAGRAM_FEATURE_RENAME", "artifact": "project::artifact", oldFeature: "featureA", newFeature: "featureB"}
```

A encodable and undoable message. Renames the specified feature.

Returns the updated feature model and a *FEATURE_DIAGRAM_FEATURE_RENAME* message
describing the rename operation.

#### FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION

```
{"type": "FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION", "artifact": "project::artifact", feature: "feature", description: "..."}
```

An undoable message. Sets the specified feature's description.

Returns the updated feature model.

#### FEATURE_DIAGRAM_FEATURE_SET_PROPERTY

```
{"type": "FEATURE_DIAGRAM_FEATURE_SET_PROPERTY", "artifact": "project::artifact", feature: "feature", property: "...", value: "..."}
```

A batch undoable message. Sets a property of the specified feature to a given
value. The property must be one of *abstract*, *hidden*, *mandatory* or *group*.
The value must be *true* or *false* for the former. For the property *group*,
the value must be one of *and*, *or* or *alternative*. In a batch message, all
messages must set the same property.

Returns the updated feature model.
