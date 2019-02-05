package de.ovgu.spldev.varied.kernel;

import clojure.lang.IFn;
import clojure.lang.ISeq;
import de.ovgu.spldev.varied.Artifact;
import org.pmw.tinylog.Logger;

/**
 * By convention, the kernel only calls this with one argument (the string to log).
 */
class KernelLogger implements IFn {
    private Artifact.Path artifactPath;

    KernelLogger(Artifact.Path artifactPath) {
        this.artifactPath = artifactPath;
    }

    @Override
    public Object invoke() {
        return null;
    }

    @Override
    public Object invoke(Object o) {
        Logger.trace("KERNEL [" + artifactPath + "] " + o);
        return null;
    }

    @Override
    public Object invoke(Object o, Object o1) {
        return null;
    }

    @Override
    public Object invoke(Object o, Object o1, Object o2) {
        return null;
    }

    @Override
    public Object invoke(Object o, Object o1, Object o2, Object o3) {
        return null;
    }

    @Override
    public Object invoke(Object o, Object o1, Object o2, Object o3, Object o4) {
        return null;
    }

    @Override
    public Object invoke(Object o, Object o1, Object o2, Object o3, Object o4, Object o5) {
        return null;
    }

    @Override
    public Object invoke(Object o, Object o1, Object o2, Object o3, Object o4, Object o5, Object o6) {
        return null;
    }

    @Override
    public Object invoke(Object o, Object o1, Object o2, Object o3, Object o4, Object o5, Object o6, Object o7) {
        return null;
    }

    @Override
    public Object invoke(Object o, Object o1, Object o2, Object o3, Object o4, Object o5, Object o6, Object o7, Object o8) {
        return null;
    }

    @Override
    public Object invoke(Object o, Object o1, Object o2, Object o3, Object o4, Object o5, Object o6, Object o7, Object o8, Object o9) {
        return null;
    }

    @Override
    public Object invoke(Object o, Object o1, Object o2, Object o3, Object o4, Object o5, Object o6, Object o7, Object o8, Object o9, Object o10) {
        return null;
    }

    @Override
    public Object invoke(Object o, Object o1, Object o2, Object o3, Object o4, Object o5, Object o6, Object o7, Object o8, Object o9, Object o10, Object o11) {
        return null;
    }

    @Override
    public Object invoke(Object o, Object o1, Object o2, Object o3, Object o4, Object o5, Object o6, Object o7, Object o8, Object o9, Object o10, Object o11, Object o12) {
        return null;
    }

    @Override
    public Object invoke(Object o, Object o1, Object o2, Object o3, Object o4, Object o5, Object o6, Object o7, Object o8, Object o9, Object o10, Object o11, Object o12, Object o13) {
        return null;
    }

    @Override
    public Object invoke(Object o, Object o1, Object o2, Object o3, Object o4, Object o5, Object o6, Object o7, Object o8, Object o9, Object o10, Object o11, Object o12, Object o13, Object o14) {
        return null;
    }

    @Override
    public Object invoke(Object o, Object o1, Object o2, Object o3, Object o4, Object o5, Object o6, Object o7, Object o8, Object o9, Object o10, Object o11, Object o12, Object o13, Object o14, Object o15) {
        return null;
    }

    @Override
    public Object invoke(Object o, Object o1, Object o2, Object o3, Object o4, Object o5, Object o6, Object o7, Object o8, Object o9, Object o10, Object o11, Object o12, Object o13, Object o14, Object o15, Object o16) {
        return null;
    }

    @Override
    public Object invoke(Object o, Object o1, Object o2, Object o3, Object o4, Object o5, Object o6, Object o7, Object o8, Object o9, Object o10, Object o11, Object o12, Object o13, Object o14, Object o15, Object o16, Object o17) {
        return null;
    }

    @Override
    public Object invoke(Object o, Object o1, Object o2, Object o3, Object o4, Object o5, Object o6, Object o7, Object o8, Object o9, Object o10, Object o11, Object o12, Object o13, Object o14, Object o15, Object o16, Object o17, Object o18) {
        return null;
    }

    @Override
    public Object invoke(Object o, Object o1, Object o2, Object o3, Object o4, Object o5, Object o6, Object o7, Object o8, Object o9, Object o10, Object o11, Object o12, Object o13, Object o14, Object o15, Object o16, Object o17, Object o18, Object o19) {
        return null;
    }

    @Override
    public Object invoke(Object o, Object o1, Object o2, Object o3, Object o4, Object o5, Object o6, Object o7, Object o8, Object o9, Object o10, Object o11, Object o12, Object o13, Object o14, Object o15, Object o16, Object o17, Object o18, Object o19, Object... objects) {
        return null;
    }

    @Override
    public Object applyTo(ISeq iSeq) {
        return null;
    }

    @Override
    public void run() {
    }

    @Override
    public Object call() throws Exception {
        return null;
    }
}