
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';


const socket = new SockJS('http://localhost:8080/api/v1/ws-notifications');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
    console.log('Connected: ' + frame);


    const currentUserId = 5;
    stompClient.subscribe('/topic/user/' + currentUserId, function(notificationPayload) {
        const notification = JSON.parse(notificationPayload.body);


        console.log("CÓ THÔNG BÁO MỚI:", notification.message);
        alert(notification.message);
    });
});