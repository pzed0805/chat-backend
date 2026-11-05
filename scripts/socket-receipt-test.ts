
import { io } from "socket.io-client";

const token = process.argv[2];
const chatId = process.argv[3];
const messageId = process.argv[4];
const role = process.argv[5];

if (!token || !chatId || !messageId || !role) {
    console.error(
        "Usage: npx tsx scripts/socket-receipt-test.ts <JWT> <CHAT_ID> <MESSAGE_ID> <listener|reader>"
    );
    process.exit(1);
}

const socket = io("http://localhost:5500", {
    auth: { token },
    transports: ["websocket"],
    timeout: 5000
});

socket.on("connect", () => {

    console.log(`${role} connected:`, socket.id);

    socket.emit(
        "chat:join",
        { chatId },
        (response: { success: boolean; message: string }) => {

            console.log("Join response:", response);

            if (!response.success) {
                socket.disconnect();
                process.exit(1);
            }

            if (role === "reader") {

                // Mark message as read
                socket.emit(
                    "message:read",
                    { chatId, messageId },
                    (result: unknown) => {

                        console.log("Read receipt response:", result);

                        // Update last seen after marking as read
                        socket.emit(
                            "chat:lastseen",
                            { chatId, messageId },
                            (lastSeenResult: unknown) => {

                                console.log(
                                    "Last seen response:",
                                    lastSeenResult
                                );

                                socket.disconnect();
                                process.exit(0);
                            }
                        );
                    }
                );
            }
        }
    );
});

// Listen for read receipts
socket.on("message:read:receive", (receipt) => {
    console.log("Real-time read receipt received:", receipt);
});

// Listen for last-seen updates
socket.on("chat:lastseen:receive", (lastSeen) => {
    console.log("Real-time last seen received:", lastSeen);
});

socket.on("connect_error", (error) => {
    console.error("Connection failed:", error.message);
    process.exit(1);
});

if (role === "listener") {
    process.on("SIGINT", () => {
        socket.disconnect();
        process.exit(0);
    });
}
