(ns core
  "Functional core of the kernel.

  Every core module only comprises pure functions that do not affect the global context.
  This simplifies reasoning about modules and their dependencies and eases testing.

  Most modules correspond to a data structure in the global context that is only
  manipulated from the imperative [[shell]].

  Core modules include [[core.causal-dag]], [[core.compound-operation]], [[core.conflict-cache]],
  [[core.conflict-relation]], [[core.feature-model]], [[core.garbage-collector]], [[core.history-buffer]],
  [[core.message]], [[core.movic]], [[core.primitive-operation]], [[core.topological-sort]] and
  [[core.vector-clock]].")