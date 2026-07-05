// front-end/src/features/course/student/components/CourseGroups.tsx

import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Users,
    Plus,
    MessageSquare,
    Loader2,
    Trash2,
    CheckCircle2,
    ChevronUp,
    ChevronDown,
    AlertCircle, Calendar
} from "lucide-react";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";
import { courseService } from "@/features/course/courseApi.ts";
import { groupService } from "@/features/course/student/api/GroupService.ts";
import { courseApi } from "@/services/axiosConfig.ts";
import { useAppSelector } from "@/hooks/useAppSelector.ts";
import type {GroupResponse, GroupTaskResponse, MessageData, Type} from "@/features/course/student/api/type.ts";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@radix-ui/react-tabs";

const Banner = () => (
    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 mb-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Thảo luận nhóm</h2>
        <p className="text-sm opacity-90 mt-1">Trao đổi và làm việc cùng các thành viên</p>
    </div>
);


// --- Component Quản lý Thông Tin Nhóm ---
const GroupInfo = ({
                       group,
                       students,
                       currentUserId,
                       onGroupUpdated
                   }: {
    group: GroupResponse | undefined,
    students: Type[],
    currentUserId: string,
    onGroupUpdated: (updatedGroup: GroupResponse) => void
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [selectedNewMember, setSelectedNewMember] = useState("");

    // Thêm state cho việc tìm kiếm
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showAllMembers, setShowAllMembers] = useState(false);
    // Đóng dropdown khi click ra ngoài vùng tìm kiếm
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!group) return null;

    // Kiểm tra xem user hiện tại có phải là ADMIN của nhóm không
    const currentUserRole = group.participants?.find(p => p.userId === currentUserId)?.role;
    const isAdmin = currentUserRole === "ADMIN";

    // Danh sách các sinh viên trong lớp học phần NHƯNG CHƯA có trong nhóm này
    const availableStudents = students.filter(s =>
        !group.participants?.some(p => p.userId === s.id || p.userId === s.studentId || p.userId === s.userId)
    );

    // Lọc sinh viên theo từ khóa tìm kiếm (theo tên hoặc MSSV)
    const filteredStudents = availableStudents.filter(s =>
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.studentId && s.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleAddMember = async () => {
        if (!selectedNewMember) return;
        try {
            const updatedGroup = await groupService.addMember(group.id, selectedNewMember);
            setIsAdding(false);
            setSelectedNewMember("");
            setSearchTerm(""); // Reset lại ô tìm kiếm
            onGroupUpdated(updatedGroup);
        } catch (error: any) {
            alert(error.response?.data?.message || "Lỗi khi thêm thành viên");
        }
    };

    const handleRemove = async (userId: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa thành viên này?")) return;
        try {
            const updatedGroup = await groupService.removeMember(group.id, userId);
            onGroupUpdated(updatedGroup);
        } catch (error: any) {
            alert(error.response?.data?.message || "Lỗi khi xóa thành viên");
        }
    };

    const handleChangeRole = async (userId: string, newRole: string) => {
        try {
            const updatedGroup = await groupService.changeRole(group.id, userId, newRole);
            onGroupUpdated(updatedGroup);
        } catch (error: any) {
            alert(error.response?.data?.message || "Lỗi khi cập nhật quyền");
        }
    };
    const allMembers = group.participants || [];
    const visibleMembers = showAllMembers ? allMembers : allMembers.slice(0, 5);
    const hasMoreMembers = allMembers.length > 5;


    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-100 pb-3 mb-3 flex justify-between items-start sm:items-center flex-col sm:flex-row gap-3">
                <div>
                    <h3 className="font-bold text-xl text-emerald-700">{group.groupName}</h3>
                    <p className="text-sm text-gray-500 mt-1">Đề tài: <span className="font-medium text-gray-700">{group.topic || "Chưa cập nhật"}</span></p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => {
                            setIsAdding(!isAdding);
                            if (isAdding) {
                                // Nếu đang đóng thì reset lựa chọn
                                setSelectedNewMember("");
                                setSearchTerm("");
                            }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition ${
                            isAdding ? "bg-gray-100 text-gray-600" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        }`}
                    >
                        {isAdding ? "Hủy" : <><Plus size={16} /> Thêm thành viên</>}
                    </button>
                )}
            </div>

            {isAdding && isAdmin && (
                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-start sm:items-center flex-col sm:flex-row gap-2">

                    {/* KHUNG TÌM KIẾM THÀNH VIÊN */}
                    <div className="relative flex-1 w-full" ref={dropdownRef}>
                        <input
                            type="text"
                            placeholder="Gõ tên hoặc MSSV để tìm..."
                            className="w-full border border-gray-300 rounded-md text-sm p-2 bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setIsDropdownOpen(true);
                                setSelectedNewMember(""); // Xóa lựa chọn nếu người dùng gõ lại
                            }}
                            onClick={() => setIsDropdownOpen(true)}
                        />

                        {isDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map(s => {
                                        const val = s.id || s.studentId || s.userId;
                                        const isSelected = selectedNewMember === val;
                                        return (
                                            <div
                                                key={val}
                                                className={`px-3 py-2 text-sm cursor-pointer transition ${
                                                    isSelected ? "bg-emerald-100 text-emerald-800 font-medium" : "hover:bg-emerald-50"
                                                }`}
                                                onClick={() => {
                                                    setSelectedNewMember(val as string);
                                                    setSearchTerm(`${s.fullName} - ${s.studentId || "Chưa có MSSV"}`);
                                                    setIsDropdownOpen(false); // Ẩn dropdown khi chọn xong
                                                }}
                                            >
                                                {s.fullName} - {s.studentId || "Chưa có MSSV"}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="px-3 py-3 text-sm text-gray-500 italic text-center">
                                        Không tìm thấy sinh viên phù hợp
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleAddMember}
                        disabled={!selectedNewMember}
                        className="bg-emerald-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition w-full sm:w-auto mt-2 sm:mt-0"
                    >
                        Thêm
                    </button>
                </div>
            )}

            <div>
                <p className="text-sm text-gray-500 mb-2">Thành viên ({group.participants?.length || 0}):</p>
                <div className="flex flex-col gap-2">
                    {group.participants?.map((participant, i) => {
                        const studentInfo = students.find(s =>
                            s.id === participant.userId ||
                            s.studentId === participant.userId ||
                            s.userId === participant.userId
                        );

                        const displayName = studentInfo ? studentInfo.fullName : participant.userId;
                        const isMemberAdmin = participant.role === "ADMIN";

                        return (
                            <div key={i} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                <span className={`text-sm font-medium flex items-center gap-1 ${isMemberAdmin ? "text-amber-700" : "text-emerald-700"}`}>
                                    {displayName} {isMemberAdmin && "⭐"}
                                    {currentUserId === participant.userId && <span className="text-gray-400 text-xs ml-1 font-normal">(Bạn)</span>}
                                </span>

                                {/* Cho phép quản lý nếu là Admin, và không thể tự đổi/xóa chính mình */}
                                {isAdmin && currentUserId !== participant.userId && (
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={participant.role}
                                            onChange={(e) => handleChangeRole(participant.userId, e.target.value)}
                                            className="text-xs border border-gray-300 rounded-md p-1 outline-none cursor-pointer bg-white"
                                        >
                                            <option value="MEMBER">MEMBER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                        <button
                                            onClick={() => handleRemove(participant.userId)}
                                            className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition"
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {hasMoreMembers && (
                        <button
                            onClick={() => setShowAllMembers(!showAllMembers)}
                            className="w-full mt-3 py-2 text-sm text-gray-500 font-medium hover:bg-gray-50 rounded-lg flex items-center justify-center gap-1 transition border border-dashed border-gray-200"
                        >
                            {showAllMembers ? (
                                <><ChevronUp size={16} /> Thu gọn</>
                            ) : (
                                <><ChevronDown size={16} /> Xem thêm {allMembers.length - 5} thành viên</>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Component Typing Indicator ---
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


// --- Component Chat Box ---
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
const TaskBoard = ({ group, students, currentUserId, isAdmin }: { group: GroupResponse, students: Type[], currentUserId: string, isAdmin: boolean }) => {
    const [tasks, setTasks] = useState<GroupTaskResponse[]>([]);
    const [isCreating, setIsAdding] = useState(false);

    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        assigneeId: "",
        assignToGroup: false,
        deadline: ""
    });


    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "Không xác định";
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    // Fetch Tasks
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const data = await groupService.getTasks(group.id);
                setTasks(data);
            } catch (error) {
                console.error("Lỗi tải tasks:", error);
            }
        };
        fetchTasks();
    }, [group.id]);

    const handleCreateTask = async () => {
        if (!newTask.title || !newTask.assigneeId) return alert("Vui lòng nhập tên task và chọn người nhận!");
        try {
            const created = await groupService.createTask({
                groupId: group.id,
                title: newTask.title,
                description: newTask.description,
                assigneeId: newTask.assignToGroup ? "__GROUP__" : newTask.assigneeId,
                assignToGroup: newTask.assignToGroup,
                deadline: newTask.deadline
            });
            setTasks([created, ...tasks]);
            setIsAdding(false);
            setNewTask({ title: "", description: "", assigneeId: "", assignToGroup: false ,deadline: ""});
        } catch (error) {
            alert("Lỗi khi tạo task");
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        try {
            const updated = await groupService.updateTaskStatus(taskId, newStatus);
            setTasks(tasks.map(t => t.id === taskId ? updated : t));
        } catch (error) {
            alert("Lỗi khi cập nhật trạng thái");
        }
    };

    const handleDelete = async (taskId: string) => {
        if(!window.confirm("Xóa nhiệm vụ này?")) return;
        try {
            await groupService.deleteTask(taskId);
            setTasks(tasks.filter(t => t.id !== taskId));
        } catch (error) {
            alert("Lỗi khi xóa task");
        }
    };

    const getAssigneeName = (id: string) => {
        const s = students.find(st => st.id === id || st.studentId === id || st.userId === id);
        return s ? s.fullName : "Không rõ";
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col mt-6">
            <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <span className="font-semibold text-gray-700">Danh sách Nhiệm vụ</span>
                </div>
                {isAdmin && (
                    <button onClick={() => setIsAdding(!isCreating)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-700 transition">
                        {isCreating ? "Hủy" : "+ Giao task"}
                    </button>
                )}
            </div>

            {/* Form tạo Task */}
            {isCreating && isAdmin && (
                <div className="p-4 bg-emerald-50 border-b border-gray-100 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                    <input
                        type="text" placeholder="Tên công việc (VD: Viết báo cáo chương 1...)"
                        value={newTask.title}
                        onChange={e => setNewTask({...newTask, title: e.target.value})}
                        className="p-2.5 border rounded-md text-sm outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                            value={newTask.assignToGroup ? "__GROUP__" : newTask.assigneeId}
                            onChange={e => setNewTask({...newTask, assignToGroup: e.target.value === "__GROUP__", assigneeId: e.target.value === "__GROUP__" ? "__GROUP__" : e.target.value})}
                            className="p-2.5 border rounded-md text-sm outline-none bg-white"
                        >
                            <option value="">-- Giao cho ai? --</option>
                            <option value="__GROUP__">Ca nhom</option>
                            {group.participants.map(p => (
                                <option key={p.userId} value={p.userId}>{getAssigneeName(p.userId)}</option>
                            ))}
                        </select>
                        <div className="relative">
                            <span className="absolute left-2.5 top-2.5 text-gray-400"><Calendar size={16} /></span>
                            <input
                                type="datetime-local"
                                value={newTask.deadline}
                                onChange={e => setNewTask({...newTask, deadline: e.target.value})}
                                className="w-full p-2.5 pl-9 border rounded-md text-sm outline-none bg-white"
                            />
                        </div>
                    </div>
                    <button onClick={handleCreateTask} className="w-full bg-emerald-600 text-white py-2.5 rounded-md text-sm font-bold hover:bg-emerald-700 transition">
                        XÁC NHẬN GIAO VIỆC
                    </button>
                </div>
            )}

            {/* List Tasks */}
            <div className="p-4 overflow-y-auto max-h-[500px] space-y-4">
                {tasks.length === 0 ? <p className="text-center text-sm text-gray-400 py-6">Nhóm chưa có nhiệm vụ nào.</p> : null}

                {tasks.map(task => {
                    const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'COMPLETED';

                    return (
                        <div key={task.id} className={`border rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition bg-white ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <h4 className={`font-bold text-base ${task.status === 'COMPLETED' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                        {task.title}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px]">
                                        <span className="text-emerald-700 text-base font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                                            👤 {task.assignToGroup ? "Ca nhom" : getAssigneeName(task.assigneeId || "")}
                                        </span>
                                        <span className="text-gray-600 text-base">
                                            📅 Giao: {formatDate(task.createdAt)}
                                        </span>
                                        <span className={`font-medium flex items-center gap-1 text-base ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                                            ⌛ Hạn: {formatDate(task.deadline)}
                                            {isOverdue && <AlertCircle size={12} className="animate-pulse" />}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isAdmin && (
                                        <button onClick={() => handleDelete(task.id)} className="text-gray-300 hover:text-red-500 transition p-1">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                        task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-600'
                                }`}>
                                    {task.status}
                                </span>

                                {(Boolean(task.assignToGroup) || task.assigneeId === currentUserId || isAdmin) && (
                                    <select
                                        className="text-xs border border-gray-200 rounded-md p-1.5 outline-none cursor-pointer bg-gray-50 font-medium"
                                        value={task.status}
                                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                    >
                                        <option value="TODO">Cần làm</option>
                                        <option value="IN_PROGRESS">Đang làm</option>
                                        <option value="COMPLETED">Hoàn thành</option>
                                    </select>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

// --- TRANG CHÍNH CourseGroups ---
const CourseGroups = () => {
    const { id: offeringId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { user: reduxUser } = useAppSelector((state) => state.auth);
    let user = reduxUser;
    if (!user) {
        const localUser = localStorage.getItem("user");
        if (localUser) user = JSON.parse(localUser);
    }
    const currentUserId = user?.studentId || user?.userId || null;

    // States
    const [students, setStudents] = useState<Type[]>([]);
    const [myGroups, setMyGroups] = useState<GroupResponse[]>([]);
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!offeringId || !currentUserId) return;
            try {
                const studentData = await courseService.getStudentsByOffering(offeringId);
                setStudents(studentData);

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


    const handleGroupUpdated = (updatedGroup: GroupResponse) => {
        setMyGroups(prevGroups => prevGroups.map(g => g.id === updatedGroup.id ? updatedGroup : g));
    };

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
                                    <div className="flex flex-col gap-6">

                                        <GroupInfo
                                            group={activeGroup}
                                            students={students}
                                            currentUserId={currentUserId}
                                            onGroupUpdated={handleGroupUpdated}
                                        />

                                        {/* 2. Dùng Tabs để chuyển qua lại giữa Chat và Task */}
                                        <Tabs defaultValue="chat" className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                                            <TabsList className="grid w-full max-w-md grid-cols-2 mb-4 bg-gray-100 p-1 rounded-lg">
                                                <TabsTrigger
                                                    value="chat"
                                                    className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-md transition-all"
                                                >
                                                    <MessageSquare size={16} className="mr-2 inline" />
                                                    Thảo luận
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="tasks"
                                                    className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-md transition-all"
                                                >
                                                    <CheckCircle2 size={16} className="mr-2 inline" />
                                                    Nhiệm vụ
                                                </TabsTrigger>
                                            </TabsList>

                                            {/* Nội dung Tab Chat */}
                                            <TabsContent value="chat" className="mt-0 outline-none">
                                                <ChatBox
                                                    conversationId={activeGroup.conversationId}
                                                    currentUserId={currentUserId}
                                                    students={students}
                                                />
                                            </TabsContent>

                                            {/* Nội dung Tab Nhiệm vụ */}
                                            <TabsContent value="tasks" className="mt-0 outline-none">
                                                <TaskBoard
                                                    group={activeGroup}
                                                    students={students}
                                                    currentUserId={currentUserId}
                                                    isAdmin={activeGroup.participants?.find(p => p.userId === currentUserId)?.role === "ADMIN"}
                                                />
                                            </TabsContent>
                                        </Tabs>
                                    </div>
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
