import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Plus, MessageSquare, Loader2, Info } from "lucide-react";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";
import { couserService } from "@/features/course/courseApi.ts";
import { groupService } from "@/features/course/student/api/GroupService.ts";
import { courseApi } from "@/services/axiosConfig.ts";
import { useAppSelector } from "@/hooks/useAppSelector.ts";
import type { GroupResponse, MessageData, Type } from "@/features/course/student/api/type.ts";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";




const Banner = () => (
    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 mb-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Thảo luận nhóm</h2>
        <p className="text-sm opacity-90 mt-1">Trao đổi và làm việc cùng các thành viên</p>
    </div>
);

const GroupInfo = ({ group, students }: { group: GroupResponse | undefined, students: Type[] }) => {

    if (!group) return null;

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-100 pb-3 mb-3">

                <h3 className="font-bold text-xl text-emerald-700">{group.groupName}</h3>
                <p className="text-sm text-gray-500 mt-1">Đề tài: <span className="font-medium text-gray-700">{group.topic || "Chưa cập nhật"}</span></p>
            </div>

            <div>
                <p className="text-sm text-gray-500 mb-2">Thành viên ({group.participants?.length || 0}):</p>

                <div className="flex flex-wrap gap-2">

                    {group.participants?.map((participant, i) => {


                        const studentInfo = students.find(s =>
                            s.id === participant.userId ||
                            s.studentId === participant.userId ||
                            s.userId === participant.userId
                        );

                        const displayName = studentInfo ? studentInfo.fullName : participant.userId;

                        // Nếu là trưởng nhóm (ADMIN) thì tô màu khác
                        const isAdmin = participant.role === "ADMIN";

                        return (
                            <span
                                key={i}
                                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border ${
                                    isAdmin
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : "bg-emerald-50 text-emerald-700 border-emerald-100"
                                }`}
                            >
                                {displayName} {isAdmin && "⭐"}
                            </span>
                        );
                    })}
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
            <span>{users.join(", ")} đang nhập tin nhắn</span>
            <span className="inline-block w-5 text-left font-bold tracking-widest">{dots}</span>
        </div>
    );
};


const ChatBox = ({ conversationId, currentUserId, students }: { conversationId: number | string, currentUserId: string, students: Type[] }) => {
    const [messages, setMessages] = useState<MessageData[]>([]);
    const [input, setInput] = useState("");
    const stompClientRef = useRef<Client | null>(null);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { id } = useParams<{ id: string }>();
    const offeringId = id ?? "";
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

    useEffect(() => {
        if (!conversationId) return;


        const fetchHistory = async () => {
            try {

                const response = await courseApi.get(`/chat/conversation/${conversationId}/history`);
                setMessages(response.data);
            } catch (error) {
                console.error("Không thể tải lịch sử chat:", error);
            }
        };

        fetchHistory();


        const client = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8082/ws"),
            debug: (str) => console.log(str),
            onConnect: () => {

                client.subscribe(`/topic/chat/${conversationId}`, (message) => {
                    try {
                        const receivedMessage = JSON.parse(message.body);
                        setMessages((prev) => [...prev, receivedMessage]);
                    } catch (error) {
                        console.error("Lỗi parse tin nhắn:", error);
                    }
                });

                client.subscribe(`/topic/chat/${conversationId}/typing`, (message) => {
                    const event = JSON.parse(message.body);
                    if (event.senderId !== currentUserId) {
                        setTypingUsers((prev) => {
                            if (event.isTyping && !prev.includes(event.senderId)) return [...prev, event.senderId];
                            if (!event.isTyping) return prev.filter((id) => id !== event.senderId);
                            return prev;
                        });
                    }
                });
            },
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) stompClientRef.current.deactivate();
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [conversationId, currentUserId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        if (stompClientRef.current?.connected) {
            stompClientRef.current.publish({
                destination: `/app/chat/${conversationId}/typing`,
                body: JSON.stringify({ senderId: currentUserId, isTyping: true }),
            });

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                stompClientRef.current?.publish({
                    destination: `/app/chat/${conversationId}/typing`,
                    body: JSON.stringify({ senderId: currentUserId, isTyping: false }),
                });
            }, 1500);
        }
    };

    const handleSend = () => {
        if (!input.trim() || !stompClientRef.current?.connected) return;

        const messageRequest = {
            senderId: currentUserId,
            content: input,
            conversationId: conversationId,
            offeringId: offeringId || ""
        };

        stompClientRef.current.publish({
            destination: `/app/chat/${conversationId}/sendMessage`,
            body: JSON.stringify(messageRequest)
        });

        setInput("");
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        stompClientRef.current.publish({
            destination: `/app/chat/${conversationId}/typing`,
            body: JSON.stringify({ senderId: currentUserId, isTyping: false }),
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[450px]">
            <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl flex items-center gap-2">
                <MessageSquare size={18} className="text-emerald-600" />
                <span className="font-semibold text-gray-700">Khung Chat Nhóm</span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => {
                    const isMyMessage = msg.senderId === currentUserId;
                    return (
                        <div key={index} className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[75%] ${isMyMessage ? "bg-emerald-500 text-white rounded-tr-sm" : "bg-gray-100 text-gray-800 rounded-tl-sm"}`}>
                                {!isMyMessage && (
                                    <p className="font-bold text-xs mb-1 text-emerald-700">{getUserName(msg.senderId)}</p>
                                )}
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
                <TypingIndicator users={typingUsers} />
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t flex gap-2 bg-white rounded-b-2xl">
                <input
                    value={input}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 bg-gray-100 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                <button
                    onClick={handleSend}
                    className="bg-emerald-600 text-white px-6 py-2.5 rounded-full hover:bg-emerald-700 font-medium transition-colors"
                >
                    Gửi
                </button>
            </div>
        </div>
    );
};


// 4. TRANG CHÍNH

const CourseGroups = () => {
    const { id: offeringId } = useParams<{ id: string }>();
    const navigate = useNavigate();


    const { user: reduxUser } = useAppSelector((state) => state.auth);
    let user = reduxUser;
    if (!user) {
        const localUser = localStorage.getItem("user");
        if (localUser) user = JSON.parse(localUser);
    }
    const currentUserId = user?.studentId || user?.userId || user?.id;

    // States
    const [students, setStudents] = useState<Type[]>([]);
    const [myGroups, setMyGroups] = useState<GroupResponse[]>([]);
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);





    useEffect(() => {
        const fetchData = async () => {
            if (!offeringId || !currentUserId) return;
            try {


                const studentData = await couserService.getStudentsByOffering(offeringId);
                setStudents(studentData)

                const groupData = await groupService.getMyGroups(offeringId, currentUserId);
                setMyGroups(groupData);


                if (groupData.length > 0) {
                    setActiveGroupId(groupData[0].id);
                }
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [offeringId, currentUserId]);

    const activeGroup = myGroups.find(g => g.id === activeGroupId);

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />
            <div className="flex">
                <Sidebar />
                <div className="flex-1 p-4 lg:p-6 pb-20">
                    <div className="max-w-4xl mx-auto">
                        <Banner />

                        {isLoading ? (
                            <div className="flex flex-col items-center py-20 text-emerald-600">
                                <Loader2 size={40} className="animate-spin mb-4" />
                                <p>Đang tải thông tin nhóm...</p>
                            </div>
                        ) : myGroups.length === 0 ? (


                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center flex flex-col items-center justify-center">
                                <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
                                    <Users size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Bạn chưa có nhóm!</h3>
                                <p className="text-gray-500 mb-6 max-w-sm">
                                    Bạn hiện chưa tham gia bất kỳ nhóm nào trong môn học này. Vui lòng tạo nhóm mới để bắt đầu thảo luận.
                                </p>
                                <button
                                    onClick={() => navigate(`/course/${offeringId}/createGroup`)}
                                    className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-medium hover:bg-emerald-700 transition"
                                >
                                    <Plus size={20} />
                                    Tạo nhóm mới
                                </button>
                            </div>

                        ) : (


                            <>

                                {myGroups.length > 1 && (
                                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                                        {myGroups.map(g => (
                                            <button
                                                key={g.id}
                                                onClick={() => setActiveGroupId(g.id)}
                                                className={`px-5 py-2 rounded-full text-sm font-medium transition shrink-0 ${
                                                    activeGroupId === g.id
                                                        ? "bg-emerald-600 text-white shadow-md"
                                                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                                }`}
                                            >
                                                {g.groupName}
                                            </button>
                                        ))}
                                    </div>
                                )}


                                {activeGroup && (
                                    <>
                                        <GroupInfo group={activeGroup} students={students} />
                                        <ChatBox
                                            conversationId={activeGroup.conversationId}
                                            currentUserId={currentUserId}
                                            students={students}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseGroups;