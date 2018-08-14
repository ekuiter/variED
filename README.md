## variED

variED (the *vari*ability *ed*itor) is a software for viewing, editing and
analyzing feature models. It is currently under active development and therefore
unstable.

variED relies on a client-server architecture where the client is implemented in
JavaScript and the server in Java. It requires Java 1.8 and can be deployed on
Java servlet containers such as Apache Tomcat or Jetty.

### Getting started

- `./gradlew build` for building a WAR file that can be deployed on Java servlet
  containers
- `./gradlew client:build` and `./gradlew server:build` to build only the client
  or server
- `yarn start` from the `client` directory to run the client on
  `http://localhost:3000`
- `./gradlew server:run` to run the server on `http://localhost:8080`

### IDE setup

These are some notes if you want to set up development with WebStorm and
IntelliJ.

**WebStorm**

Open the `client` directory in WebStorm. Add a *npm* run configuration and
specify the `start` script to run the client from within WebStorm.

**IntelliJ IDEA**

Open the `server` directory in IntelliJ and choose *Import Gradle project*.
Choose to *use local gradle distribution* and supply the Gradle home, e.g.
`/usr/local/Cellar/gradle/4.9/libexec` (on macOS, this can be determined with
`brew info gradle`). Add a *Gradle* run configuration with Gradle project
`server` and task `run` to run the server from within IntelliJ.
