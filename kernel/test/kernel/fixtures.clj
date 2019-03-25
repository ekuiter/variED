(ns kernel.fixtures
  (:require [kernel.core.feature-model :as FM]))

(defn example-FM
  "Expressed specific to the implementation, here in the simple hash table approach."
  []
  (FM/initialize
    {:features    {:Eclipse             {:parent-ID nil, :group-type :and, :optional? false}
                   :JDT                 {:parent-ID :Eclipse, :group-type :and, :optional? true}
                   :CDT                 {:parent-ID :Eclipse, :group-type :and, :optional? true}
                   :AJDT                {:parent-ID :Eclipse, :group-type :and, :optional? true}
                   :FeatureModeling     {:parent-ID :Eclipse, :group-type :and, :optional? true}
                   :CIDE                {:parent-ID :FeatureModeling, :group-type :and, :optional? true}
                   :FAMILIAR            {:parent-ID :FeatureModeling, :group-type :and, :optional? true}
                   :FeatureIDE          {:parent-ID :FeatureModeling, :group-type :or, :optional? true}
                   :AHEAD               {:parent-ID :FeatureIDE, :group-type :and, :optional? true}
                   :FeatureHouse        {:parent-ID :FeatureIDE, :group-type :and, :optional? true}
                   :FeatureCpp          {:parent-ID :FeatureIDE, :group-type :and, :optional? true}
                   :DeltaJ              {:parent-ID :FeatureIDE, :group-type :and, :optional? true}
                   :AspectJ             {:parent-ID :FeatureIDE, :group-type :and, :optional? true}
                   :Munge               {:parent-ID :FeatureIDE, :group-type :and, :optional? true}
                   :DeltaMontiArc       {:parent-ID :FeatureIDE, :group-type :and, :optional? true}
                   :ExtendedFM          {:parent-ID :FeatureModeling, :group-type :and, :optional? true}
                   :MoSoPoLiTe          {:parent-ID :FeatureModeling, :group-type :and, :optional? true}
                   :DeltaJEclipsePlugin {:parent-ID :Eclipse, :group-type :and, :optional? true}}
     ; any formula representation will do
     :constraints {:1 {:formula "<imp><disj><var>AHEAD</var><disj><var>FeatureHouse</var><disj><var>Munge</var><var>Antenna</var></disj></disj></disj><var>JDT</var></imp>", :graveyarded? false}
                   :2 {:formula "<imp><var>FeatureCpp</var><var>CDT</var></imp>", :graveyarded? false}
                   :3 {:formula "<imp><var>AspectJ</var><var>AJDT</var></imp>", :graveyarded? false}
                   :4 {:formula "<imp><var>DeltaJ</var><var>DeltaJEclipsePlugin</var></imp>", :graveyarded? false}}}))