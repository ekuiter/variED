(ns kernel.helpers
  "Host-specific helper functions.

  Utilizes reader conditionals to provide different code when compiling
  as Clojure (:clj) and ClojureScript (:cljs)."
  #?@(:clj  [(:import (java.util UUID)
                      [java.io ByteArrayInputStream ByteArrayOutputStream])
             (:require [clojure.string :as string]
                       [cognitect.transit :as transit]
                       [taoensso.tufte :as tufte :refer (defnp p profiled profile)])]
      :cljs [(:require [clojure.string :as string]
                       [cognitect.transit :as transit]
                       [taoensso.tufte :as tufte :refer-macros (defnp p profiled profile)])]))

(def ^:dynamic *logger-fn* nil)
(def ^:dynamic *generate-ID-fn*)
(def ^:dynamic *semantic-rules* '())

(defn timestamp []
  #?(:cljs (.getTime (js/Date.))))

(defn generate-ID
  "Identifiers generated in the system must be unique.
  For simplicity, we utilize pseudo randomly generated UUIDs (version 4).
  The probability for a collision is very small (50% if 1 billion
  UUIDs are generated per second for about 85 years)."
  []
  #?(:clj  (-> (UUID/randomUUID) .toString)
     :cljs (*generate-ID-fn*)))

(defn encode [data]
  (p ::encode
     #?(:clj  (let [out (ByteArrayOutputStream. 4096)
                    writer (transit/writer out :json)]
                (transit/write writer data)
                (.toString out))
        :cljs (let [writer (transit/writer :json)]
                   (transit/write writer data)))))

(defn decode [str]
  (p ::decode
     #?(:clj  (let [in (ByteArrayInputStream. (.getBytes str))
                    reader (transit/reader in :json)]
                (transit/read reader))
        :cljs (let [reader (transit/reader :json)]
                   (transit/read reader str)))))

(defn combined-effect-encode [combined-effect]
  (p ::combined-effect-encode
     #?(:cljs (clj->js combined-effect))))

(defn formula-decode [formula]
  (p ::formula-decode
     #?(:cljs (js->clj formula))))

(defn set-logger-fn [logger-fn]
  (p ::set-logger-fn
     (def ^:dynamic *logger-fn* logger-fn))
  nil)

(defn set-generate-ID-fn [generate-ID-fn]
  (p ::set-generate-ID-fn
     (def ^:dynamic *generate-ID-fn* generate-ID-fn))
  nil)

(defn set-semantic-rules [semantic-rules]
  (p ::set-semantic-rules
     (def ^:dynamic *semantic-rules* (map #(fn [FM] (% (encode FM))) semantic-rules)))
  nil)

(defn log [& args]
  (p ::log
     (when *logger-fn*
       (*logger-fn* (string/join " " args)))
     nil))

(defn semantic-rules []
  *semantic-rules*)