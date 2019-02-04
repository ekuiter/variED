package de.ovgu.spldev.varied;

import clojure.java.api.Clojure;

public class Main {
    public static void main(String[] args) {
        Clojure.var("clojure.core", "require").invoke(Clojure.read("kernel.api"));
    }
}
