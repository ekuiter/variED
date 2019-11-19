package de.ovgu.spldev.varied.kernel;

import clojure.java.api.Clojure;
import clojure.lang.*;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.Artifact;
import org.pmw.tinylog.Logger;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.UUID;

public class Kernel {
    private static String KERNEL_NAMESPACE = "kernel.api";
    private Artifact.Path artifactPath;
    private Object context = null;

    static {
        Logger.info("booting up kernel");
        Clojure.var("clojure.core", "require").invoke(Clojure.read(KERNEL_NAMESPACE));
    }

    static class CallException extends RuntimeException {
        CallException(Throwable cause) {
            super(cause);
        }
    }

    static Object keyword(String keywordString) {
        return Clojure.read(":" + keywordString);
    }

    static APersistentMap toPersistentMap(HashMap hashMap) {
        return (APersistentMap) Clojure.var("clojure.core", "into").invoke(PersistentHashMap.EMPTY, hashMap);
    }

    static PersistentVector toPersistentVector(ArrayList arrayList) {
        return (PersistentVector) Clojure.var("clojure.core", "into").invoke(PersistentVector.EMPTY, arrayList);
    }

    private Object callKernel(String function, Object... args) {
        IFn fn = Clojure.var(KERNEL_NAMESPACE, function);

        // ugly, but reflection is impossible (?) as invoke has no "..." overload
        try {
            if (args.length == 0)
                return fn.invoke();
            if (args.length == 1)
                return fn.invoke(args[0]);
            if (args.length == 2)
                return fn.invoke(args[0], args[1]);
            if (args.length == 3)
                return fn.invoke(args[0], args[1], args[2]);
            if (args.length == 4)
                return fn.invoke(args[0], args[1], args[2], args[3]);
        } catch (Throwable t) {
            throw new CallException(t);
        }

        throw new RuntimeException("too many arguments for kernel call");
    }

    private void callPrepare() {
        callKernel("setLoggerFunction", new KernelLogger(artifactPath));
        callKernel("setContext", context);
    }

    private void callDone() {
        this.context = callKernel("getContext");
        callKernel("logProfile");
    }

    private Object callKernelAtomic(String function, Object... args) {
        callPrepare();
        Object result = callKernel(function, args);
        callDone();
        return result;
    }

    public Kernel(Artifact.Path artifactPath, IFeatureModel initialFeatureModel) {
        this.artifactPath = artifactPath;
        callKernelAtomic("serverInitialize", FeatureModelFormat.toKernel(initialFeatureModel));
    }

    public IFeatureModel toFeatureModel() {
        return FeatureModelFormat.toFeatureModel(context);
    }

    public String generateHeartbeat() {
        return (String) callKernelAtomic("serverGenerateHeartbeat");
    }

    public Object[] forwardMessage(String message) {
        return (Object[]) callKernelAtomic("serverForwardMessage", message);
    }

    public String[] siteJoined(UUID siteID) {
        return (String[]) callKernelAtomic("serverSiteJoined", siteID.toString());
    }

    public Object[] siteLeft(UUID siteID) {
        return (Object[]) callKernelAtomic("serverSiteLeft", siteID.toString());
    }

    public void resolveConflict(String versionID) {
        callKernelAtomic("serverResolveConflict", versionID);
    }

    public void GC() {
        callKernelAtomic("serverGC");
    }
}
