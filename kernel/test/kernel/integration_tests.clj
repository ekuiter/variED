(ns kernel.integration-tests
  (:require [clojure.test :refer :all]
            [kernel.core.compound-operation :as CO]
            [kernel.core.history-buffer :as HB]
            [kernel.core.feature-model :as FM]
            [kernel.fixtures :refer :all]
            [kernel.simulator :refer :all]))

(deftest single-user
  (testing "simple example of single-user application"
    (let [op (CO/create-feature-below (example-FM) :AHEAD)
          fm (CO/_apply (example-FM) (CO/make op nil nil nil))
          op' (CO/remove-feature fm :AHEAD)
          fm (CO/_apply fm (CO/make op' nil nil nil))
          fm (CO/_apply fm (CO/make (CO/invert-PO-sequence op') nil nil nil)) ; undo removal
          fm (CO/_apply fm (CO/make (CO/invert-PO-sequence op) nil nil nil)) ; undo creation
          fm (CO/_apply fm (CO/make (CO/invert-PO-sequence (CO/invert-PO-sequence op)) nil nil nil))] ; redo creation
      fm)))

(deftest vector-clock
  (testing "simple demonstration of vector clocks and causality"
    (initialize-mesh-topology! (example-FM) :A :B)
    (let [op (generate! :A (CO/make-PO-sequence))]
      (receive! :B op)
      (let [op' (generate! :B (CO/make-PO-sequence))]
        (receive! :A op')
        (is-at-site :A #(and (CO/preceding? op op') (not (CO/preceding? op' op))))
        (is-at-site :B #(and (CO/preceding? op op') (not (CO/preceding? op' op))))
        (let [op-A (generate! :A (CO/make-PO-sequence))
              op-B (generate! :B (CO/make-PO-sequence))]
          (receive! :A op-B)
          (is-at-site :A #(and (CO/concurrent? op-A op-B) (CO/preceding? op op-A) (CO/preceding? op' op-A)))
          (receive! :B op-A)
          (is-at-site :B #(and (CO/concurrent? op-A op-B) (CO/preceding? op op-B) (CO/preceding? op' op-B)))
          (is-sync))))))

(deftest mesh-topology
  ; Some simple integration tests following that initialize a set of
  ; (fixed) sites that exchange operations. The system is correct if
  ; - all sites converge
  ; - the model converged to is correct
  ; To check convergence, is-sync marks points in time where all sites
  ; should have the same state and feature model.
  ; The correctness of the model is checked at the end of each test.

  (testing "single-site scenarios for basic functionality"
    (testing "create feature below"
      (initialize-mesh-topology! (example-FM) :A)
      (let [op (generate! :A #(CO/create-feature-below % :Eclipse))
            FM (combined-effect :A)]
        (is (= (FM/get-feature-parent-ID FM (CO-created-ID op)) :Eclipse))))

    (testing "create feature above"
      (initialize-mesh-topology! (example-FM) :A)
      (let [op (generate! :A #(CO/create-feature-above % :AHEAD :FeatureHouse))
            ID (CO-created-ID op)
            FM (combined-effect :A)]
        (is (= (FM/get-feature-parent-ID FM ID) :FeatureIDE))
        (is (= (FM/get-feature-group-type FM ID) :or))
        (is (= (FM/get-feature-parent-ID FM :AHEAD) ID))
        (is (= (FM/get-feature-parent-ID FM :FeatureHouse) ID))))

    (testing "move feature tree"
      (initialize-mesh-topology! (example-FM) :A)
      (let [_ (generate! :A #(CO/move-feature-subtree % :AHEAD :Eclipse))
            FM (combined-effect :A)]
        (is (= (FM/get-feature-parent-ID FM :AHEAD) :Eclipse))))

    (testing "remove feature tree"
      (initialize-mesh-topology! (example-FM) :A)
      (let [_ (generate! :A #(CO/remove-feature-subtree % :FeatureIDE))
            FM (combined-effect :A)]
        (is (= (FM/get-feature-parent-ID FM :FeatureIDE) :graveyard))
        (is (= (FM/get-feature-parent-ID FM :AHEAD) :FeatureIDE))))

    (testing "remove feature"
      (initialize-mesh-topology! (example-FM) :A)
      (let [_ (generate! :A #(CO/remove-feature % :FeatureModeling))
            FM (combined-effect :A)]
        (is (= (FM/get-feature-parent-ID FM :FeatureModeling) :graveyard))
        (is (= (FM/get-feature-parent-ID FM :CIDE) :Eclipse))
        (is (= (FM/get-feature-parent-ID FM :FAMILIAR) :Eclipse))
        (is (= (FM/get-feature-parent-ID FM :FeatureIDE) :Eclipse))
        (is (= (FM/get-feature-parent-ID FM :ExtendedFM) :Eclipse))
        (is (= (FM/get-feature-parent-ID FM :MoSoPoLiTe) :Eclipse))))

    (testing "set feature optional"
      (initialize-mesh-topology! (example-FM) :A)
      (let [_ (generate! :A #(CO/set-feature-optional? % :JDT false))
            FM (combined-effect :A)]
        (is (= (FM/get-feature-optional? FM :JDT) false))))

    (testing "set feature group type"
      (initialize-mesh-topology! (example-FM) :A)
      (let [_ (generate! :A #(CO/set-feature-group-type % :JDT :or))
            FM (combined-effect :A)]
        (is (= (FM/get-feature-group-type FM :JDT) :or))))

    (testing "create constraint"
      (initialize-mesh-topology! (example-FM) :A)
      (let [op (generate! :A #(CO/create-constraint % "formula"))
            FM (combined-effect :A)]
        (is (= (FM/get-constraint-formula FM (CO-created-ID op)) "formula"))))

    (testing "set constraint"
      (initialize-mesh-topology! (example-FM) :A)
      (let [_ (generate! :A #(CO/set-constraint % :1 "formula"))
            FM (combined-effect :A)]
        (is (= (FM/get-constraint-formula FM :1) "formula"))))

    (testing "remove constraint"
      (initialize-mesh-topology! (example-FM) :A)
      (let [_ (generate! :A #(CO/remove-constraint % :1))
            FM (combined-effect :A)]
        (is (= (FM/get-constraint-graveyarded? FM :1) true)))))

  (testing "scenario with two sites, no concurrency"
    (initialize-mesh-topology! (example-FM) :A :B)
    (let [A1 (generate! :A #(CO/create-feature-below % :DeltaJEclipsePlugin))
          _ (receive! :B A1)
          _ (is-sync)
          A2 (generate! :A #(CO/set-feature-group-type % :MoSoPoLiTe :or))
          _ (receive! :B A2)
          _ (is-sync)
          B1 (generate! :B #(CO/set-feature-group-type % :MoSoPoLiTe :alternative))
          B2 (generate! :B #(CO/set-feature-optional? % :DeltaJEclipsePlugin false))
          _ (receive! :A B1 B2)
          _ (is-sync)
          FM (combined-effect :A)]
      (is (= (FM/get-feature-parent-ID FM (CO-created-ID A1)) :DeltaJEclipsePlugin))
      (is (= (FM/get-feature-group-type FM :MoSoPoLiTe) :alternative))
      (is (= (FM/get-feature-optional? FM :DeltaJEclipsePlugin) false))))

  (testing "two sites, basic compatible concurrency"
    (initialize-mesh-topology! (example-FM) :A :B)
    (let [A1 (generate! :A #(CO/set-feature-optional? % :CIDE false))
          B1 (generate! :B #(CO/set-feature-optional? % :FAMILIAR false))
          _ (receive! :A B1)
          _ (receive! :B A1)
          _ (is-sync)
          A2 (generate! :A #(CO/remove-feature % :DeltaJ))
          A3 (generate! :A #(CO/create-feature-below % :FeatureIDE))
          A4 (generate! :A #(CO/set-feature-group-type % (CO-created-ID A3) :alternative))
          B2 (generate! :B #(CO/create-feature-below % :FeatureIDE))
          B3 (generate! :B #(CO/set-feature-group-type % (CO-created-ID B2) :or))
          _ (receive! :A B2 B3)
          _ (receive! :B A2 A3 A4)
          _ (is-sync)
          FM (combined-effect :A)]
      (is (= (FM/get-feature-optional? FM :CIDE) false))
      (is (= (FM/get-feature-optional? FM :FAMILIAR) false))
      (is (= (FM/get-feature-parent-ID FM :DeltaJ) :graveyard))
      (is (= (FM/get-feature-parent-ID FM :FeatureIDE) :FeatureModeling))
      (is (= (FM/get-feature-parent-ID FM (CO-created-ID A3)) :FeatureIDE))
      (is (= (FM/get-feature-parent-ID FM (CO-created-ID B2)) :FeatureIDE))
      (is (= (FM/get-feature-group-type FM (CO-created-ID A3)) :alternative))
      (is (= (FM/get-feature-group-type FM (CO-created-ID B2)) :or))))

  (testing "two sites, interleaved compatible concurrency"
    (initialize-mesh-topology! (example-FM) :A :B)
    (let [A1 (generate! :A #(CO/set-feature-optional? % :CIDE false))
          B1 (generate! :B #(CO/set-feature-optional? % :FAMILIAR false))
          _ (receive! :A B1)
          _ (receive! :B A1)
          _ (is-sync)
          A2 (generate! :A #(CO/create-feature-below % :FeatureModeling))
          A3 (generate! :A #(CO/set-feature-optional? % (CO-created-ID A2) false))
          _ (receive! :B A2)
          ; B2 succeeds A2, but precedes A3
          B2 (generate! :B #(CO/set-feature-group-type % (CO-created-ID A2) :or))
          _ (receive! :B A3)
          _ (receive! :A B2)
          _ (is-sync)
          FM (combined-effect :A)]
      (is (= (FM/get-feature-optional? FM :CIDE) false))
      (is (= (FM/get-feature-optional? FM :FAMILIAR) false))
      (is (= (FM/get-feature-parent-ID FM (CO-created-ID A2)) :FeatureModeling))
      (is (= (FM/get-feature-optional? FM (CO-created-ID A2)) false))
      (is (= (FM/get-feature-group-type FM (CO-created-ID A2)) :or))
      ))

  (testing "three sites, basic compatible concurrency"
    ; P2P is allowed as long as causality is preserved
    (initialize-mesh-topology! (example-FM) :A :B :C)
    (let [A1 (generate! :A #(CO/set-feature-optional? % :CIDE false))
          B1 (generate! :B #(CO/set-feature-optional? % :FAMILIAR false))
          _ (receive! :A B1)
          _ (receive! :B A1)
          _ (receive! :C A1 B1)
          C1 (generate! :C #(CO/set-feature-optional? % :CIDE true))
          _ (receive! :A C1)
          _ (receive! :B C1)
          _ (is-sync)
          A2 (generate! :A #(CO/remove-feature % :DeltaJ))
          A3 (generate! :A #(CO/create-feature-below % :FeatureIDE))
          A4 (generate! :A #(CO/set-feature-group-type % (CO-created-ID A3) :alternative))
          B2 (generate! :B #(CO/create-feature-below % :FeatureIDE))
          B3 (generate! :B #(CO/set-feature-group-type % (CO-created-ID B2) :or))
          C2 (generate! :C #(CO/remove-feature % :AspectJ))
          _ (receive! :A B2 C2 B3)
          _ (receive! :B A2 A3 C2 A4)
          _ (receive! :C A2 B2 A3 B3 A4)
          _ (is-sync)
          FM (combined-effect :A)]
      (is (= (FM/get-feature-optional? FM :CIDE) true))
      (is (= (FM/get-feature-optional? FM :FAMILIAR) false))
      (is (= (FM/get-feature-parent-ID FM :DeltaJ) :graveyard))
      (is (= (FM/get-feature-parent-ID FM :FeatureIDE) :FeatureModeling))
      (is (= (FM/get-feature-parent-ID FM (CO-created-ID A3)) :FeatureIDE))
      (is (= (FM/get-feature-parent-ID FM (CO-created-ID B2)) :FeatureIDE))
      (is (= (FM/get-feature-group-type FM (CO-created-ID A3)) :alternative))
      (is (= (FM/get-feature-group-type FM (CO-created-ID B2)) :or))))

  (testing "two sites, basic conflicting concurrency"
    (initialize-mesh-topology! (example-FM) :A :B)
    (let [A1 (generate! :A #(CO/set-feature-optional? % :CIDE false))
          B1 (generate! :B #(CO/set-feature-optional? % :FAMILIAR false))
          _ (receive! :A B1)
          _ (receive! :B A1)
          _ (is-sync)
          A2 (generate! :A #(CO/remove-feature % :DeltaJ))
          A3 (generate! :A #(CO/create-feature-below % :FeatureIDE))
          A4 (generate! :A #(CO/set-feature-group-type % (CO-created-ID A3) :alternative))
          B2 (generate! :B #(CO/create-feature-below % :FeatureIDE))
          B3 (generate! :B #(CO/set-feature-group-type % (CO-created-ID B2) :or))
          B4 (generate! :B #(CO/remove-feature-subtree % :FeatureIDE))
          _ (receive! :A B2 B3 B4)
          _ (receive! :B A2 A3 A4)
          _ (is-sync)
          FM (combined-effect :A)
          MCGS (MCGS :A)]
      (is (FM :conflicts))
      ; B4 is in conflict with A2, A3, A4
      ; i.e., one CG will include A1, B1, A2, A3, A4, B2, B3
      ; and the other will include A1, B1, B2, B3, B4
      (is (= MCGS #{#{(A1 :ID) (B1 :ID) (A2 :ID) (A3 :ID) (A4 :ID) (B2 :ID) (B3 :ID)}
                    #{(A1 :ID) (B1 :ID) (B2 :ID) (B3 :ID) (B4 :ID)}}))))

  (testing "two sites, interleaved conflicting concurrency"
    (initialize-mesh-topology! (example-FM) :A :B)
    (let [A1 (generate! :A #(CO/set-feature-optional? % :CIDE false))
          B1 (generate! :B #(CO/set-feature-optional? % :FAMILIAR false))
          _ (receive! :A B1)
          _ (receive! :B A1)
          _ (is-sync)
          A2 (generate! :A #(CO/remove-feature % :DeltaJ))
          A3 (generate! :A #(CO/create-feature-below % :FeatureIDE))
          A4 (generate! :A #(CO/set-feature-group-type % (CO-created-ID A3) :alternative))
          ; B receives A2 before generating B2, B3, B4
          _ (receive! :B A2)
          B2 (generate! :B #(CO/create-feature-below % :FeatureIDE))
          B3 (generate! :B #(CO/set-feature-group-type % (CO-created-ID B2) :or))
          B4 (generate! :B #(CO/remove-feature-subtree % :FeatureIDE))
          _ (receive! :A B2 B3 B4)
          _ (receive! :B A3 A4)
          _ (is-sync)
          FM (combined-effect :A)
          MCGS (MCGS :A)]
      (is (FM :conflicts))
      ; B4 is in conflict with A3, A4
      ; i.e., one CG will include A1, B1, A2, A3, A4, B2, B3
      ; and the other will include A1, B1, B2, B3, B4, and now also A2
      (is (= MCGS #{#{(A1 :ID) (B1 :ID) (A2 :ID) (A3 :ID) (A4 :ID) (B2 :ID) (B3 :ID)}
                    #{(A1 :ID) (B1 :ID) (B2 :ID) (B3 :ID) (B4 :ID) (A2 :ID)}}))))

  (testing "three sites, basic conflicting concurrency"
    (initialize-mesh-topology! (example-FM) :A :B :C)
    (let [A1 (generate! :A #(CO/set-feature-optional? % :CIDE false))
          B1 (generate! :B #(CO/set-feature-optional? % :FAMILIAR false))
          _ (receive! :A B1)
          _ (receive! :B A1)
          _ (receive! :C A1 B1)
          C1 (generate! :C #(CO/set-feature-optional? % :CIDE true))
          _ (receive! :A C1)
          _ (receive! :B C1)
          _ (is-sync)
          A2 (generate! :A #(CO/remove-feature % :DeltaJ))
          A3 (generate! :A #(CO/create-feature-below % :FeatureIDE))
          A4 (generate! :A #(CO/set-feature-group-type % (CO-created-ID A3) :alternative))
          _ (receive! :C A2)
          B2 (generate! :B #(CO/create-feature-below % :FeatureIDE))
          B3 (generate! :B #(CO/set-feature-group-type % (CO-created-ID B2) :or))
          C2 (generate! :C #(CO/remove-feature-subtree % :FeatureIDE))
          _ (receive! :A B2 C1 C2 B3)
          _ (receive! :B A2 A3 C1 A4 C2)
          _ (receive! :C B2 A3 B3 A4)
          _ (is-sync)
          FM (combined-effect :A)
          MCGS (MCGS :A)]
      (is (FM :conflicts))
      ; C2 is in conflict with A3, A4, B2, B3
      ; i.e., one CG will include A1, B1, C1, A2, A3, A4, B2, B3
      ; and the other will include A1, B1, C1, C2, and now also A2
      (is (= MCGS #{#{(A1 :ID) (B1 :ID) (C1 :ID) (A2 :ID) (A3 :ID) (A4 :ID) (B2 :ID) (B3 :ID)}
                    #{(A1 :ID) (B1 :ID) (C1 :ID) (C2 :ID) (A2 :ID)}}))))

  (testing "four sites, interleaved conflicting concurrency"
    (initialize-mesh-topology! (example-FM) :A :B :C :D)
    (let [A1 (generate! :A #(CO/set-feature-optional? % :CIDE false))
          B1 (generate! :B #(CO/set-feature-optional? % :FAMILIAR false))
          _ (receive! :A B1)
          _ (receive! :B A1)
          _ (receive! :C A1 B1)
          C1 (generate! :C #(CO/set-feature-optional? % :CIDE true))
          _ (receive! :A C1)
          _ (receive! :B C1)
          A2 (generate! :A #(CO/remove-feature % :DeltaJ))
          A3 (generate! :A #(CO/create-feature-below % :FeatureIDE))
          _ (receive! :D A1 B1 C1 A2 A3)
          D1 (generate! :D #(CO/set-feature-group-type % (CO-created-ID A3) :or))
          A4 (generate! :A #(CO/set-feature-group-type % (CO-created-ID A3) :alternative))
          _ (receive! :C A2)
          B2 (generate! :B #(CO/create-feature-below % :FeatureIDE))
          B3 (generate! :B #(CO/set-feature-group-type % (CO-created-ID B2) :or))
          C2 (generate! :C #(CO/remove-feature-subtree % :FeatureIDE))
          _ (receive! :A D1 B2 C1 C2 B3)
          _ (receive! :B A2 A3 D1 C1 A4 C2)
          _ (receive! :C B2 A3 B3 D1 A4)
          _ (receive! :D C2 B2 A4 B3)
          _ (is-sync)
          FM (combined-effect :A)
          MCGS (MCGS :A)]
      (is (FM :conflicts))
      ; C2 is in conflict with A3, A4, B2, B3; D1 is in conflict with A4, C2
      ; i.e., one CG will include A1, B1, C1, A2, A3, A4, B2, B3
      ; and the other will include A1, B1, C1, C2, A2
      ; and the third will include A1, B1, C1, A2, A3, B2, B3, D1
      (is (= MCGS #{#{(A1 :ID) (B1 :ID) (C1 :ID) (A2 :ID) (A3 :ID) (A4 :ID) (B2 :ID) (B3 :ID)}
                    #{(A1 :ID) (B1 :ID) (C1 :ID) (C2 :ID) (A2 :ID)}
                    #{(A1 :ID) (B1 :ID) (C1 :ID) (A2 :ID) (A3 :ID) (B2 :ID) (B3 :ID) (D1 :ID)}}))))

  (testing "four sites, interleaved conflicting concurrency with irregular garbage collection"
    (initialize-mesh-topology! (example-FM) :A :B :C :D)
    (let [A1 (generate! :A #(CO/set-feature-optional? % :CIDE false))
          B1 (generate! :B #(CO/set-feature-optional? % :FAMILIAR false))
          _ (receive! :A B1)
          _ (receive! :B A1)
          _ (receive! :C A1 B1)
          _ (GC! :A)
          C1 (generate! :C #(CO/set-feature-optional? % :CIDE true))
          _ (receive! :A C1)
          _ (receive! :B C1)
          A2 (generate! :A #(CO/remove-feature % :DeltaJ))
          A3 (generate! :A #(CO/create-feature-below % :FeatureIDE))
          _ (receive! :D A1 B1 C1 A2 A3)
          _ (GC! :B)
          D1 (generate! :D #(CO/set-feature-group-type % (CO-created-ID A3) :or))
          A4 (generate! :A #(CO/set-feature-group-type % (CO-created-ID A3) :alternative))
          _ (GC! :A)
          _ (receive! :C A2)
          B2 (generate! :B #(CO/create-feature-below % :FeatureIDE))
          B3 (generate! :B #(CO/set-feature-group-type % (CO-created-ID B2) :or))
          _ (GC! :C)
          C2 (generate! :C #(CO/remove-feature-subtree % :FeatureIDE))
          _ (receive! :A D1 B2 C1 C2 B3)
          _ (receive! :B A2 A3 D1 C1 A4 C2)
          _ (receive! :C B2 A3 B3 D1 A4)
          _ (receive! :D C2 B2 A4 B3)
          _ (GC! :A)
          _ (GC! :B)
          _ (GC! :C)
          _ (GC! :D)
          _ (is-sync)
          FM (combined-effect :A)
          MCGS (MCGS :A)]
      (is (FM :conflicts))
      ; A1, B1 and C1 are garbage collected because they are the only
      ; operations succeeded by every site
      (is (= MCGS #{#{(A2 :ID) (A3 :ID) (A4 :ID) (B2 :ID) (B3 :ID)}
                    #{(C2 :ID) (A2 :ID)}
                    #{(A2 :ID) (A3 :ID) (B2 :ID) (B3 :ID) (D1 :ID)}})))))

(deftest star-topology
  ; Now, some star topologies with dynamic sets of sites.
  ; These tests catch some subtleties about garbage collection.
  ; For example, if a new site joins, this affects the operations which may be GC'd.

  (testing "three sites joining, basic compatible concurrency"
    (initialize-star-topology! (example-FM))
    (let [_JA (join! :A)
          JB (join! :B)
          _ (receive! :A JB)
          A1 (generate! :A #(CO/set-feature-optional? % :CIDE false))
          A2 (generate! :A #(CO/set-feature-optional? % :FAMILIAR false))
          SA1 (receive*! A1)
          _ (receive! :B SA1)
          B1 (generate! :B #(CO/set-feature-optional? % :CIDE true))
          SB1 (receive*! B1)
          _ (receive! :A SB1)
          JC (join! :C)
          C1 (generate! :C #(CO/set-feature-optional? % :JDT false))
          _ (receive! :A JC)
          _ (receive! :B JC)
          SA2 (receive*! A2)
          _ (receive! :B SA2)
          _ (receive! :C SA2)
          SC1 (receive*! C1)
          _ (receive! :A SC1)
          _ (receive! :B SC1)
          _ (GC! :A)
          _ (GC! :B)
          _ (GC! :C)
          _ (GC! :server)
          _ (is-sync)]
      (is (GC'd? :A A1))
      (is (not (GC'd? :A A2)))
      (is (not (GC'd? :A B1)))
      (is (not (GC'd? :A C1)))))

  (testing "explicit user, implicit server heartbeat"
    (initialize-star-topology! (example-FM))
    (let [_JA (join! :A)
          A1 (generate! :A #(CO/set-feature-optional? % :CIDE false))
          A2 (generate! :A #(CO/set-feature-optional? % :CIDE true))
          _SA1 (receive*! A1)
          JB (join! :B)
          _ (receive! :A JB)
          SA2 (receive*! A2)
          _ (GC! :A)
          _ (GC! :B)
          _ (GC! :server)
          _ (is (and (GC'd? :A A1) (not (GC'd? :A A2))))
          _ (is (and (GC'd? :server A1) (not (GC'd? :server A2))))
          BHB1 (generate-heartbeat! :B)
          SBHB1 (receive*! BHB1)
          _ (receive! :A SBHB1)
          _ (receive! :B SA2)
          _ (GC! :A)
          _ (GC! :B)
          _ (GC! :server)
          _ (is (and (GC'd? :A A1) (not (GC'd? :A A2))))
          _ (is (and (GC'd? :B A1) (not (GC'd? :B A2))))
          _ (is (and (GC'd? :server A1) (not (GC'd? :server A2))))
          _ (is-sync)]))

  (testing "implicit user, implicit server heartbeat, late-joining user"
    (initialize-star-topology! (example-FM))
    (let [_JA (join! :A)
          A1 (generate! :A #(CO/set-feature-optional? % :CIDE false))
          A2 (generate! :A #(CO/set-feature-optional? % :CIDE true))
          _SA1 (receive*! A1)
          JB (join! :B)
          _ (receive! :A JB)
          SA2 (receive*! A2)
          _ (GC! :A)
          _ (GC! :B)
          _ (GC! :server)
          _ (is (and (GC'd? :A A1) (not (GC'd? :A A2))))
          _ (is (and (GC'd? :server A1) (not (GC'd? :server A2))))
          JC (join! :C)
          C1 (generate! :C #(CO/remove-feature % :JDT))
          B1 (generate! :B #(CO/set-feature-optional? % :FAMILIAR false))
          SB1 (receive*! B1)
          _ (receive! :A JC)
          _ (receive! :A JB)
          _ (receive! :A SB1)
          _ (receive! :B SA2)
          _ (receive! :C SB1)
          SC1 (receive*! C1)
          _ (receive! :A SC1)
          _ (receive! :B SC1)
          _ (GC! :A)
          _ (GC! :B)
          _ (GC! :C)
          _ (GC! :server)
          _ (is (and (GC'd? :A A1) (not (GC'd? :A A2)) (not (GC'd? :A B1)) (not (GC'd? :A C1))))
          _ (is (and (GC'd? :B A1) (not (GC'd? :B A2)) (not (GC'd? :A B1)) (not (GC'd? :A C1))))
          _ (is (and (GC'd? :C A1) (not (GC'd? :C A2)) (not (GC'd? :A B1)) (not (GC'd? :A C1))))
          _ (is (and (GC'd? :server A1) (not (GC'd? :server A2)) (not (GC'd? :server B1)) (not (GC'd? :server C1))))
          _ (is-sync)]))

  (testing "explicit server heartbeat with one user"
    (initialize-star-topology! (example-FM))
    (let [_JA (join! :A)
          A1 (generate! :A #(CO/set-feature-optional? % :CIDE false))
          A2 (generate! :A #(CO/set-feature-optional? % :CIDE true))
          _SA1 (receive*! A1)
          _SA2 (receive*! A2)
          _ (GC! :A)
          _ (GC! :server)
          _ (is (not (or (GC'd? :A A1) (GC'd? :A A2))))
          _ (is (and (GC'd? :server A1) (not (GC'd? :server A2))))
          ; some time passes, the server generates a heartbeat
          SHB1 (generate-heartbeat*!)
          _ (receive! :A SHB1)
          _ (GC! :A)
          _ (is (and (GC'd? :A A1) (not (GC'd? :A A2))))
          _ (is (and (GC'd? :server A1) (not (GC'd? :server A2))))
          _ (is-sync)]))

  (testing "implicit server heartbeat with one user by late-joining user"
    (initialize-star-topology! (example-FM))
    (let [_JA (join! :A)
          A1 (generate! :A #(CO/set-feature-optional? % :CIDE false))
          A2 (generate! :A #(CO/set-feature-optional? % :CIDE true))
          _SA1 (receive*! A1)
          _SA2 (receive*! A2)
          _ (GC! :A)
          _ (GC! :server)
          _ (is (not (or (GC'd? :A A1) (GC'd? :A A2))))
          _ (is (and (GC'd? :server A1) (not (GC'd? :server A2))))
          JB (join! :B)
          _ (receive! :A JB)
          _ (GC! :A)
          _ (GC! :server)
          _ (is (and (GC'd? :A A1) (not (GC'd? :A A2))))
          _ (is (and (GC'd? :server A1) (not (GC'd? :server A2))))
          _ (is-sync)]))

  (testing "leaving user"
    (initialize-star-topology! (example-FM))
    (let [_JA (join! :A)
          JB (join! :B)
          _ (receive! :A JB)
          A1 (generate! :A #(CO/set-feature-optional? % :CIDE false))
          SA1 (receive*! A1)
          _ (receive! :B SA1)
          _ (is (contains? ((HB/lookup (HB :server) (A1 :ID)) :VC) :A))
          _ (is (contains? ((HB/lookup (HB :B) (A1 :ID)) :VC) :A))
          LA (leave! :A)
          _ (is (not (contains? ((HB/lookup (HB :server) (A1 :ID)) :VC) :A)))
          _ (receive! :B LA)
          _ (is (not (contains? ((HB/lookup (HB :server) (A1 :ID)) :VC) :A)))
          _ (is-sync)])))