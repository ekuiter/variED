(ns kernel.core
  "Functional core of the kernel.

  Every core module only comprises pure functions that do not affect the global context.
  This simplifies reasoning about modules and their dependencies and eases testing.

  Most modules correspond to a data structure in the global context that is only
  manipulated from the imperative [[kernel.shell]].

  Core modules include [[kernel.core.causal-dag]], [[kernel.core.compound-operation]], [[kernel.core.conflict-cache]],
  [[kernel.core.conflict-relation]], [[kernel.core.feature-model]], [[kernel.core.garbage-collector]], [[kernel.core.history-buffer]],
  [[kernel.core.message]], [[kernel.core.movic]], [[kernel.core.primitive-operation]], [[kernel.core.topological-sort]] and
  [[kernel.core.vector-clock]].")