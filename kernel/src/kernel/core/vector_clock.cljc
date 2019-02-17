(ns kernel.core.vector-clock
  "Vector Clock, VC for short.
  Vector clocks are used to track causality of operations in the system.

  An operation causes another if it happened before.
  This is difficult to achieve with physical clocks because of clock skew.
  Also, physical time can not capture whether two operations are concurrent
  (i.e., generated without knowledge of the other).

  In contrast, vector clocks can capture the causally-preceding relation precisely.
  The algorithms were introduced by Fidge and Mattern.
  Adapted from https://github.com/michaelklishin/vclock.

  Here, a vector clock maps from sites to integers counting events.
  This is not the most efficient implementation (there are garbage collection
  techniques in the literature)."
  (:require #?(:clj  [taoensso.tufte :as tufte :refer (defnp p profiled profile)]
               :cljs [taoensso.tufte :as tufte :refer-macros (defnp p profiled profile)])))

; constructor

(defn initialize
  "Creates a new empty vector clock.
  Every site's counter is implicitly 0."
  []
  {})

; getters

(defn _get
  "Returns a site's coordinate in a vector clock in O(1), defaulting to 0."
  [VC site-ID]
  (if-let [entry (VC site-ID)] entry 0))

; methods

(defn increment
  "Increments a site's counter in a vector clock in O(1)."
  [VC site-ID]
  (assoc VC site-ID (inc (_get VC site-ID))))

(defn remove-site
  "Removes a site from a vector clock in O(1).
  This effectively resets the site's counter to 0."
  [VC site-ID]
  (dissoc VC site-ID))

(defn _merge
  "Merges two vector clocks by taking the maximum component-wise in O(n) for n sites."
  [VC-a VC-b]
  (p ::_merge
     (merge-with max VC-a VC-b)))

(defn _<
  "Compares two vector clocks in O(n) for n sites.
  Returns true if one vector clock causally precedes the other.

  Because new sites may join at any time, some sites may be missing
  in one of the vector clocks, so they are explicitly collected first.

  Derivation of the algorithm from the vector clock definition
  (z refers to sites, x and y are the compared vector clocks):

  ```
    (for all z: xz <= yz) and (exists z: xz < yz)
  = not not ((for all z: xz <= yz) and (exists z: xz < yz))
  = not (not (for all z: xz <= yz) or not (exists z: xz < yz))
  = not ((exists z: not xz <= yz) or (for all z: not xz < yz))
  = not ((exists z: xz > yz) or (for all z: xz >= yz))
  i.e.: check if all z: xz >= yz, and if a z: xz > yz is found, return early
  i.e.: cond > return early (true)
        else = continue with current value
        else < continue with false (but no early return, as exists may still be true)
     => then do final not
  ```"
  [VC-a VC-b]
  (p ::_<
     (let [site-IDs (set (concat (keys VC-a) (keys VC-b)))]
       (not (reduce #(let [entry-a (_get VC-a %2)
                           entry-b (_get VC-b %2)]
                       (cond
                         (> entry-a entry-b) (reduced true)
                         (= entry-a entry-b) %1
                         (< entry-a entry-b) false))
                    true site-IDs)))))