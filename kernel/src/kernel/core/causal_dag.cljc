(ns kernel.core.causal-dag
  "Causal Directed Acyclic Graph, CDAG for short.
  The CDAG captures compound operations' dependencies.

  Nodes in the CDAG are operations.
  Two operations A and B are connected if and only if `(preceding? A B)` with [[kernel.core.compound-operation/preceding?]].

  The CDAG is required to obtain all causally preceding operations (CP) efficiently for a given operation.
  Further, it is used to obtain all causally immediate preceding operations (CIP).

  The CP can easily be computed by determining causally-preceding relationships.
  The CIP corresponds to a transitive reduction of the CDAG and can thus be obtained from
  the CP by removing all transitive edges. (See minimum equivalent graph / maximal elements of CP.)

  The CP is unique across all sites as all operations causally preceding an operation
  always arrive before said operation (guaranteed by TCP).
  For finite DAGs as the CDAG the transitive reduction is unique, therefore the CIP
  is also unique across all sites.

  The CDAG is implemented by mapping compound operations to their respective CPs and CIPs,
  allowing O(1) access.

  If no garbage collection is performed, the CDAG might grow quadratically with time."
  (:require [clojure.set :as set]
            [kernel.core.compound-operation :as CO]
            [kernel.core.history-buffer :as HB]))

; constructor

(defn initialize
  "Initializes a new CDAG without any operations."
  []
  {:CPs  {}
   :CIPs {}})

; getters

(defn get-CO-IDs
  "Returns a sequence of all compound operation identifiers contained in the CDAG."
  [CDAG]
  (keys (CDAG :CPs)))

(defn get-CP
  "Returns a set of all causally preceding operations for a compound operation in O(1).
  This includes transitive edges."
  [CDAG CO-ID]
  (get-in CDAG [:CPs CO-ID]))

(defn get-CIP
  "Returns a set of all causally immediately preceding operations for a compound operation in O(1).
  This excludes transitive edges."
  [CDAG CO-ID]
  (get-in CDAG [:CIPs CO-ID]))

; methods

(defn insert
  "Inserts a newly received operation into the CDAG.
  Calculates the CP by scanning all previously received operations in O(n).
  Calculates the CIP by filtering the CP and removing any operations that are succeeded by any other
  operation in the CP, yielding the maximum elements of the CP or the transitive reduction."
  [CDAG HB CO]
  (let [CO-CP (reduce #(if (CO/preceding? (HB/lookup HB %2) CO) (conj %1 %2) %1) #{} (get-CO-IDs CDAG))
        CO-CIP (set/select (fn [CO-ID']
                             (not-any? #(CO/preceding? (HB/lookup HB CO-ID') (HB/lookup HB %1)) CO-CP))
                           CO-CP)]
    (-> CDAG
        (assoc-in [:CPs (CO/get-ID CO)] CO-CP)
        (assoc-in [:CIPs (CO/get-ID CO)] CO-CIP))))

(defn remove-all-occurrences
  "Removes all occurrences of a value from all sets that m maps to."
  [m val]
  (reduce-kv (fn [acc k set] (assoc acc k (disj set val))) {} m))

(defn _remove
  "Removes an operation from the CDAG in O(n).
  Removes the operation's CP and CIP.
  Also removes the operation from all other operations' CPs and CIPs."
  [CDAG CO-ID]
  (let [update-fn #(-> %
                       (dissoc CO-ID)
                       (remove-all-occurrences CO-ID))]
    (-> CDAG
        (update :CPs update-fn)
        (update :CIPs update-fn))))