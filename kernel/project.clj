(defproject kernel "1.0-SNAPSHOT"
  :description
  "Collaborative real-time feature modeling kernel for variED.
  Exposes a simple API that may be consumed by client and server to generate and
  propagate feature modeling operations.
  Written in Clojure to allow for a functional core, imperative shell architecture.
  Can be run in the JVM (on the server) or transpiled to JavaScript (on the client).

  Run `lein repl` and `(require 'api)` to access the kernel API, e.g. `(api/client-initialize! ...)`.
  Run `lein test` to run the integration tests.
  Run `lein codox` to generate this documentation.

  As an introduction, refer to the `api` namespace."
  :url "https://github.com/ekuiter/variED"
  :license {:name "LGPL v3"
            :url  "https://github.com/ekuiter/variED/blob/master/LICENSE.txt"}
  :dependencies [[org.clojure/clojure "1.10.0"]]
  :plugins [[lein-codox "0.10.5" :scope "test"]]
  :codox {:metadata {:doc/format :markdown}})