import React, {useEffect, useRef, useState} from "react";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";
import {useParams} from "react-router-dom";
import {couserService} from "@/features/course/courseApi.ts";
import type {MessageData, Type} from "@/features/course/student/api/type.ts";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import {useAppSelector} from "@/hooks/useAppSelector.ts";
import {courseApi} from "@/services/axiosConfig.ts";
const Banner = () => {
    return (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Nhóm của tôi</h2>
            <p className="text-sm opacity-90 mt-1">Trao đổi và làm việc nhóm</p>
        </div>
    );
};

const GroupInfo = ({ students }: { students: Type[] }) => {
    const { id } = useParams<{ id: string }>();

    const [search, setSearch] = useState("");

    console.log("mã Học phần",id);



    const filtered = students.filter((s) =>
        s.fullName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
            <h3 className="font-semibold text-gray-900">Nhóm 1 - Web OBE</h3>
            <p className="text-sm text-gray-500 mt-1">Thành viên:</p>

            <div className="mt-2 flex flex-wrap gap-2">
                {filtered.map((m, i) => (
                    <span
                        key={i}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                    >
                        {m.fullName}
                    </span>
                ))}
            </div>
        </div>
    );
};

const ChatBox = ({ offeringId, currentUserId,students }: { offeringId: string, currentUserId: string,students: Type[] }) => {
    const [messages, setMessages] = useState<MessageData[]>([]);
    const [input, setInput] = useState("");
    const stompClientRef = useRef<Client | null>(null);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const getUserName = (userId: string) => {
        const user = students.find((s: any) => s.id === userId || s.studentId === userId || s.userId === userId);
        return user ? user.fullName : userId;
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages, typingUsers]);


    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        if (!offeringId) return;


        const fetchHistory = async () => {
            try {

                const response = await courseApi.get(`/v1/chat/${offeringId}/history`);
                setMessages(response.data);
            } catch (error) {
                console.error("Không thể tải lịch sử chat:", error);
            }
        };

        fetchHistory();


        // 1. Cấu hình STOMP Client kết nối tới SockJS
        const client = new Client({

            webSocketFactory: () => new SockJS("http://localhost:8082/ws"),
            debug: (str) => {
                console.log(str);
            },
            onConnect: () => {
                console.log("Đã kết nối WebSocket!");

                client.subscribe(`/topic/course/${offeringId}`, (message) => {

                        console.log("Raw WebSocket message:", message.body);

                        try {
                            const receivedMessage = JSON.parse(message.body);
                            console.log(" Parsed Message:", receivedMessage);


                            setMessages((prevMessages) => [...prevMessages, {
                                messageId: receivedMessage.messageId,
                                senderId: receivedMessage.senderId,
                                content: receivedMessage.content
                            }]);
                        } catch (error) {
                            console.error("Lỗi khi parse tin nhắn từ WebSocket:", error);
                        }
                });
                client.subscribe(`/topic/course/${offeringId}/typing`, (message) => {
                    const event = JSON.parse(message.body);
                    console.log("sụ kiện",event);

                    if (event.senderId !== currentUserId) {
                        setTypingUsers((prev) => {
                            if (event.isTyping) {

                                if (!prev.includes(event.senderId)) return [...prev, event.senderId];
                                return prev;
                            } else {

                                return prev.filter((id) => id !== event.senderId);
                            }
                        });

                   }
                });
            },
            onStompError: (frame) => {
                console.error("Lỗi STOMP: " + frame.headers["message"]);
            },
        });

        client.activate();
        stompClientRef.current = client;


        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [offeringId]);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);

        if (stompClientRef.current?.connected) {

            stompClientRef.current.publish({
                destination: `/app/chat/${offeringId}/typing`,
                body: JSON.stringify({ senderId: currentUserId, isTyping: true }),
            });


            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);


            typingTimeoutRef.current = setTimeout(() => {
                stompClientRef.current?.publish({
                    destination: `/app/chat/${offeringId}/typing`,
                    body: JSON.stringify({ senderId: currentUserId, isTyping: false }),
                });
            },1000);
        }
    };
    const handleSend = () => {
        if (!input.trim() || !stompClientRef.current?.connected) return;

        const messageRequest = {
            senderId: currentUserId,
            content: input
        };


        stompClientRef.current.publish({
            destination: `/app/chat/${offeringId}/sendMessage`,
            body: JSON.stringify(messageRequest)
        });

        setInput("");
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        stompClientRef.current.publish({
            destination: `/app/chat/${offeringId}/typing`,
            body: JSON.stringify({ senderId: currentUserId, isTyping: false }),
        });
    };
    useEffect(() => {
        console.log("typingUsers:", typingUsers);
    }, [typingUsers]);
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[400px]">
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((msg, index) => {
                    const isMyMessage = msg.senderId === currentUserId;

                    return (
                        <div key={index} className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`px-4 py-2 rounded-2xl text-sm max-w-[70%] ${
                                    isMyMessage ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-800"
                                }`}
                            >
                                {!isMyMessage && (
                                    <p className="font-semibold text-xs mb-1 text-emerald-700">
                                        {getUserName(msg.senderId)}
                                    </p>
                                )}
                                {msg.content}
                            </div>
                        </div>
                    );
                })}

                <TypingIndicator users={typingUsers} />
                <div ref={messagesEndRef}/>
            </div>

            {/* Input */}
            <div className="p-3 border-t flex gap-2">
                <input
                    value={input}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none"
                />
                <button
                    onClick={handleSend}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700"
                >
                    Gửi
                </button>
            </div>
        </div>
    );
};

const CourseGroups = () => {

    const { id } = useParams<{ id: string }>();
    const { user:reduxUser } = useAppSelector((state) => state.auth);

    let user = reduxUser;
    if (!user) {
        const localUser = localStorage.getItem("user");
        if (localUser) {
            user = JSON.parse(localUser);
        }
    }
    const currentUserId  = user?.studentId || user?.userId || user?.id;
    const [students, setStudents] = useState<Type[]>([]);

        useEffect(() => {
            const fetchStudents = async () => {
                if (!id) return;
                try {
                    const data = await couserService.getStudentsByOffering(id);
                    setStudents(data);
                } catch (error) {
                    console.error("Lỗi khi tải danh sách sinh viên:", error);
                }
            };

            fetchStudents();
        }, [id]);
    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />
            <div className="flex">
                <Sidebar />
                <div className="flex-1 p-4 lg:p-6">
                    <div className="max-w-4xl mx-auto">
                        <Banner />
                        <GroupInfo students={students} />

                        {id ? (
                            <ChatBox offeringId={id} currentUserId={currentUserId} students={students} />
                        ) : (
                            <p className="text-red-500">Lỗi: Không tìm thấy mã lớp học (id)</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
const TypingIndicator = ({ users }: { users: string[] }) => {
    const [dots, setDots] = useState("");

    useEffect(() => {

        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
        }, 400);

        return () => clearInterval(interval);
    }, []);

    if (users.length === 0) return null;

    return (
        <div className="px-4 pb-2 text-xs text-emerald-600 italic flex items-center gap-1">
            <span>{users.join(", ")} đang soạn tin nhắn</span>
            <span className="inline-block w-5 text-left font-bold tracking-widest">{dots}</span>
        </div>
    );
};
export default CourseGroups;