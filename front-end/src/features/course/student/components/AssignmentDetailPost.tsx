import React, {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {
    ChevronLeft,
    ClipboardList,
    Send,
    FileUp,
    Paperclip,
    MoreVertical,
    Users,
    ChevronUp,
    ChevronDown, X, FileText
} from "lucide-react";
import { toast } from "sonner";
import {assessmentService} from "@/pages/admin/api/assessmentService.ts";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";
import {courseService} from "@/features/course/courseApi.ts";
import {useAppSelector} from "@/hooks/useAppSelector.ts";

const AssignmentDetailPost = () => {
    const {id: offeringId, assignmentId} = useParams<{ id: string; assignmentId: string }>();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [showComments, setShowComments] = useState(false);
    const [commentInput, setCommentInput] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [localComments, setLocalComments] = useState([
        {
            id: 1,
            fullName: "Nguyễn Văn A",
            createdAt: new Date().toISOString(),
            content: "Thầy ơi cho em hỏi bài này nộp file zip được không ạ?"
        }
    ]);
    const { user: reduxUser } = useAppSelector((state) => state.auth);
    let user = reduxUser;
    if (!user) {
        const localUser = localStorage.getItem("user");
        if (localUser) {
            user = JSON.parse(localUser);
        }
    }
    const handleAddComment = () => {
        if (!commentInput.trim()) return;
        setIsSubmittingComment(true);

        // Giả lập gọi API gửi comment
        setTimeout(() => {
            setLocalComments([...localComments, {
                id: Date.now(),
                fullName: "Tên Của Bạn",
                createdAt: new Date().toISOString(),
                content: commentInput
            }]);
            
            setCommentInput("");
            setIsSubmittingComment(false);
            setShowComments(true);
        }, 500);
    };
    const fetchDetail = async () => {
        if (!assignmentId) return;
        try {
            setLoading(true);

            const data = await assessmentService.getAssessmentsByOffering(offeringId!);
            const detail = data.find((a: any) => a.assessmentId === assignmentId);
            setAssignment(detail);
        } catch (error) {
            console.error("Lỗi tải chi tiết bài tập:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {

        fetchDetail();
    }, [assignmentId, offeringId]);
    const [file, setFile] = useState<File | null>(null);
    const [link, setLink] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            e.target.value = "";
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
    };

    const handleSubmit = async () => {
        // 1. Kiểm tra xem người dùng đã chọn file hoặc nhập link chưa
        if (!file && !link.trim()) {
            toast.error("Vui lòng đính kèm file hoặc nhập link trước khi nộp!");
            return;
        }

        setIsSubmitting(true);
        try {
            if (!assignmentId) return;


            const formData = new FormData();

            if (file) {
                formData.append("file", file);
            }
            if (link.trim()) {
                formData.append("link", link.trim());
            }


            await courseService.submitAssignment(assignmentId, formData);


            toast.success("Nộp bài thành công!");

          fetchDetail();

        } catch (error) {
            console.error("Lỗi khi nộp bài:", error);
            alert("Nộp bài thất bại, vui lòng thử lại sau!");
        } finally {
            setIsSubmitting(false); // Tắt trạng thái xoay loading
        }
    };
    if (loading) return <div className="p-10 text-center">Đang tải...</div>;
    if (!assignment) return <div className="p-10 text-center">Không tìm thấy bài tập.</div>;

    return (
        <div className="bg-white min-h-screen flex flex-col">
            <Header onMenuClick={() => setIsMobileMenuOpen(true)}/>

            <div className="flex flex-1 flex-col md:flex-row">
                <div className="w-full md:w-64 shrink-0">
                    <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}/>
                </div>

                <main className="flex-1 p-4 md:p-8">
                    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">

                        {/* PHẦN NỘI DUNG CHÍNH (Trái) */}
                        <div className="flex-1">
                            <div className="flex items-start gap-4 border-b border-gray-200 pb-4">
                                <div className="p-3 bg-emerald-600 rounded-full text-white">
                                    <ClipboardList className="w-6 h-6"/>
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-2xl md:text-3xl font-normal text-emerald-700">
                                        {assignment.assessmentName}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1">
                                        <span>Giảng viên</span>
                                        <span>•</span>
                                        <span>{new Date(assignment.createdAt || Date.now()).toLocaleDateString("vi-VN")}</span>
                                    </div>
                                    <div className="flex justify-between items-center mt-3">
                                        <p className="text-sm font-semibold text-gray-800">{assignment.weight} điểm</p>
                                        <p className="text-sm font-medium text-gray-600">
                                            Hạn nộp: {new Date(assignment.endTime).toLocaleString("vi-VN")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 ">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {assignment.description || "Không có mô tả cho bài tập này."}
                                </p>
                            </div>
                            {assignment.fileUrl && (() => {

                                const extractFileInfo = (url: string) => {
                                    try {
                                        const cleanUrl = url.split('?')[0]; // Cắt bỏ các tham số phía sau dấu ?
                                        const fileName = cleanUrl.substring(cleanUrl.lastIndexOf('/') + 1);
                                        const fileFull = fileName.split('-').pop();

                                        const decodedName = decodeURIComponent(fileFull) || "Tai_lieu_dinh_kem";
                                        const parts = decodedName.split('.');
                                        const ext = parts.length > 1 ? parts.pop()?.toUpperCase() : "FILE";
                                        return {name: decodedName, ext};
                                    } catch {
                                        return {name: "Tài liệu đính kèm", ext: "FILE"};
                                    }
                                };

                                const {name, ext} = extractFileInfo(assignment.fileUrl);

                                return (
                                    <div className="mt-6 border-t pt-5 border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-800 mb-3">Tài liệu đính kèm</h3>
                                        <a
                                            href={assignment.fileUrl}
                                            target="_blank"
                                            rel="noreferrer"

                                            className="flex items-stretch w-full max-w-[400px] h-[72px] border border-gray-300 rounded-xl overflow-hidden hover:bg-gray-50 transition-all shadow-sm hover:shadow-md group cursor-pointer"
                                        >
                                            {/* CỘT TRÁI: THUMBNAIL PREVIEW */}
                                            <div
                                                className="w-[96px] shrink-0 bg-white border-r border-gray-200 relative overflow-hidden flex items-center justify-center">

                                                {/* Kỹ thuật Scale Iframe: Phóng to khung nhìn rồi thu nhỏ 25% để tạo Thumbnail trang đầu */}
                                                <iframe

                                                    src={`${assignment.fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                                                    className="absolute top-0 left-0 w-[384px] h-[288px] origin-top-left scale-[0.25] pointer-events-none border-none opacity-95 group-hover:opacity-100 transition-opacity"
                                                    tabIndex={-1}
                                                />


                                                <div className="absolute inset-0 z-10 bg-black/0"/>
                                            </div>


                                            <div
                                                className="flex-1 px-4 py-2.5 flex flex-col justify-center min-w-0 bg-white group-hover:bg-gray-50 transition-colors">
                    <span className="text-[14px] font-medium text-gray-900 truncate block leading-tight">
                        {name}
                    </span>
                                                <span
                                                    className="text-[11px] font-bold text-gray-500 uppercase mt-1.5 block tracking-wider">
                        {ext}
                    </span>
                                            </div>
                                        </a>
                                    </div>
                                );
                            })()}

                            {/* Class Comments Section */}


                            <div className="mt-10 border-t border-gray-200 pt-6">

                                {/* NÚT ẨN/HIỆN NHẬN XÉT */}
                                <div
                                    className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 mb-4 cursor-pointer w-max transition-colors hover:underline"
                                    onClick={() => setShowComments(!showComments)}
                                >
                                    <Users className="w-5 h-5"/>
                                    <h3 className="text-sm font-semibold">
                                        {localComments.length} nhận xét của lớp học
                                    </h3>
                                    {showComments ? <ChevronUp className="w-4 h-4"/> :
                                        <ChevronDown className="w-4 h-4"/>}
                                </div>

                                {/* DANH SÁCH NHẬN XÉT (Chỉ hiện khi showComments = true) */}
                                {showComments && localComments.length > 0 && (
                                    <div className="space-y-4 mb-6 px-1">
                                        {localComments.map((cmt) => (
                                            <div key={cmt.id} className="flex gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                    {cmt.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-baseline gap-2">
                                                        <span
                                                            className="text-sm font-semibold text-gray-800">{cmt.fullName}</span>
                                                        <span className="text-xs text-gray-500">
                                {new Date(cmt.createdAt).toLocaleTimeString("vi-VN", {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 mt-0.5">{cmt.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* KHUNG NHẬP NHẬN XÉT */}
                                <div className="flex items-center gap-3 mt-2">
                                    {/* Avatar người đăng */}
                                    {user.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt="avatar"
                                            className="w-9 h-9 rounded-full object-cover shrink-0"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold shrink-0">
                                            {user.fullName?.charAt(0) || "U"}
                                        </div>
                                    )}

                                    {/* Input Box bo tròn */}
                                    <div
                                        className="flex-1 flex items-center bg-white border border-gray-300 rounded-full px-4 py-1 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600 transition-all shadow-sm">
                                        <input
                                            value={commentInput}
                                            onChange={(e) => setCommentInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleAddComment();
                                            }}
                                            disabled={isSubmittingComment}
                                            placeholder="Thêm nhận xét cho lớp học..."
                                            className="flex-1 outline-none text-sm py-1.5 bg-transparent text-gray-800 placeholder-gray-500"
                                        />

                                        {/* Nút Send: Chỉ hiện khi có nhập chữ */}
                                        {commentInput.trim() && (
                                            <button
                                                onClick={handleAddComment}
                                                disabled={isSubmittingComment}
                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors ml-1"
                                            >
                                                {isSubmittingComment ? (
                                                    <div
                                                        className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <Send className="w-4 h-4 -ml-0.5"/>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PHẦN NỘP BÀI (Phải trên Desktop, Dưới trên Mobile) */}
                        <div className="w-full lg:w-80">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-medium">Bài tập của bạn</h2>
                                    <span className="text-xs font-semibold text-emerald-600 uppercase">Đã giao</span>
                                </div>

                                {/* KHU VỰC HIỂN THỊ FILE HOẶC NÚT UPLOAD */}
                                {file ? (
                                    // Trạng thái 1: Đã chọn file
                                    <div
                                        className="mb-4 bg-emerald-50/50 border border-emerald-200 rounded-xl overflow-hidden">
                                        <div
                                            className="p-3 flex justify-between items-center bg-white border-b border-gray-100">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                                    <FileText className="w-4 h-4"/>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                                                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleRemoveFile}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // Trạng thái 2: Chưa chọn file -> Hiện nút Upload & Input Link
                                    <div className="space-y-3 mb-4">
                                        <button
                                            onClick={() => document.getElementById("fileInput")?.click()}
                                            className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-emerald-600 font-medium hover:bg-emerald-50 transition-colors"
                                        >
                                            <FileUp className="w-5 h-5"/>
                                            <span>Thêm hoặc tạo</span>
                                        </button>
                                        {/* Thẻ input bị ẩn đi, chỉ kích hoạt khi bấm nút ở trên */}
                                        <input type="file" id="fileInput" hidden onChange={handleFileChange}/>

                                        {/* Ô nhập Link mở rộng (Tuỳ chọn) */}
                                        <input
                                            value={link}
                                            onChange={(e) => setLink(e.target.value)}
                                            placeholder="Hoặc dán liên kết (Drive, GitHub)..."
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-all"
                                        />
                                    </div>
                                )}

                                {/* NÚT NỘP BÀI / ĐÁNH DẤU HOÀN THÀNH */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || (!file && !link)} // Disable nếu chưa có file/link hoặc đang loading
                                    className={`w-full py-2.5 rounded-lg font-semibold transition shadow-md flex items-center justify-center gap-2 ${
                                        file || link
                                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <div
                                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : file || link ? (
                                        "Nộp bài"
                                    ) : (
                                        "Đánh dấu là đã hoàn thành"
                                    )}
                                </button>

                                <div className="mt-6 border-t pt-4">
                                    <p className="text-xs text-center text-gray-500 italic">
                                        Bài nộp sẽ được giảng viên chấm điểm dựa trên Rubric (nếu có).
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default AssignmentDetailPost;