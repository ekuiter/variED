(ns kernel.core.movic
  "The MOVIC algorithm introduced by Sun and Chen, 2002 for handling conflicting operations.

  The MOVIC algorithm judges all received operations for conflict potential and groups
  compatible operations into a MCGS (maximum compatible group set).
  The constructed MCGS is guaranteed to converge across all sites.

  The algorithm is copied verbatim from Sun and Chen, 2002, with one major exception:
  A different conflict/compatible relation is used ([[kernel.core.conflict-relation]])
  which has been designed specifically for detecting feature modeling conflicts.

  Also, we do not distinguish different objects in a document as Sun and Chen, but
  consider only one global object, the feature model (instead of, say, single features).
  This is because features may have arbitrary complex relationships which can not simply
  be divided in unrelated objects."
  (:require [clojure.set :as set]
            [kernel.core.history-buffer :as HB]
            [kernel.core.conflict-cache :as CC]
            [kernel.core.conflict-relation :as conflict-relation]
            [kernel.core.topological-sort :as topological-sort]
            [kernel.helpers :refer [log]]
            #?(:clj  [taoensso.tufte :as tufte :refer (defnp p profiled profile)]
               :cljs [taoensso.tufte :as tufte :refer-macros (defnp p profiled profile)])
            [kernel.core.compound-operation :as CO]))

; constructor

(defn MCGS-initialize
  "Creates an empty MCGS.
  Serves as a starting point for the MOVIC algorithm."
  []
  #{})

; methods

(defn MCGS-remove
  "Removes an operation from every MCG in the MCGS in O(n) for n MCGs."
  [MCGS CO-ID]
  (p ::MCGS-remove
     (reduce #(conj %1 (disj %2 CO-ID)) #{} MCGS)))

(defn conflict-descriptor
  "A conflict descriptor contains information about a conflict situation.
  It consists of a map of versions, where a CG's string hash is mapped to a sequence
  of topologically ordered operations. Further, a neutral CG is included under
  they key :neutral. The :conflicts key then maps from CG hashes to maps, which
  in turn map from operations to another map, which maps from operations to conflicts.
  The :metadata key maps from operation IDs to metadata, e.g., human-readable descriptions."
  [MCGS CDAG HB CC]
  (p ::conflict-descriptor
     (let [versions (reduce (fn [acc MCG]
                              (assoc acc (str (hash MCG))
                                         (topological-sort/CO-topological-sort CDAG MCG)))
                            {} MCGS)
           versions (assoc versions :neutral (topological-sort/CO-topological-sort
                                               CDAG (reduce set/intersection MCGS)))
           conflicts (reduce (fn [acc MCG]
                               (assoc acc (str (hash MCG))
                                          (reduce (fn [acc CO-ID]
                                                    (assoc acc CO-ID (CC/get-conflicts CC CO-ID)))
                                                  {} MCG)))
                             {} MCGS)
           conflicts (assoc conflicts :neutral #{})
           metadata (reduce #(assoc %1 %2 (let [CO (HB/lookup HB %2)]
                                            {:description (CO/get-description CO)
                                             :icon        (CO/get-icon CO)
                                             :timestamp   (CO/get-timestamp CO)
                                             :site-ID     (CO/get-site-ID CO)}))
                            {} (reduce set/union MCGS))]
       {:versions  versions
        :conflicts conflicts
        :metadata  metadata})))

(defn MOVIC
  "Incrementally constructs an MCGS independent of operation ordering.

  The constructed MCGS has the following properties:

  1. Every CG consists of mutually compatible operations.
  2. Every operation used for construction occurs in at least one CG.
  3. Any group of compatible operations occurs together in at least one CG.
  4. Any two CGs contain at least one pair of conflicting operations.

  The algorithm makes use of atoms, @ and swap! to mutate local variables.
  No arguments are mutated (except for the conflict cache).

  Operations are identified by their IDs, so two different operations with the same parameters will
  still compare as different due to their IDs. Here, operations are identified by equality, this
  is okay as long as no transformation of operations is used (because then operations may be classified
  as different).

  An MCGS only contains operation IDs. Operation metadata is looked up in the history buffer.

  The CDAG, HB, base-FM and CC& arguments are passed down as context for the conflict detection.
  The history buffer is used to obtain operation metadata for conflict detection."
  [MCGSi-1 Oi CDAG HB base-FM CC&]
  (log "running MOVIC algorithm, starting with" (count MCGSi-1) "maximum compatible groups")
  (p ::MOVIC

     ; step 1: initialization
     (let [MCGSi-1& (atom MCGSi-1)
           MCGSi& (atom #{})                                ; MCGSi := {}
           C& (atom (count @MCGSi-1&))                      ; C := |MCGSi-1|
           Oi-compatible? #(conflict-relation/compatible? (HB/lookup HB %) Oi CDAG HB base-FM CC&)
           Oi-conflicting? #(conflict-relation/conflicting? (HB/lookup HB %) Oi CDAG HB base-FM CC&)]

       ; step 2: check operation against existing CGs (maintains properties 1, 2, 3)
       (while (seq @MCGSi-1&)                               ; Repeat until MCGSi-1 = {}
         (let [CGx& (atom (first @MCGSi-1&))]               ; Let CGx be a compatible group in MCGSi-1 (order is not significant)
           (swap! MCGSi-1& #(disj % @CGx&))                 ; Remove CGx from MCGSi-1
           (cond
             (every? Oi-compatible? @CGx&)                  ; If Oi is compatible with all operations in CGx, then
             (swap! CGx& #(conj % (Oi :ID)))                ; CGx := CGx + {Oi}
             (every? Oi-conflicting? @CGx&)                 ; Else if Oi conflicts with all operations in CGx, then
             (swap! C& dec)                                 ; C := C - 1
             :else                                          ; Else
             (let [CGnew (set/select Oi-compatible? @CGx&)  ; CGnew := {O|O is in CGx and O is compatible with Oi}
                   CGx' (conj CGnew (Oi :ID))]              ; CGx' := CGnew + {Oi}
               (swap! MCGSi& #(conj % CGx'))))              ; MCGSi := MCGSi + {CGx'}
           (swap! MCGSi& #(conj % @CGx&))))                 ; MCGSi := MCGSi + {CGx}

       ; step 3: first operation or conflict with all CGs (maintains property 2)
       (when (zero? @C&)                                    ; If C = 0, then
         (let [CGnew #{(Oi :ID)}]                           ; CGnew := {Oi}
           (swap! MCGSi& #(conj % CGnew))))                 ; MCGSi := MCGSi + {CGnew}

       ; step 4: remove redundant CGs (maintains property 4)
       (run! (fn [CGnew]                                    ; For every CGnew in MCGSi,
               (when (some (fn [CGy]                        ; if there is
                             (and (not= CGy CGnew)          ; another CGy in MCGSi,
                                  (set/subset? CGnew CGy))) @MCGSi&) ; such that CGnew is a subset of CGy, then
                 (swap! MCGSi& #(disj % CGnew))))           ; MCGSi := MCGSi - {CGnew}
             @MCGSi&)

       @MCGSi&)))