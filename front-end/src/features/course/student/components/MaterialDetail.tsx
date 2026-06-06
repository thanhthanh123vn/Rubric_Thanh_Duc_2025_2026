import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {Bookmark, MoreVertical, Users, Send, FileText, Download, X} from "lucide-react";
import Header from "@/components/home/Header.tsx";
import Sidebar from "@/features/course/student/components/Sidebar.tsx";
import courseService from "@/pages/admin/api/courseService.ts";
import { useAppSelector } from "@/hooks/useAppSelector.ts";


import { toast } from "sonner";
import {courseService as cs} from "@/features/course/courseApi.ts";
import postService from "@/api/postService.ts";


const getInitial = (name?: string) => {
    if (!name) return "U";
    const words = name.trim().split(' ');
    return words[words.length - 1].charAt(0).toUpperCase();
};
const getFileTypeDesc = (fileName: string) => {
    if (!fileName) return 'Tài liệu đính kèm';
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'Tài liệu PDF';
    if (['ppt', 'pptx'].includes(ext!)) return 'Microsoft PowerPoint';
    if (['doc', 'docx'].includes(ext!)) return 'Microsoft Word';
    if (['xls', 'xlsx'].includes(ext!)) return 'Microsoft Excel';
    if (['zip', 'rar'].includes(ext!)) return 'Tệp nén (ZIP/RAR)';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext!)) return 'Hình ảnh';
    return 'Tài liệu đính kèm';
};

export default function MaterialDetail() {
    const { id: offeringId, postId } = useParams<{ id: string, postId: string }>();
    const navigate = useNavigate();


    const { user: reduxUser } = useAppSelector((state) => state.auth);
    let user = reduxUser || JSON.parse(localStorage.getItem("user") || "{}");


    const [post, setPost] = useState<any>(null);
    // const [files, setFiles] = useState<any[]>([]);
    const [comments, setComments] = useState<any[]>([]);
    const [commentInput, setCommentInput] = useState("");
    const [loading, setLoading] = useState(true);


    const [previewFile, setPreviewFile] = useState<any | null>(null);
    useEffect(() => {
    const fetchDetailData = async () => {
        if (!postId || !offeringId) return;

        try {
            setLoading(true);

            const postData  = await postService.getPostById(postId);




            setPost(postData);



             const commentsData = await cs.getCommentsByPostId(postId);
             setComments(commentsData);

        } catch (error) {
            console.error("Lỗi khi tải chi tiết tài liệu:", error);
            toast.error("Không thể tải thông tin bài đăng!");
        } finally {
            setLoading(false);
        }
    };

    fetchDetailData();
}, [postId, offeringId]);

    const handleAddComment = async () => {
        if (!commentInput.trim()) return;
        await cs.createComment(postId, commentInput);
        const newCmt = {
            commentId: Date.now().toString(),
            fullName: user.fullName || "Bạn",
            content: commentInput,
            createdAt: new Date().toISOString(),
        };
        setComments([...comments, newCmt]);
        setCommentInput("");
        toast.success("Đã thêm nhận xét");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    return (
        <div className="bg-white min-h-screen flex flex-col md:flex-row overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                <Header />

                <main className="flex-1 p-4 md:p-8">
                    <div className="max-w-4xl mx-auto mt-2">

                        {/* --- PHẦN HEADER BÀI ĐĂNG --- */}
                        <div className="flex items-start gap-4 md:gap-5">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                                <Bookmark className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h1 className="text-2xl md:text-[2.1rem] font-normal text-gray-900 tracking-tight leading-tight">
                                        Tài liệu lớp học
                                    </h1>
                                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                                        <MoreVertical className="w-6 h-6" />
                                    </button>
                                </div>

                                <p className="text-sm text-gray-600 mt-1 font-medium">
                                    {post?.authorName || "Giảng viên"} • {post?.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' }) : ""}
                                </p>

                                <div className="border-b border-emerald-600 my-4 opacity-20"></div>

                                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                    {post?.content}
                                </p>

                                {/* --- DANH SÁCH FILE ĐÍNH KÈM TỪ MYSQL --- */}
                                {post.files.length > 0 && (
                                    <div className="flex flex-wrap gap-4 mt-6">
                                        {post.files.map((file) => (
                                            <div
                                                key={file.id}
                                                onClick={() => setPreviewFile(file)}
                                                className="flex w-full md:w-[360px] h-[72px] border border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors group"
                                            >
                                                <div className="flex-1 p-3 px-4 flex flex-col justify-center border-r border-gray-300 min-w-0">
                                                    <p className="font-medium text-sm text-gray-800 truncate group-hover:underline decoration-gray-400 underline-offset-2">
                                                        {file.fileName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                                        {getFileTypeDesc(file.fileName)}
                                                    </p>
                                                </div>
                                                <div className="w-[88px] bg-gray-50 flex items-center justify-center shrink-0 relative overflow-hidden">
                                                    <FileText className="w-8 h-8 text-gray-400" />
                                                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[10px] font-medium text-gray-600">Xem trước</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* --- KHU VỰC NHẬN XÉT CỦA LỚP HỌC --- */}
                        <div className="mt-8 ml-0 md:ml-16 border-t border-gray-200 pt-6">
                            <div className="flex items-center gap-2 text-gray-800 font-medium mb-5">
                                <Users className="w-5 h-5 text-gray-500" />
                                <span className="text-sm">Nhận xét của lớp học {comments.length > 0 && `(${comments.length})`}</span>
                            </div>

                            <div className="space-y-5 mb-6">
                                {comments.map((cmt) => (
                                    <div key={cmt.commentId} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-700 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                                            {getInitial(cmt.fullName)}
                                        </div>
                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-semibold text-sm text-gray-900">{cmt.fullName}</span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(cmt.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-800 mt-0.5">{cmt.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-purple-700 text-white flex items-center justify-center text-sm font-semibold shrink-0 mt-1">
                                    {getInitial(user.fullName)}
                                </div>
                                <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-full px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all shadow-sm hover:bg-gray-50/50">
                                    <input
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(); }}
                                        placeholder="Thêm nhận xét trong lớp học..."
                                        className="flex-1 bg-transparent text-sm text-gray-800 focus:outline-none placeholder-gray-500"
                                    />
                                    <button
                                        onClick={handleAddComment}
                                        disabled={!commentInput.trim()}
                                        className={`ml-2 p-1.5 rounded-full transition-colors ${commentInput.trim() ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-300 cursor-not-allowed'}`}
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal xem trước file */}
            {previewFile && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
                    <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-500"/>
                                {previewFile.fileName}
                            </h3>
                            <div className="flex items-center gap-2">
                                <a
                                    href={previewFile.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <Download className="w-4 h-4" /> Tải về
                                </a>
                                <button onClick={() => setPreviewFile(null)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-gray-100/50 w-full h-full relative">
                            {previewFile.fileName.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/) ? (
                                <div className="w-full h-full flex items-center justify-center p-6">
                                    <img src={previewFile.fileUrl} alt={previewFile.fileName} className="max-w-full max-h-full object-contain shadow-sm border border-gray-200 bg-white" />
                                </div>
                            ) : (
                                <iframe
                                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewFile.fileUrl)}&embedded=true`}
                                    className="w-full h-full border-none"
                                    title="Preview"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}