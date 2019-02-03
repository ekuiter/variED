(ns kernel.shell.context
  "Global site context.
  Contains all state managed by a particular site.

  The context maps the following keys:

  - *site-ID*: the site's identifier
  - *VC*: the current vector clock, wrapped in an atom
  - *CDAG*: the current causal directed acyclic graph, wrapped in an atom
  - *base-FM*: the current base feature model, wrapped in an atom
  - *HB*: the current history buffer, wrapped in an atom
  - *CC*: the current conflict cache, wrapped in an atom
  - *MCGS*: the current maximum compatible group set, wrapped in an atom
  - *FM*: the current feature model, wrapped in an atom.
    This is not strictly required, but useful for testing and caching.
  - *GC*: the garbage collector's current state, wrapped in an atom

  The server additionally carries a *offline-sites* atom that contains
  sites that have left to be able to prune forwarded messages.

  This variable may be rebound to simulate different, interacting sites.
  On a single site (i.e., in production), the context is not rebound
  (but modified using atoms).")


(declare ^:dynamic *context*)

(defn initialize-context
  "Initializes a site's global context."
  [initial-context]
  (def ^:dynamic *context* initial-context))