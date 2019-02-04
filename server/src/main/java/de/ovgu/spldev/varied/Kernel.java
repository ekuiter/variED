package de.ovgu.spldev.varied;

import clojure.java.api.Clojure;
import clojure.lang.IFn;
import de.ovgu.featureide.fm.core.base.IFeatureModel;

import java.util.UUID;

public class Kernel {
    private static String KERNEL_NAMESPACE = "kernel.api";
    private Object context;

    static {
        Clojure.var("clojure.core", "require").invoke(Clojure.read(KERNEL_NAMESPACE));
    }

    static class CallException extends RuntimeException {
        CallException(Throwable cause) {
            super(cause);
        }
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

    private void restoreContext() {
        callKernel("contextSet", context);
    }

    private void storeContext() {
        this.context = callKernel("contextGet");
    }

    Kernel(IFeatureModel initialFeatureModel) {
        callKernel("serverInitialize", true /*initialFeatureModel*/); // TODO: feature model format!
        storeContext();
    }

    String generateHeartbeat() {
        restoreContext();
        String heartbeatMessage = (String) callKernel("serverGenerateHeartbeat");
        storeContext();
        return heartbeatMessage;
    }

    String forwardMessage(String message) {
        restoreContext();
        String newMessage = (String) callKernel("serverForwardMessage", message);
        storeContext();
        return newMessage;
    }

    String[] siteJoined(UUID siteID) {
        restoreContext();
        String[] contextAndHeartbeatMessage = (String[]) callKernel("serverSiteJoined", siteID.toString());
        storeContext();
        return contextAndHeartbeatMessage;
    }

    String siteLeft(UUID siteID) {
        restoreContext();
        String leaveMessage = (String) callKernel("serverSiteLeft", siteID.toString());
        storeContext();
        return leaveMessage;
    }
}
