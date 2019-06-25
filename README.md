## variED

![variED running on desktop device](https://s3.eu-central-1.amazonaws.com/de.ovgu.spldev.varied/varied.png)

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/ekuiter/variED/tree/build) [![Deploy to Amazon AWS](https://s3.eu-central-1.amazonaws.com/de.ovgu.spldev.varied/awsdeploy.png)](https://console.aws.amazon.com/elasticbeanstalk/?region=eu-central-1#/newApplication?applicationName=variED&platform=Tomcat%208.5%20with%20Java%208%20running%20on%2064bit%20Amazon%20Linux&sourceBundleUrl=https%3A%2F%2Fs3.eu-central-1.amazonaws.com%2Fde.ovgu.spldev.varied%2Fserver.war&environmentType=SingleInstance&tierName=WebServer)

[![Build Status](https://travis-ci.com/ekuiter/variED.svg?branch=master)](https://travis-ci.com/ekuiter/variED)

**What?** variED (the **vari**ability **ed**itor) is a research prototype for viewing, editing and analyzing feature models that supports real-time collaboration. It is currently under active development.

**Why?** In software product line engineering, a team of developers and other stakeholders may be involved in the feature modeling process. To facilitate live, light-weight editing, a real-time editing platform similar to Google Docs or Overleaf may be useful. This enables various use cases, such as sharing and editing feature models or teaching feature model concepts.

**How?** variED relies on a client-server architecture where the client is implemented in TypeScript and the server in Java. It requires Java 1.8 and can be deployed on Java servlet containers such as Apache Tomcat or Jetty. variED allows for optimistic real-time collaboration using a modification of the *multi-version multi-display* (MVMD) technique ([Chen 2001](http://www.ict.griffith.edu.au/david/Thesis.pdf), [Sun and Chen 2002](https://dl.acm.org/citation.cfm?doid=505151.505152)).

**Who?** This project is a research effort of the [DBSE working group](http://www.dbse.ovgu.de/) and released under the [LGPL v3 license](LICENSE.txt). [Contact me](mailto:kuiter@ovgu.de) (the main developer) if you have any questions. You can also leave some [feedback](https://goo.gl/forms/uUJmj68FYir9vEI13) if you like to.

**Detailed resources** are available about ...

- ... conceptual foundations: [**SPLC '19 paper**](http://elias-kuiter.de/splc19-foundations), [**Bachelor thesis**](http://elias-kuiter.de/thesis) + [slides](http://elias-kuiter.de/thesis-slides), [FOSD '19 slides](http://elias-kuiter.de/fosd19-slides)
- ... implementation details: [**Tutorial**](http://elias-kuiter.de/splc19-foundations-artifact), [API documentation](API.md), [kernel documentation](https://s3.eu-central-1.amazonaws.com/de.ovgu.spldev.varied/kernel-documentation/index.html)

### Getting Started

We provide different ways to get started using variED.

#### Demo

The easiest way to get started with variED is to use our [online demo](http://varied.herokuapp.com). This is a standard Heroku deployment, as described below.
Note that this deployment is restarted regularly, so you should not expect it to persist any changes.

#### Deploy to the Cloud

Using the buttons above, you can simply deploy variED to a number of cloud
service providers.

- **Heroku**: Just click the deploy button and register for a free account. This is the fastest way to get started using variED.
- **Amazon AWS**: Using the deploy button, you can deploy to AWS Elastic Beanstalk. In the background, this creates an Amazon EC2 instance. For new accounts, Amazon offers a 1-year free plan. For *Application code*, choose *Upload your code* and *Upload*, then confirm again with *Upload*, *Review and launch* and *Create app*. After the app is set up (this can take a few minutes), the EC2 instance has to be configured to allow inbound traffic on port 8080 for the WebSockets to work. To do that, switch to the EC2 console, then go to *Network & Security > Security Groups*, select your new application, then *Inbound*, *Edit* and *Add Rule*. Create a *Custom TCP Rule* for *Port Range* *8080* and *Save*. Now you can access the app on port 8080 (e.g., `http://…eu-central-1.elasticbeanstalk.com:8080/`).

#### Manual Build

The only dependency required for building is [JDK
1.8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html).
[Gradle](https://gradle.org/), [npm](https://nodejs.org/),
[yarn](https://yarnpkg.com/) and [Leiningen](https://leiningen.org/) 
are downloaded and set up automatically by the build process.
The latest release is available as a pre-built WAR file and can be downloaded
[here](https://github.com/ekuiter/variED/releases/latest).

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

![variED architecture](https://s3.eu-central-1.amazonaws.com/de.ovgu.spldev.varied/architecture.svg)

The server and client both use a collaboration kernel written in Clojure to
perform editing operations and perform optimistic concurrency control. Client and server communicate by sending JSON-encoded messages over a WebSocket connection.

The client makes use of the [React](https://reactjs.org/),
[Redux](https://redux.js.org/), [Office UI
Fabric](https://developer.microsoft.com/en-us/fabric) and
[D3.js](https://d3js.org/) libraries to provide a user interface for feature
modeling.
The server relies on the [FeatureIDE](https://featureide.github.io/) core library to allow im- and export of popular feature model formats and reasoning on feature models.
The client-server interface is described in [API.md](API.md).
For the Clojure kernel,
[documentation](https://s3.eu-central-1.amazonaws.com/de.ovgu.spldev.varied/kernel-documentation/index.html) 
is available as well.

<!-- Parts of the server code are reused in the client (`common` package) by
transpiling them to JavaScript. Because of this, classes in the `common` package
may only use certain APIs (`java.util.*`, a subset of the FeatureIDE API
implemented in the client, and other classes in the `common` package). When in
development, `./gradlew server:transpileCommon` has to be run manually whenever
a `common` class is changed (this is not needed when building). -->

### Development

These are some notes if you want to set up an IDE for development.

- **WebStorm / VS Code**: Open the `client` directory in WebStorm. Add a *npm* run configuration and specify the `start` script to run the client from within WebStorm. Configuration files for Visual Studio Code are included as well. Use of the yarn, ESLint/TSLint and Debugger for Chrome plugins is recommended.
- **IntelliJ IDEA**: Open the `server` directory in IntelliJ and choose *Import Gradle project*. Choose to *use local gradle distribution* and supply the Gradle home, e.g. `/usr/local/Cellar/gradle/4.9/libexec` (on macOS, this can be determined with `brew info gradle`). On Windows, use `C:\Users\...\.gradle\wrapper\dists\gradle-...-bin\...\gradle-...`. Add a *Gradle* run configuration with Gradle project `server` and task `run` to run the server from within IntelliJ. The `kernel` can also be developed in IntelliJ using [Cursive](https://cursive-ide.com/). Add a *Clojure REPL* run configuration to run the kernel interactively.