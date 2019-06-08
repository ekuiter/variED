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
set of collaborating users and a *kernel context* that holds the collaboration kernel's site-global data structures (e.g., the feature model, all generated operations and data structures for conflict detection and resolution). A *user* is associated with a particular
WebSocket and the set of collaborative sessions she participates in.

Users and collaborative sessions are in a m:n relationship (a user can
[join](#join) any number of collaborative sessions, and a collaborative session
may comprise any number of users.)

#### Client

The client knows as which user it is registered, which artifacts are available,
in which collaborative sessions it participates, as well as the associated state
context and other participating users. It receives all messages related to any
collaborative session it participates in. (Usually, the client is expected to
only participate in one particular collaborative session at a time. But this
leaves us freedom for later extensions, such as editing feature models and
configurations in concert.)

### Messages

Every message is of the form `{"type": "...", ...}` where type is a string
denoting the message's type (discussed below). Messages that refer to a specific
artifact contain the *artifactPath* property, which is an object with the
*project* and *artifact* properties. If the client wants to send a message
regarding a specific artifact, it first has to join its collaborative session.

There are two kinds of messages: *Encodable* messages may be sent from the server to the client, while the client may send *decodable* messages to the server.
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

#### ADD_ARTIFACT

```
{type: "ADD_ARTIFACT", artifactPaths: [{project: "project", artifact: "artifact"}, source: "feature model source"]}
```

An en-/decodable message. The server sends this to inform users about available or added projects and artifacts. The client sends this to create a new artifact. The source parameter is only allowed for the decodable message and optional. It may contain a FeatureIDE-compliant feature model that should be imported.

#### REMOVE_ARTIFACT

```
{type: "REMOVE_ARTIFACT", artifactPath: {project: "project", artifact: "artifact"}}
```

An en-/decodable message. The server sends this to inform users about removed projects and artifacts.

#### COLLABORATOR_INFO

```
{type: "COLLABORATOR_INFO", artifactPath: {project: "project", artifact: "artifact"}, siteID: "UUID"}
```

An encodable message. The server sends this to inform new users about their user
profile.

#### JOIN_REQUEST

```
{type: "JOIN_REQUEST", artifactPath: {project: "project", artifact: "artifact"}}
```

A decodable message. A client sends this to the server to join the given
artifact's collaborative session.

#### LEAVE_REQUEST

```
{type: "LEAVE_REQUEST", artifactPath: {project: "project", artifact: "artifact"}}
```

A decodable message. A client sends this to the server to leave the given
artifact's collaborative session.

#### INITIALIZE

```
{type: "INITIALIZE", context: "kernel context"}
```

An encodable message. The server sends this to newly joined clients. The client's initial kernel context is attached.

#### KERNEL

```
{type: "KERNEL", message: "kernel message"}
```

An en-/decodable message. A client sends this to the server to issue an operation or otherwise communicate with the server's kernel. The server sends this to a client to forward another client's operation.
