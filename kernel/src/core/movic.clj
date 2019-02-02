(ns core.movic
  "The MOVIC algorithm introduced by Sun and Chen, 2002 for handling conflicting operations.

  The MOVIC algorithm judges all received operations for conflict potential and groups
  compatible operations into a MCGS (maximum compatible group set).
  The constructed MCGS is guaranteed to converge across all sites.

  The algorithm is copied verbatim from Sun and Chen, 2002, with one major exception:
  A different conflict/compatible relation is used ([[core.conflict-relation]])
  which has been designed specifically for detecting feature modeling conflicts.

  Also, we do not distinguish different objects in a document as Sun and Chen, but
  consider only one global object, the feature model (instead of, say, single features).
  This is because features may have arbitrary complex relationships which can not simply
  be divided in unrelated objects."
  (:require [clojure.set :as set]
            [core.history-buffer :as HB]
            [core.conflict-relation :as conflict-relation]))

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
  (reduce #(conj %1 (disj %2 CO-ID)) #{} MCGS))

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

  ; step 1: initialization
  (let [MCGSi-1& (atom MCGSi-1)
        MCGSi& (atom #{})                                   ; MCGSi := {}
        C& (atom (count @MCGSi-1&))                         ; C := |MCGSi-1|
        Oi-compatible? #(conflict-relation/compatible? (HB/lookup HB %) Oi CDAG HB base-FM CC&)
        Oi-conflicting? #(conflict-relation/conflicting? (HB/lookup HB %) Oi CDAG HB base-FM CC&)]

    ; step 2: check operation against existing CGs (maintains properties 1, 2, 3)
    (while (seq @MCGSi-1&)                                  ; Repeat until MCGSi-1 = {}
      (let [CGx& (atom (first @MCGSi-1&))]                  ; Let CGx be a compatible group in MCGSi-1 (order is not significant)
        (swap! MCGSi-1& #(disj % @CGx&))                    ; Remove CGx from MCGSi-1
        (cond
          (every? Oi-compatible? @CGx&)                     ; If Oi is compatible with all operations in CGx, then
          (swap! CGx& #(conj % (Oi :ID)))                   ; CGx := CGx + {Oi}
          (every? Oi-conflicting? @CGx&)                    ; Else if Oi conflicts with all operations in CGx, then
          (swap! C& dec)                                    ; C := C - 1
          :else                                             ; Else
          (let [CGnew (set/select Oi-compatible? @CGx&)     ; CGnew := {O|O is in CGx and O is compatible with Oi}
                CGx' (conj CGnew (Oi :ID))]                 ; CGx' := CGnew + {Oi}
            (swap! MCGSi& #(conj % CGx'))))                 ; MCGSi := MCGSi + {CGx'}
        (swap! MCGSi& #(conj % @CGx&))))                    ; MCGSi := MCGSi + {CGx}

    ; step 3: first operation or conflict with all CGs (maintains property 2)
    (when (zero? @C&)                                       ; If C = 0, then
      (let [CGnew #{(Oi :ID)}]                              ; CGnew := {Oi}
        (swap! MCGSi& #(conj % CGnew))))                    ; MCGSi := MCGSi + {CGnew}

    ; step 4: remove redundant CGs (maintains property 4)
    (run! (fn [CGnew]                                       ; For every CGnew in MCGSi,
            (when (some (fn [CGy]                           ; if there is
                          (and (not= CGy CGnew)             ; another CGy in MCGSi,
                               (set/subset? CGnew CGy))) @MCGSi&) ; such that CGnew is a subset of CGy, then
              (swap! MCGSi& #(disj % CGnew))))              ; MCGSi := MCGSi - {CGnew}
          @MCGSi&)

    @MCGSi&))