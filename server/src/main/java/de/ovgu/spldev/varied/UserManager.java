package de.ovgu.spldev.varied;

import de.ovgu.spldev.varied.messaging.Message;
import de.ovgu.spldev.varied.util.StringUtils;

import java.util.HashMap;

/**
 * Holds a mapping from web sockets to users and manages user registration
 */
public class UserManager {
    private static UserManager instance;
    private HashMap<WebSocket, User> users = new HashMap<>();

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

        // TODO: let the user decide which collaboration session to join
        CollaborationSession.getInstance().join(newUser);
    }

    public void register(WebSocket webSocket) {
        register(new User(webSocket));
    }

    public void unregister(User oldUser) {
        // TODO: see above
        CollaborationSession.getInstance().leave(oldUser);

        users.remove(oldUser.getWebSocket());
    }

    public void unregister(WebSocket webSocket) {
        User user = users.get(webSocket);
        if (user != null)
            unregister(user);
    }

    public void onMessage(WebSocket webSocket, Message message) {
        // TODO: dispatch to currect session (by asking the user object)
        // also handle login/logout here
        CollaborationSession.getInstance().onMessage(message);
    }
}
