## variED

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/ekuiter/variED)

variED (the *vari*ability *ed*itor) is a software for viewing, editing and
analyzing feature models. It is currently under active development and therefore
unstable.

variED relies on a client-server architecture where the client is implemented in
JavaScript and the server in Java. It requires Java 1.8 and can be deployed on
Java servlet containers such as Apache Tomcat or Jetty.

### Getting started

The only dependency required for building is [JDK
1.8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html).
[Gradle](https://gradle.org/), [npm](https://nodejs.org/) and
[yarn](https://yarnpkg.com/) are downloaded and set up automatically by the
build process.

- `./gradlew build` builds a WAR file that can be deployed on Java servlet
  containers, the `variED.sh` script runs the WAR file in Apache Tomcat
- `./gradlew client:build` and `./gradlew server:build` build only the client or
  server
- `yarn start` inside the `client` directory runs the client on
  `http://localhost:3000`
- `./gradlew server:run` runs the server on `http://localhost:8080`
- you can deploy to Heroku by simply using the button above or with `heroku
  create && git push heroku master`

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

### License

This project is released under the [LGPL v3 license](LICENSE.txt).
