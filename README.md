## variED

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/ekuiter/variED/tree/build)

variED (the *vari*ability *ed*itor) is a software for viewing, editing and
analyzing feature models. It is currently under active development and therefore
unstable.

variED relies on a client-server architecture where the client is implemented in
TypeScript and the server in Java. It requires Java 1.8 and can be deployed on
Java servlet containers such as Apache Tomcat or Jetty.

### Getting started

The only dependency required for building is [JDK
1.8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html).
[Gradle](https://gradle.org/), [npm](https://nodejs.org/) and
[yarn](https://yarnpkg.com/) are downloaded and set up automatically by the
build process.

- `./gradlew build` builds a WAR file that can be deployed on Java servlet
  containers, the `variED.sh` script runs the WAR file in Apache Tomcat
- `yarn start` inside the `client` directory runs the client on
  `http://localhost:3000`
- `./gradlew server:run` runs the server on `http://localhost:8080`
- `CI=true ./gradlew check` runs all unit tests
- you can deploy to Heroku by simply using the button above or with:
  ```
  heroku create
  heroku buildpacks:add heroku/nodejs
  heroku buildpacks:add heroku/gradle
  git push heroku master
  ```

### Implementation

The server uses the [FeatureIDE](https://featureide.github.io/) core library to
perform editing operations and reason about feature models. It communicates with
clients by sending JSON-encoded messages over a WebSocket connection.

The client makes use of the [React](https://reactjs.org/),
[Redux](https://redux.js.org/), [Office UI
Fabric](https://developer.microsoft.com/en-us/fabric) and
[D3.js](https://d3js.org/) libraries to provide a user interface for feature
modeling.

The client-server interface is described in [API.md](API.md).

Parts of the server code are reused in the client (`common` package) by
transpiling them to JavaScript. Because of this, classes in the `common` package
may only use certain APIs (`java.util.*`, a subset of the FeatureIDE API
implemented in the client, and other classes in the `common` package). When in
development, `./gradlew server:transpileCommon` has to be run manually whenever
a `common` class is changed (this is not needed when building).

### IDE setup

These are some notes if you want to set up development.

**WebStorm / VS Code**

Open the `client` directory in WebStorm. Add a *npm* run configuration and
specify the `start` script to run the client from within WebStorm.

Configuration files for Visual Studio Code are included as well. Use of the
yarn, ESLint/TSLint and Debugger for Chrome plugins is recommended.

**IntelliJ IDEA**

Open the `server` directory in IntelliJ and choose *Import Gradle project*.
Choose to *use local gradle distribution* and supply the Gradle home, e.g.
`/usr/local/Cellar/gradle/4.9/libexec` (on macOS, this can be determined with
`brew info gradle`). Add a *Gradle* run configuration with Gradle project
`server` and task `run` to run the server from within IntelliJ.

### License

This project is released under the [LGPL v3 license](LICENSE.txt).
