
import { io } from "socket.io-client";

const token = process.argv[2];
const chatId = process.argv[3];
const role = process.argv[4];

if (!token || !chatId || !role) {
    console.error(
        "Usage: npx tsx scripts/socket-chat-test.ts <JWT> <CHAT_ID> <sender|receiver>"
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

            if (role === "sender") {

                setTimeout(() => {

                    socket.emit(
                        "message:send",
                        {
                            chatId,
                            text: "Hello! This is a real-time Socket.IO message."
                        },
                        (result: {
                            success: boolean;
                            message: string;
                            data?: unknown;
                        }) => {

                            console.log("Send response:", result);

                            setTimeout(() => {
                                socket.disconnect();
                                process.exit(result.success ? 0 : 1);
                            }, 1000);
                        }
                    );

                }, 1000);
            }
        }
    );
});

socket.on("message:receive", (message) => {

    console.log("New real-time message received:", message);

});

socket.on("connect_error", (error) => {

    console.error("Connection error:", error.message);
    process.exit(1);
});

// Keep receiver connected to listen for incoming messages
if (role === "receiver") {

    process.on("SIGINT", () => {
        socket.disconnect();
        process.exit(0);
    });
}
