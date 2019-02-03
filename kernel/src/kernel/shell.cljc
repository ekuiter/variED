(ns kernel.shell
  "Imperative shell of the kernel.

  Shell modules may modify the global context in a controlled and isolated way.
  This makes them easier to reason about than undisciplined global variables.
  They define a clear API that is exposed in [[kernel.api]] and used by the integration tests.

  The data structures manipulated by shell modules are defined in the functional [[kernel.core]].

  Shell modules include [[kernel.shell.context]], [[kernel.shell.site]], [[kernel.shell.client]] and [[kernel.shell.server]].")