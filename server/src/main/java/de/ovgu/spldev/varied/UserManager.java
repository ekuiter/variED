package de.ovgu.spldev.varied;

import de.ovgu.spldev.varied.common.operations.Operation;
import de.ovgu.spldev.varied.common.util.StringUtils;
import de.ovgu.spldev.varied.messaging.Message;
import org.pmw.tinylog.Logger;

import java.util.concurrent.ConcurrentHashMap;

/**
 * Holds a mapping from web sockets to users and manages user registration
 */
public class UserManager {
    private static UserManager instance;
    private ConcurrentHashMap<WebSocket, User> users = new ConcurrentHashMap<>();

    private UserManager() {
    }

    public static UserManager getInstance() {
        return instance == null ? instance = new UserManager() : instance;
    }

    boolean isNameAvailable(String name) {
        return users.values().stream()
                .map(User::getName)
                .noneMatch(name::equals);
    }

    public void register(User newUser) {
        Logger.info("registering user {}", newUser);
        String name = newUser.getName();
        if (!StringUtils.isPresent(name))
            throw new RuntimeException("no name supplied on registration");
        if (!isNameAvailable(name))
            throw new RuntimeException("name already registered, choose another name");
        if (users.containsValue(newUser))
            throw new RuntimeException("user already registered");
        if (users.containsKey(newUser.getWebSocket()))
            throw new RuntimeException("web socket is already logged in as another user");
        users.put(newUser.getWebSocket(), newUser);
        newUser.sendInitialInformation();
    }

    public void register(WebSocket webSocket) {
        register(new User(webSocket));
    }

    public void unregister(User oldUser) {
        Logger.info("unregistering user {}", oldUser);
        oldUser.leaveAllCollaborativeSessions();
        users.remove(oldUser.getWebSocket());
    }

    public void unregister(WebSocket webSocket) {
        User user = users.get(webSocket);
        if (user != null)
            unregister(user);
    }

    void onMessage(WebSocket webSocket, Message message) throws Operation.InvalidOperationException, Message.InvalidMessageException {
        // TODO: handle login/logout here
        User user = users.get(webSocket);
        if (user != null)
            user.onMessage(message);
    }
}
