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
        callKernel("serverInitialize", initialFeatureModel); // TODO: feature model format!
        storeContext();
    }

    Object generateHeartbeat() {
        restoreContext();
        Object heartbeatMessage = callKernel("serverGenerateHeartbeat");
        storeContext();
        return heartbeatMessage;
    }

    Object forwardMessage(Object message) {
        restoreContext();
        Object newMessage = callKernel("serverForwardMessage", message);
        storeContext();
        return newMessage;
    }

    Object[] siteJoined(UUID siteID) {
        restoreContext();
        Object[] contextAndHeartbeatMessage = (Object[]) callKernel("serverSiteJoined", siteID.toString());
        storeContext();
        return contextAndHeartbeatMessage;
    }

    Object siteLeft(UUID siteID) {
        restoreContext();
        Object leaveMessage = callKernel("serverSiteLeft", siteID.toString());
        storeContext();
        return leaveMessage;
    }
}
