(ns shell
  "Imperative shell of the kernel.

  Shell modules may modify the global context in a controlled and isolated way.
  This makes them easier to reason about than undisciplined global variables.
  They define a clear API that is exposed in [[api]] and used by the integration tests.

  The data structures manipulated by shell modules are defined in the functional [[core]].

  Shell modules include [[shell.context]], [[shell.site]], [[shell.client]] and [[shell.server]].")