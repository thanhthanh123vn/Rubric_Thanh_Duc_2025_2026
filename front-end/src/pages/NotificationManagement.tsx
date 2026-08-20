import React, { useState, useEffect, useRef } from "react";
import { Plus, Search, Edit2, Trash2, Bell, Loader2, X, Send } from "lucide-react";
import { toast } from "sonner";
import { notificationApi } from "@/features/notification/notificationApi";
import { useAppSelector } from "@/hooks/useAppSelector";
import { connectWebSocket } from "@/notification/WebSocketNotication";
import { Client } from "@stomp/stompjs";

interface NotificationItem {
    id: string;
    title: string;
    content: string;
    notificationType: string;
    createdAt: string;
    recipientRole?: string;
}

export default function NotificationManagement() {
    const { user } = useAppSelector((state: any) => state.auth);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        recipientRole: "STUDENT"
    });

    // Ref quản lý WebSocket client
    const stompClientRef = useRef<Client | null>(null);
    const roleOptions = getAvailableRoles(user?.role);

    // 1. Tải danh sách thông báo lần đầu
    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await notificationApi.getNotificationsSent();
            const mappedData = (data || []).map((n: any) => {
                let parsedCreatedAt = n.created_at || n.createdAt;
                if (parsedCreatedAt && typeof parsedCreatedAt === 'object' && parsedCreatedAt.$date) {
                    parsedCreatedAt = parsedCreatedAt.$date;
                }
                return {
                    id: n.id || n._id,
                    title: n.title,
                    content: n.content || n.message,
                    notificationType: n.notification_type || n.notificationType || 'SYSTEM_ALERT',
                    createdAt: parsedCreatedAt,
                    recipientRole: n.recipientRole
                };
            });


            const uniqueNotifs: NotificationItem[] = [];
            const seen = new Set();

            mappedData.forEach((notif: NotificationItem) => {
                const uniqueKey = `${notif.title}-${notif.content}`;
                if (!seen.has(uniqueKey)) {
                    seen.add(uniqueKey);
                    uniqueNotifs.push(notif);
                }
            });

            setNotifications(uniqueNotifs);


        } catch (error) {
            toast.error("Không thể tải danh sách thông báo");
        } finally {
            setIsLoading(false);
        }
    };
    // 2. Lắng nghe WebSocket để cập nhật Real-time
    useEffect(() => {
        if (!user?.userId) return;

        // Dọn dẹp kết nối cũ nếu có
        if (stompClientRef.current) {
            stompClientRef.current.deactivate();
        }

        const stompClient = connectWebSocket(user.userId, (newNotif: any) => {
            let parsedCreatedAt = newNotif.created_at || newNotif.createdAt || new Date().toISOString();
            if (typeof parsedCreatedAt === 'object' && parsedCreatedAt.$date) {
                parsedCreatedAt = parsedCreatedAt.$date;
            }

            const mappedRealtimeNotif: NotificationItem = {
                id: newNotif.id || newNotif._id,
                title: newNotif.title,
                content: newNotif.content || newNotif.message,
                notificationType: newNotif.notification_type || newNotif.notificationType || 'SYSTEM_ALERT',
                createdAt: parsedCreatedAt,
                recipientRole: newNotif.recipientRole
            };

            setNotifications((prev) => {
                // Kiểm tra trùng lặp ID trước khi thêm
                const isExist = prev.some(n => n.id === mappedRealtimeNotif.id);
                if (isExist) return prev;
                return [mappedRealtimeNotif, ...prev];
            });
        });

        stompClientRef.current = stompClient;

        // Cleanup khi Component Unmount
        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }
        };
    }, [user?.userId]);

    // Lọc tìm kiếm
    const filteredNotifications = notifications.filter(n =>
        n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Mở Modal Thêm mới
    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ title: "", content: "", recipientRole: "STUDENT" });
        setIsModalOpen(true);
    };

    // Mở Modal Chỉnh sửa
    const handleOpenEdit = (notif: NotificationItem) => {
        setEditingId(notif.id);
        setFormData({
            title: notif.title,
            content: notif.content,
            recipientRole: notif.recipientRole || "STUDENT"
        });
        setIsModalOpen(true);
    };

    // Xử lý Xóa
    const handleDelete = async (id: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa thông báo này? Hành động này không thể hoàn tác.")) return;

        try {
            await notificationApi.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success("Đã xóa thông báo thành công");
        } catch (error) {
            toast.error("Lỗi khi xóa thông báo");
        }
    };

    // Xử lý Lưu (Thêm/Sửa)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) {
            toast.warning("Vui lòng nhập đầy đủ Tiêu đề và Nội dung");
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingId) {
                // Sửa thông báo
                await notificationApi.updateNotification(editingId, {
                    title: formData.title,
                    content: formData.content
                });
                toast.success("Cập nhật thông báo thành công");

                // Cập nhật state trực tiếp để UI đổi ngay lập tức (không cần gọi lại API)
                setNotifications(prev => prev.map(n =>
                    n.id === editingId
                        ? { ...n, title: formData.title, content: formData.content }
                        : n
                ));
            } else {
                // Gửi thông báo hàng loạt (Sẽ được WebSocket bắt và tự động cập nhật vào danh sách)
                await notificationApi.broadcastNotification({
                    title: formData.title,
                    message: formData.content,
                    recipientRole: formData.recipientRole
                });
                toast.success("Đã gửi thông báo hàng loạt");
            }
            setIsModalOpen(false);
        } catch (error) {
            toast.error("Có lỗi xảy ra, vui lòng thử lại");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <Bell className="w-6 h-6 text-emerald-600" />
                            Quản lý Thông báo
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Phát và quản lý các thông báo trong hệ thống</p>
                    </div>

                    <button
                        onClick={handleOpenCreate}
                        className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Soạn thông báo
                    </button>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-t-xl border border-slate-200 border-b-0 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-emerald-500 focus:bg-white outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200 rounded-b-xl shadow-sm overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 w-1/3">Tiêu đề</th>
                            <th className="px-6 py-4 w-1/3">Nội dung</th>
                            <th className="px-6 py-4">Ngày tạo</th>
                            <th className="px-6 py-4 text-right">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="py-12 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                                </td>
                            </tr>
                        ) : filteredNotifications.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-slate-500">
                                    Không tìm thấy thông báo nào.
                                </td>
                            </tr>
                        ) : (
                            filteredNotifications.map((notif) => (
                                <tr key={notif.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        {notif.title}
                                        {notif.notificationType === 'SYSTEM_ALERT' && (
                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-rose-100 text-rose-700">
                                                Hệ thống
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <p className="line-clamp-2">{notif.content}</p>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {notif.createdAt && !isNaN(new Date(notif.createdAt).getTime())
                                            ? new Date(notif.createdAt).toLocaleString('vi-VN')
                                            : "Gần đây"}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleOpenEdit(notif)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Sửa"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(notif.id)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* MODAL THÊM / SỬA THÔNG BÁO */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 text-lg">
                                    {editingId ? "Chỉnh sửa thông báo" : "Soạn thông báo mới"}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Tiêu đề */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Tiêu đề <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        autoFocus
                                        placeholder="Nhập tiêu đề thông báo"
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:bg-white outline-none transition-colors"
                                    />
                                </div>

                                {/* Nhóm nhận (Chỉ hiển thị khi Tạo mới) */}
                                {!editingId && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Đối tượng nhận <span className="text-rose-500">*</span></label>
                                        <select
                                            value={formData.recipientRole}
                                            onChange={e => setFormData({...formData, recipientRole: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:bg-white outline-none transition-colors appearance-none"
                                        >
                                            {roleOptions.map(r => (
                                                <option key={r.value} value={r.value}>{r.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Nội dung */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Nội dung chi tiết <span className="text-rose-500">*</span></label>
                                    <textarea
                                        rows={4}
                                        placeholder="Nhập nội dung cần thông báo..."
                                        value={formData.content}
                                        onChange={e => setFormData({...formData, content: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:bg-white outline-none transition-colors resize-none"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex items-center px-5 py-2 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-70"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : editingId ? (
                                            <Edit2 className="w-4 h-4 mr-2" />
                                        ) : (
                                            <Send className="w-4 h-4 mr-2" />
                                        )}
                                        {editingId ? "Cập nhật" : "Gửi thông báo"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Hàm hỗ trợ phân quyền hiển thị người nhận
function getAvailableRoles(userRole: string) {
    const baseRoles = [{ value: "STUDENT", label: "Sinh viên" }];

    if (userRole === "ADMIN" || userRole === "DEAN") {
        return [
            { value: "ALL", label: "Tất cả mọi người" },
            { value: "TEACHER", label: "Tất cả Giảng viên" },
            { value: "HEAD_OF_DEPARTMENT", label: "Trưởng bộ môn" },
            ...baseRoles
        ];
    }

    if (userRole === "HEAD_OF_DEPARTMENT") {
        return [
            { value: "TEACHER", label: "Giảng viên trong bộ môn" },
            ...baseRoles
        ];
    }

    return baseRoles;
}