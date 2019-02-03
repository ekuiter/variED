(ns kernel.helpers
  "Host-specific helper functions.

  Utilizes reader conditionals to provide different code when compiling
  as Clojure (:clj) and ClojureScript (:cljs)."
  #?(:clj (:import (java.util UUID))))

(defn generate-ID
  "Identifiers generated in the system must be unique.
  For simplicity, we utilize pseudo randomly generated UUIDs (version 4).
  The probability for a collision is very small (50% if 1 billion
  UUIDs are generated per second for about 85 years).
  **TODO**: Generate identifiers from JavaScript."
  []
  #?(:clj  (-> (UUID/randomUUID) .toString)
     :cljs "<insert ID generation code here>"))