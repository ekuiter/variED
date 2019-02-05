package de.ovgu.spldev.varied.kernel;

import clojure.java.api.Clojure;
import clojure.lang.IFn;
import clojure.lang.PersistentHashMap;
import de.ovgu.featureide.fm.core.base.IFeatureModel;
import de.ovgu.spldev.varied.Artifact;
import org.pmw.tinylog.Logger;

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

    static PersistentHashMap toPersistentHashMap(HashMap hashMap) {
        return (PersistentHashMap) Clojure.var("clojure.core", "into").invoke(PersistentHashMap.EMPTY, hashMap);
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
    }

    public Kernel(Artifact.Path artifactPath, IFeatureModel initialFeatureModel) {
        this.artifactPath = artifactPath;
        callPrepare();
        callKernel("serverInitialize", FeatureModelFormat.toKernel(initialFeatureModel));
        callDone();
    }

    public String generateHeartbeat() {
        callPrepare();
        String heartbeatMessage = (String) callKernel("serverGenerateHeartbeat");
        callDone();
        return heartbeatMessage;
    }

    public String forwardMessage(String message) {
        callPrepare();
        String newMessage = (String) callKernel("serverForwardMessage", message);
        callDone();
        return newMessage;
    }

    public String[] siteJoined(UUID siteID) {
        callPrepare();
        String[] contextAndHeartbeatMessage = (String[]) callKernel("serverSiteJoined", siteID.toString());
        callDone();
        return contextAndHeartbeatMessage;
    }

    public String siteLeft(UUID siteID) {
        callPrepare();
        String leaveMessage = (String) callKernel("serverSiteLeft", siteID.toString());
        callDone();
        return leaveMessage;
    }
}
