
import { io } from "socket.io-client";

const token = process.argv[2];

const chatId = process.argv[3];

if (!token || !chatId) {
    console.error(
        "Usage: npx tsx scripts/socket-test.ts <JWT> <CHAT_ID>"
    );
    process.exit(1);
}

const socket = io("http://localhost:5500", {
    auth: { token },
    transports: ["websocket"],
    timeout: 5000
});

socket.on("connect", () => {

    console.log("Socket connected:", socket.id);

    socket.emit(
        "chat:join",
        { chatId },
        (response: {
            success: boolean;
            message: string;
            data?: { chatId: string };
        }) => {

            console.log("Join chat response:", response);

            socket.disconnect();
            process.exit(response.success ? 0 : 1);
        }
    );
});

socket.on("connect_error", (error) => {

    console.error("Connection failed:", error.message);

    process.exit(1);
});
