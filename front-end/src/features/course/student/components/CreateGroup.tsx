import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, Check, Users, ArrowLeft, Info } from "lucide-react";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";
import { couserService } from "@/features/course/courseApi.ts";
import { useAppSelector } from "@/hooks/useAppSelector.ts";
import type { Type } from "@/features/course/student/api/type.ts";

import {groupService} from "@/features/course/student/api/GroupService.ts";

const CreateGroup = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

   
    const { user: reduxUser } = useAppSelector((state) => state.auth);
    let user = reduxUser;
    if (!user) {
        const localUser = localStorage.getItem("user");
        if (localUser) user = JSON.parse(localUser);
    }
    const currentUserId = user?.studentId || user?.userId || user?.id;

    // States
    const [groupName, setGroupName] = useState("");
    const [topic, setTopic] = useState("");
    const [students, setStudents] = useState<Type[]>([]);
    const [search, setSearch] = useState("");

    // Mảng lưu ID các thành viên được chọn (Mặc định có sẵn người tạo)
    const [selectedMembers, setSelectedMembers] = useState<string[]>(currentUserId ? [currentUserId] : []);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch danh sách sinh viên
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

    // Xử lý chọn/bỏ chọn thành viên
    const toggleMember = (memberId: string) => {

        if (memberId === currentUserId) return;

        setSelectedMembers((prev) =>
            prev.includes(memberId)
                ? prev.filter((i) => i !== memberId)
                : [...prev, memberId]
        );
    };

    // Lọc sinh viên theo ô tìm kiếm
    const filteredStudents = students.filter((s) =>
        s.fullName.toLowerCase().includes(search.toLowerCase())
    );

    // Xử lý Submit
    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            alert("Vui lòng nhập tên nhóm!");
            return;
        }

        setIsLoading(true);
        try {
            const requestData = {
                offeringId: id as string,
                createdById: currentUserId as string,
                groupName: groupName,
                topic: topic,
                memberIds: selectedMembers
            };


            const response = await groupService.createGroup(requestData);
            console.log("data group ",response);


            if (response.status === "success") {
                alert("Tạo nhóm thành công!");
                navigate(`/course/${id}/groups`);
            } else {
                alert("Lỗi: " + response.message);
            }
        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra khi tạo nhóm");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col lg:flex-row pb-20 lg:pb-0">
            {/* Header cho Desktop */}
            <div className="hidden lg:block w-full fixed top-0 z-50">
                <Header />
            </div>

            <Sidebar />

            <div className="flex-1 lg:mt-16 w-full max-w-3xl mx-auto">
                {/* Mobile App Bar */}
                <div className="lg:hidden bg-white px-4 py-3 border-b flex items-center gap-3 sticky top-0 z-30 shadow-sm">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft size={22} className="text-gray-700" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Tạo nhóm mới</h1>
                </div>

                {/* Nội dung chính */}
                <div className="p-4 lg:p-6 space-y-6">

                    {/* Banner cho Desktop */}
                    <div className="hidden lg:block bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-2xl font-semibold">Tạo nhóm mới</h2>
                        <p className="text-sm opacity-90 mt-1">Thiết lập nhóm và mời thành viên tham gia</p>
                    </div>

                    {/* Section 1: Thông tin cơ bản */}
                    <div className="bg-white p-4 lg:p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4 text-emerald-700 font-semibold">
                            <Info size={20} />
                            <h3>Thông tin nhóm</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên nhóm <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="VD: Nhóm 1 - Lập trình Web"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-base"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Đề tài / Mô tả (Tùy chọn)</label>
                                <textarea
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="Nhập đề tài hoặc mô tả ngắn gọn về nhóm..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-base resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Chọn thành viên */}
                    <div className="bg-white p-4 lg:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[500px] lg:h-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                                <Users size={20} />
                                <h3>Thành viên ({selectedMembers.length})</h3>
                            </div>
                        </div>

                        {/* Thanh tìm kiếm */}
                        <div className="relative mb-4 shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sinh viên..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-transparent rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                            />
                        </div>

                        {/* Danh sách Scroll */}
                        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                            {filteredStudents.map((student) => {
                                const isMe = student.id === currentUserId || student.userId === currentUserId;
                                const isSelected = selectedMembers.includes(student.id || student.userId);

                                return (
                                    <div
                                        key={student.id}
                                        onClick={() => toggleMember(student.id || student.userId)}
                                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                                            isSelected
                                                ? "bg-emerald-50 border-emerald-200"
                                                : "bg-white border-gray-100 hover:bg-gray-50"
                                        } ${isMe ? "opacity-70 cursor-not-allowed" : ""}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Avatar */}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                                isSelected ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"
                                            }`}>
                                                {student.fullName.charAt(0)}
                                            </div>

                                            <div>
                                                <p className={`font-medium text-sm ${isSelected ? "text-emerald-900" : "text-gray-900"}`}>
                                                    {student.fullName} {isMe && "(Bạn)"}
                                                </p>
                                                <p className="text-xs text-gray-500">{student.id}</p>
                                            </div>
                                        </div>

                                        {/* Checkbox Icon */}
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                                            isSelected ? "bg-emerald-500 border-emerald-500" : "bg-white border-gray-300"
                                        }`}>
                                            {isSelected && <Check size={14} className="text-white" />}
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredStudents.length === 0 && (
                                <p className="text-center text-gray-500 text-sm py-8">Không tìm thấy sinh viên nào</p>
                            )}
                        </div>
                    </div>

                    {/* Nút Submit cho Desktop (Ẩn trên Mobile vì dùng Sticky Bottom) */}
                    <div className="hidden lg:flex justify-end pt-4">
                        <button
                            onClick={handleCreateGroup}
                            disabled={isLoading || !groupName.trim()}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-xl font-medium transition-all"
                        >
                            {isLoading ? "Đang tạo..." : "Xác nhận tạo nhóm"}
                        </button>
                    </div>

                </div>
            </div>

            {/* Sticky Bottom Action Bar (Chỉ hiện trên Mobile) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
                <button
                    onClick={handleCreateGroup}
                    disabled={isLoading || !groupName.trim()}
                    className="w-full bg-emerald-600 disabled:bg-gray-300 text-white py-3.5 rounded-xl font-bold text-[15px] shadow-sm transition-all active:scale-[0.98]"
                >
                    {isLoading ? "Đang xử lý..." : "Tạo nhóm"}
                </button>
            </div>
        </div>
    );
};

export default CreateGroup;