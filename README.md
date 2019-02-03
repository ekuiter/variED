## variED

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/ekuiter/variED/tree/build) [![Deploy to Amazon AWS](https://s3.eu-central-1.amazonaws.com/de.ovgu.spldev.varied/awsdeploy.png)](https://console.aws.amazon.com/elasticbeanstalk/?region=eu-central-1#/newApplication?applicationName=variED&platform=Tomcat%208.5%20with%20Java%208%20running%20on%2064bit%20Amazon%20Linux&sourceBundleUrl=https%3A%2F%2Fs3.eu-central-1.amazonaws.com%2Fde.ovgu.spldev.varied%2Fserver.war&environmentType=SingleInstance&tierName=WebServer)

variED (the *vari*ability *ed*itor) is a software for viewing, editing and
analyzing feature models. It is currently under active development and therefore
unstable.

variED relies on a client-server architecture where the client is implemented in
TypeScript and the server in Java. It requires Java 1.8 and can be deployed on
Java servlet containers such as Apache Tomcat or Jetty.

### Deploy to the Cloud

Using the buttons above, you can simply deploy variED to a number of cloud
service providers.

#### Heroku

Just click the deploy button and register for a free account. This is the
fastest way to get started using variED.

#### Amazon AWS

Using the deploy button, you can deploy to AWS Elastic Beanstalk. In the
background, this creates an Amazon EC2 instance. For new accounts, Amazon offers
a 1-year free plan.

For *Application code*, choose *Upload your code* and *Upload*, then confirm
again with *Upload*, *Review and launch* and *Create app*.

After the app is set up (this can take a few minutes), the EC2 instance has to
be configured to allow inbound traffic on port 8080 for the WebSockets to work.
To do that, switch to the EC2 console, then go to *Network & Security > Security
Groups*, select your new application, then *Inbound*, *Edit* and *Add Rule*.
Create a *Custom TCP Rule* for *Port Range* *8080* and *Save*.

Now you can access the app on port 8080 (e.g.,
`http://…eu-central-1.elasticbeanstalk.com:8080/`).

### Manual Build

The only dependency required for building is [JDK
1.8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html).
[Gradle](https://gradle.org/), [npm](https://nodejs.org/),
[yarn](https://yarnpkg.com/) and [Leiningen](https://leiningen.org/) 
are downloaded and set up automatically by the build process.

- `./gradlew build` builds a WAR file that can be deployed on Java servlet
  containers, the `variED.sh` or `variED.bat` script runs the WAR file in Apache Tomcat
- `yarn start` inside the `client` directory runs the client on
  `http://localhost:3000`
- `./gradlew server:run` runs the server on `http://localhost:8080`
- `CI=true ./gradlew check` runs all unit tests
- you can deploy to Heroku by running this with the
  [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed:
  ```
  heroku create
  heroku buildpacks:add heroku/nodejs
  heroku buildpacks:add heroku/gradle
  git push heroku master
  ```
  
On Windows, unit tests for the client can not currently be run from the default
command line or PowerShell. Instead, run `yarn test` inside the `client` directory
from a [WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10) shell.

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

The Clojure kernel has 
[documentation](https://s3.eu-central-1.amazonaws.com/de.ovgu.spldev.varied/kernel-documentation/index.html) 
available. 

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
`brew info gradle`). On Windows, use
`C:\Users\...\.gradle\wrapper\dists\gradle-...-bin\...\gradle-...`.
Add a *Gradle* run configuration with Gradle project `server` and task `run`
to run the server from within IntelliJ.

The `kernel` can also be developed in IntelliJ using
[Cursive](https://cursive-ide.com/). Add a *Clojure REPL* run configuration
to run the kernel interactively.

### License

This project is released under the [LGPL v3 license](LICENSE.txt).
