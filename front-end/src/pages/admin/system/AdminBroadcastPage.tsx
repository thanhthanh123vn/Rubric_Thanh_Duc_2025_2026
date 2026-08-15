import React, { useState, useEffect, useMemo } from "react";
import { Send, AlertCircle, Users, Megaphone, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { notificationApi } from "@/api/notificationApi.ts";
import { useAppSelector } from "@/hooks/useAppSelector.ts"; // Đảm bảo bạn đã có hook này

// Mapping tên hiển thị cho các Role
const ROLE_LABELS: Record<string, string> = {
    ALL: "Tất cả người dùng hệ thống",
    DEAN: "Tất cả Trưởng Khoa",
    HEAD_OF_DEPARTMENT: "Tất cả Trưởng Bộ Môn",
    MAIN_LECTURER: "Tất cả Giảng Viên Chính",
    TEACHER: "Tất cả Giảng Viên",
    STUDENT: "Tất cả Sinh Viên",
};

export default function AdminBroadcastPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        recipientRole: ""
    });

    // 1. Lấy thông tin user hiện tại (Từ Redux hoặc LocalStorage)
    const { user: reduxUser } = useAppSelector((state) => state.auth);
    const currentUser = useMemo(() => {
        if (reduxUser) return reduxUser;
        const localUser = localStorage.getItem("user");
        return localUser ? JSON.parse(localUser) : null;
    }, [reduxUser]);

    const userRole = currentUser?.role || "";

    // 2. Logic phân quyền hiển thị danh sách người nhận
    const allowedRoles = useMemo(() => {
        switch (userRole) {
            case "ADMIN":
                return ["ALL", "DEAN", "HEAD_OF_DEPARTMENT", "MAIN_LECTURER", "TEACHER", "STUDENT"];
            case "DEAN":
                return ["HEAD_OF_DEPARTMENT", "MAIN_LECTURER", "TEACHER", "STUDENT"];
            case "HEAD_OF_DEPARTMENT":
                return ["MAIN_LECTURER", "TEACHER", "STUDENT"];
            case "MAIN_LECTURER":
                return ["TEACHER", "STUDENT"];
            case "TEACHER":
                return ["STUDENT"];
            default:
                return []; // Nếu không có quyền, trả về mảng rỗng
        }
    }, [userRole]);


    useEffect(() => {
        if (allowedRoles.length > 0 && !formData.recipientRole) {
            setFormData((prev) => ({ ...prev, recipientRole: allowedRoles[0] }));
        }
    }, [allowedRoles, formData.recipientRole]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (value: string) => {
        setFormData(prev => ({ ...prev, recipientRole: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.message.trim()) {
            toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung!");
            return;
        }

        setIsLoading(true);
        try {
            await notificationApi.broadcastNotification(formData);
            toast.success("Đã gửi thông báo hệ thống thành công!");

            // Xóa form nhưng giữ nguyên role đã chọn
            setFormData(prev => ({ ...prev, title: "", message: "" }));
        } catch (error) {
            console.error("Lỗi khi gửi thông báo:", error);
            toast.error("Không thể gửi thông báo. Vui lòng thử lại!");
        } finally {
            setIsLoading(false);
        }
    };

    // Nếu User không có quyền gửi thông báo
    if (allowedRoles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Không có quyền truy cập</h2>
                <p className="text-gray-500 mt-2">Tài khoản của bạn không có quyền gửi thông báo phát sóng.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">

                {/* Header Section - Mobile First */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-2.5 bg-blue-100 rounded-xl">
                                <Megaphone className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                            </div>
                            Phát Sóng Thông Báo
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 mt-2 sm:ml-[60px]">
                            Gửi thông báo quan trọng đến các nhóm người dùng trong hệ thống.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-600 shadow-sm self-start sm:self-auto">
                        <Users className="w-4 h-4 text-blue-500" />
                        Vai trò của bạn: <span className="text-blue-700">{ROLE_LABELS[userRole] || userRole}</span>
                    </div>
                </div>

                {/* Main Card */}
                <Card className="shadow-sm border-gray-200 rounded-[24px] overflow-hidden bg-white">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-5 sm:p-8">
                        <CardTitle className="text-lg sm:text-xl text-gray-800">
                            Soạn thông báo mới
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm mt-1.5">
                            Thông báo này sẽ được gửi trực tiếp đến chuông thông báo (Real-time) của các nhóm đối tượng đã chọn.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-5 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

                            {/* Khối Chọn đối tượng */}
                            <div className="space-y-3">
                                <Label htmlFor="recipientRole" className="text-sm font-semibold flex items-center gap-2 text-gray-800">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    Đối tượng nhận thông báo
                                </Label>
                                <Select value={formData.recipientRole} onValueChange={handleRoleChange}>
                                    <SelectTrigger className="w-full sm:w-1/2 h-12 rounded-xl border-gray-200 focus:ring-blue-500 bg-gray-50/50">
                                        <SelectValue placeholder="Chọn nhóm người nhận" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white z-50 rounded-xl shadow-lg border-gray-100">
                                        <SelectItem
                                            value="ALL"
                                            className="py-2.5 cursor-pointer"
                                        >
                                            Tất cả
                                        </SelectItem>

                                        {allowedRoles.map((role) => (
                                            <SelectItem
                                                key={role}
                                                value={role}
                                                className="py-2.5 cursor-pointer"
                                            >
                                                {ROLE_LABELS[role]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Khối Tiêu đề */}
                            <div className="space-y-3">
                                <Label htmlFor="title" className="text-sm font-semibold text-gray-800">
                                    Tiêu đề thông báo <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="VD: Lịch nghỉ lễ, Cập nhật tiến độ dự án..."
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="h-12 rounded-xl border-gray-200 focus-visible:ring-blue-500"
                                    maxLength={100}
                                />
                            </div>

                            {/* Khối Nội dung */}
                            <div className="space-y-3">
                                <Label htmlFor="message" className="text-sm font-semibold text-gray-800">
                                    Nội dung chi tiết <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    placeholder="Nhập chi tiết nội dung cần thông báo..."
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    className="min-h-[160px] sm:min-h-[200px] rounded-xl border-gray-200 resize-y focus-visible:ring-blue-500 p-4 leading-relaxed"
                                />
                            </div>

                            {/* Footer Submit */}
                            <div className="pt-6 mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-gray-100">
                                <div className="flex items-start sm:items-center gap-3 text-xs sm:text-sm text-amber-700 bg-amber-50/80 px-4 py-3 rounded-xl flex-1 border border-amber-100">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0 text-amber-500" />
                                    <p className="leading-relaxed">
                                        Kiểm tra kỹ nội dung trước khi gửi. Thông báo sẽ được đẩy ngay lập tức.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-[180px] shadow-md shadow-blue-200 transition-all font-semibold"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 mr-2" />
                                            Phát sóng ngay
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}