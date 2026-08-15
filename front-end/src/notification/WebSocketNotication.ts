import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export const connectWebSocket = (userId: string, onMessageReceived: (msg: any) => void) => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.warn("Không tìm thấy token, hủy kết nối WebSocket Thông báo.");
        return null;
    }

    const client = new Client({

        webSocketFactory: () => new SockJS(`${import.meta.env.VITE_WS_URL_NOTICATION ?? 'http://localhost:8084'}/ws-notifications?token=${token}`),

        connectHeaders: {
            Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        debug: (str) => {
            // console.log('Notification STOMP: ' + str);
        },
        onConnect: () => {
            console.log("=== ĐÃ KẾT NỐI WEBSOCKET THÔNG BÁO ===");

            const subscriptionChannel = `/topic/notifications/${userId}`;

            client.subscribe(subscriptionChannel, (message) => {
                try {
                    const newNotif = JSON.parse(message.body);
                    onMessageReceived(newNotif);
                } catch (error) {
                    console.error("Lỗi parse dữ liệu thông báo WebSocket:", error);
                }
            });
        },
        onStompError: (frame) => {
            console.error('Lỗi STOMP Broker (Thông báo):', frame.headers['message']);
        },
        onWebSocketError: (event) => {
            console.error('Lỗi mạng WebSocket (Thông báo):', event);
        }
    });

    client.activate();
    return client;
};