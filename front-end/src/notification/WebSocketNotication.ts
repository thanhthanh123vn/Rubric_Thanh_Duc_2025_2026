import SockJS from 'sockjs-client';
import Stomp from "stompjs";


export const connectWebSocket = (
    userId: string | number,
    onMessageReceived: (notification: any) => void
) => {

    const socket = new SockJS(`${import.meta.env.VITE_WS_URL}/ws-notifications`);
    const stompClient = Stomp.over(socket);


    stompClient.debug = () => {};

    stompClient.connect(
        {}, // Headers (nếu bạn dùng JWT token, có thể truyền vào đây)
        (frame) => {
            console.log('WebSocket Connected: ' + frame);


            stompClient.subscribe('/topic/user/' + userId, (notificationPayload) => {
                const notification = JSON.parse(notificationPayload.body);

                console.log("CÓ THÔNG BÁO MỚI:", notification);


                onMessageReceived(notification);
            });
        },
        (error) => {
            console.error("Lỗi kết nối WebSocket: ", error);

        }
    );


    return stompClient;
};