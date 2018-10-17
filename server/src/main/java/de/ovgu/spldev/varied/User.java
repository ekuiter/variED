package de.ovgu.spldev.varied;

import de.ovgu.spldev.varied.messaging.Message;
import me.atrox.haikunator.Haikunator;
import me.atrox.haikunator.HaikunatorBuilder;

import java.util.function.Supplier;

public class User {
    private String name;
    private WebSocket webSocket;
    private static Haikunator haikunator = new HaikunatorBuilder().setDelimiter(" ").setTokenLength(0).build();

    private static String generateName() {
        Supplier<String> generator = () -> haikunator.haikunate() + " (anonymous)";
        UserManager userManager = UserManager.getInstance();
        String name = generator.get();
        while (!userManager.isNameAvailable(name))
            name = generator.get();
        return name;
    }

    public User(WebSocket webSocket) {
        this(generateName(), webSocket);
    }

    public User(String name, WebSocket webSocket) {
        this.name = name;
        this.webSocket = webSocket;
    }

    public void send(Message.IEncodable message) {
        webSocket.send(message);
    }

    public String getName() {
        return name;
    }

    public WebSocket getWebSocket() {
        return webSocket;
    }

    public String toString() {
        return getName();
    }
}
