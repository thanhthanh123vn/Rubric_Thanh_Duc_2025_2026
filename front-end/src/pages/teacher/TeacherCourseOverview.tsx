import { BookOpen, ClipboardList, FileText, Users, Workflow, UploadCloud, Download, X, Eye, MessageSquare, Send, Trash2, Pencil, Clock } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { type TeacherCourseItem } from './teacherCourseData';
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import courseService from "@/pages/admin/api/courseService.ts";

import type { SyllabusFile, PostResponse } from "@/api/type.ts";
import postService from "@/api/postService.ts";

export default function TeacherCourseOverview() {
  const { id } = useParams<{ id: string }>();

  // --- THÔNG TIN LỚP HỌC ---
  const [courses, setCourses] = useState<TeacherCourseItem[]>([]);

  // --- DANH SÁCH BÀI ĐĂNG ---
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE MODAL ĐĂNG BÀI MỚI ---
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE MODAL SỬA BÀI ĐĂNG ---
  const [editingPost, setEditingPost] = useState<PostResponse | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);


  const [existingFiles, setExistingFiles] = useState<SyllabusFile[]>([]);
  const [newSelectedFiles, setNewSelectedFiles] = useState<File[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE MODAL XEM TRƯỚC FILE ---
  const [previewFile, setPreviewFile] = useState<SyllabusFile | null>(null);


  // HÀM TẢI DỮ LIỆU

  const fetchCourses = async () => {
    try {
      const data = await courseService.getLecturerDashBoardCourses();
      setCourses(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách lớp:", error);
    }
  };

  const loadPosts = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await postService.getPostsByOffering(id);
      setPosts(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách tài liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    loadPosts();
  }, [id]);

  const course = courses.find((item) => item.offeringId === id);


  // HÀM XỬ LÝ UPLOAD VÀ TẠO BÀI ĐĂNG

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveSelectedFile = (indexToRemove: number) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUploadAndPost = async () => {
    if (!uploadTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài đăng!");
      return;
    }
    if (selectedFiles.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 file giáo trình!");
      return;
    }
    if (!id) return;

    setIsUploading(true);
    try {

      const uploadedFiles = await courseService.uploadSyllabus(id, selectedFiles);
      const uploadedFileIds = uploadedFiles.map((f: any) => f.id);


      await postService.createPost({
        offeringId: id,
        title: uploadTitle,
        content: uploadMessage,
        fileIds: uploadedFileIds
      });

      await loadPosts();
      toast.success(`Đã đăng tài liệu thành công!`);

      // 3. Reset State
      setIsUploadModalOpen(false);
      setUploadTitle("");
      setUploadMessage("");
      setSelectedFiles([]);
    } catch (error) {
      console.error("Lỗi Upload & Post:", error);
      toast.error("Quá trình đăng bài thất bại, vui lòng thử lại!");
    } finally {
      setIsUploading(false);
    }
  };


  // HÀM XỬ LÝ XÓA VÀ CẬP NHẬT BÀI ĐĂNG

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài đăng này? Mọi tài liệu bên trong sẽ bị xóa vĩnh viễn.")) return;

    try {
      await postService.deletePostSyllabusFile(postId);
      toast.success("Đã xóa bài đăng thành công!");
      await loadPosts();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xóa bài đăng!");
    }
  };

  const openEditModal = (post: PostResponse) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.content || "");
    setExistingFiles(post.files || []);
    setNewSelectedFiles([]);
  };
  const handleEditFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setNewSelectedFiles((prev) => [...prev, ...filesArray]);
    }
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };
  const handleRemoveExistingFile = (fileId: string) => {

    setExistingFiles((prev) => prev.filter(f => f.id !== fileId));
  };

  const handleRemoveNewSelectedFile = (indexToRemove: number) => {
    setNewSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };
  const handleUpdatePost = async () => {
    if (!editTitle.trim() || !editingPost) {
      toast.error("Vui lòng nhập tiêu đề bài đăng!");
      return;
    }

    setIsUpdating(true);
    try {
      let newUploadedFileIds: string[] = [];


      if (newSelectedFiles.length > 0) {
        const uploadedFiles = await courseService.uploadSyllabus(id!, newSelectedFiles);
        newUploadedFileIds = uploadedFiles.map((f: any) => f.id);
      }


      const existingFileIds = existingFiles.map(f => f.id);
      const finalFileIds = [...existingFileIds, ...newUploadedFileIds];


      await postService.updatePostSyllabusFile(editingPost.id, {
        offeringId: id!,
        title: editTitle,
        content: editContent,
        fileIds: finalFileIds
      });

      toast.success("Cập nhật bài đăng thành công!");
      setEditingPost(null);
      await loadPosts();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật bài đăng!");
    } finally {
      setIsUpdating(false);
    }
  };
  // HÀM HỖ TRỢ XEM TRƯỚC
  const getPreviewUrl = (url: string, fileName: string) => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith('.pdf') || lowerName.match(/\.(jpeg|jpg|gif|png)$/)) {
      return url;
    }
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  const stats = [
    { label: 'Sinh viên', value: course?.studentCount || 0, icon: Users },
    { label: 'Rubric', value: course?.rubricCount || 0, icon: FileText },
    { label: 'Bài tập', value: course?.assignmentCount || 0, icon: ClipboardList },
    { label: 'OBE', value: `${course?.obeProgress || 0}%`, icon: BookOpen },
  ];

  return (
      <div className="space-y-6 relative">

        {/* --- 1. THỐNG KÊ --- */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="mt-2 text-3xl font-black text-slate-900">{item.value}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                    <item.icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
          ))}
        </div>

        {/* --- 2. QUẢN LÝ BÀI ĐĂNG TÀI LIỆU --- */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
            <div>
              <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                Tài liệu & Bài đăng ({posts.length})
              </h4>
              <p className="mt-1 text-sm text-slate-500">
                Quản lý các bài đăng tài liệu, giáo trình cho lớp học.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                  onClick={() => setIsUploadModalOpen(true)}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <UploadCloud className="h-4 w-4" />
                Đăng tài liệu mới
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {isLoading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-500">Chưa có bài đăng tài liệu nào.</p>
                </div>
            ) : (
                posts.map((post) => (
                    <div key={post.id} className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden hover:border-emerald-200 transition-colors">

                      {/* HEADER BÀI ĐĂNG */}
                      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 text-lg leading-tight">{post.title}</h5>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                              <span className="font-medium text-slate-700">{post.authorName || "Giảng viên"}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {post.createdAt ? new Date(post.createdAt).toLocaleString('vi-VN') : "Gần đây"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* NÚT THAO TÁC BÀI ĐĂNG */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                              onClick={() => openEditModal(post)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Sửa bài đăng"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                              onClick={() => handleDeletePost(post.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa bài đăng"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* NỘI DUNG VÀ FILE ĐÍNH KÈM */}
                      <div className="p-5">
                        {post.content && (
                            <p className="text-sm text-slate-700 mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                        )}

                        {post.files && post.files.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {post.files.map((file) => (
                                  <div
                                      key={file.id}
                                      onClick={() => setPreviewFile(file)}
                                      className="group flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer"
                                  >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                      <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <FileText className="w-5 h-5" />
                                      </div>
                                      <div className="truncate pr-2">
                                        <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-emerald-700" title={file.fileName}>
                                          {file.fileName}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5 group-hover:underline">Nhấn xem trước</p>
                                      </div>
                                    </div>
                                    <a
                                        href={file.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex-shrink-0 p-2 text-slate-400 bg-white rounded-full border border-slate-200 hover:text-emerald-600 hover:border-emerald-600 hover:bg-emerald-50 transition-all z-10"
                                        title="Tải xuống"
                                    >
                                      <Download className="w-4 h-4" />
                                    </a>
                                  </div>
                              ))}
                            </div>
                        )}
                      </div>
                    </div>
                ))
            )}
          </div>
        </div>

        {/* --- 3. LINK NHANH & HOẠT ĐỘNG --- */}
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-bold text-slate-900">Nhánh học phần</h4>
                <p className="mt-1 text-sm text-slate-500">Tổng quan các chế độ quản lý</p>
              </div>
              <Workflow className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <QuickLink label="Quản lý sinh viên" to="students" />
              <QuickLink label="Bài tập và quiz" to="assignments" />
              <QuickLink label="Rubric và LO" to="rubric" />
              <QuickLink label="Nhóm và dự án" to="groups" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="text-xl font-bold text-slate-900">Hoạt động gần đây</h4>
            <div className="mt-4 space-y-3">
              {[
                'Đã cập nhật rubric cho project sprint 2',
                'Đã thêm 12 câu hỏi mới vào ngân hàng',
                'Đã import danh sách lớp học kỳ này',
              ].map((item) => (
                  <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    {item}
                  </div>
              ))}
            </div>
          </div>
        </div>




        {/* --- MODAL CHỈNH SỬA BÀI ĐĂNG --- */}
        {editingPost && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-emerald-600" />
                    Sửa bài đăng tài liệu
                  </h3>
                  <button onClick={() => setEditingPost(null)} className="text-slate-400 hover:text-red-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>


                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tiêu đề bài đăng <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nội dung thông báo (Tùy chọn)</label>
                    <textarea
                        rows={3}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                    ></textarea>
                  </div>

                  {/* Vùng quản lý tài liệu khi Sửa */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Quản lý tài liệu</label>

                    {/* Nút bấm để thêm file mới */}
                    <div
                        onClick={() => editFileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors mb-4"
                    >
                      <UploadCloud className="w-6 h-6 text-emerald-500 mb-1" />
                      <p className="text-sm text-emerald-800 font-medium">Bấm để đính kèm thêm file mới</p>
                      <input
                          type="file"
                          ref={editFileInputRef}
                          onChange={handleEditFileSelect}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.jpg,.png"
                          multiple
                      />
                    </div>

                    {/* Danh sách File cũ đang có */}
                    {existingFiles.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">File đã đăng</p>
                          <div className="space-y-2">
                            {existingFiles.map((file) => (
                                <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    <span className="text-sm font-medium text-slate-700 truncate">{file.fileName}</span>
                                  </div>
                                  <button
                                      onClick={() => handleRemoveExistingFile(file.id)}
                                      className="text-slate-400 hover:text-red-500 p-1"
                                      title="Xóa file này"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                            ))}
                          </div>
                        </div>
                    )}

                    {/* Danh sách File mới chọn thêm */}
                    {newSelectedFiles.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-emerald-600 mb-2 uppercase tracking-wider">File mới đính kèm thêm</p>
                          <div className="space-y-2">
                            {newSelectedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-lg shadow-sm">
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    <span className="text-sm font-medium text-emerald-800 truncate">{file.name}</span>
                                    <span className="text-xs text-emerald-600/70">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                  </div>
                                  <button
                                      onClick={() => handleRemoveNewSelectedFile(index)}
                                      className="text-emerald-500 hover:text-red-500 p-1"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                            ))}
                          </div>
                        </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button onClick={() => setEditingPost(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl">
                    Hủy bỏ
                  </button>
                  <button
                      onClick={handleUpdatePost}
                      disabled={isUpdating || !editTitle.trim() || (existingFiles.length === 0 && newSelectedFiles.length === 0)}
                      className="px-5 py-2.5 flex items-center gap-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50"
                  >
                    {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            </div>
        )}
        {/* --- MODAL ĐĂNG BÀI VÀ UPLOAD FILE --- */}
        {isUploadModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 sm:p-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    Thông báo & Tải lên tài liệu mới
                  </h3>
                  <button
                      onClick={() => !isUploading && setIsUploadModalOpen(false)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tiêu đề bài đăng <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Nhập tiêu đề (VD: Tài liệu Bài 1: Tổng quan...)"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nội dung thông báo (Tùy chọn)</label>
                    <textarea
                        rows={3}
                        placeholder="Nhập lời nhắn cho sinh viên (VD: Các em tải slide bài 1 về xem trước nhé...)"
                        value={uploadMessage}
                        onChange={(e) => setUploadMessage(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tài liệu đính kèm <span className="text-red-500">*</span></label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors"
                    >
                      <UploadCloud className="w-8 h-8 text-emerald-500 mb-2" />
                      <p className="text-sm text-emerald-800 font-medium">Nhấn vào đây để chọn file từ máy tính</p>
                      <p className="text-xs text-emerald-600/70 mt-1">Hỗ trợ PDF, Word, Excel, PPT, Zip, Hình ảnh...</p>
                      <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.jpg,.png"
                          multiple
                      />
                    </div>
                    {selectedFiles.length > 0 && (
                        <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                          {selectedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                  <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                                  <span className="text-xs text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                </div>
                                <button
                                    onClick={() => handleRemoveSelectedFile(index)}
                                    className="text-slate-400 hover:text-red-500 p-1"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                          ))}
                        </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                  <button
                      onClick={() => setIsUploadModalOpen(false)}
                      disabled={isUploading}
                      className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                  >
                    Hủy bỏ
                  </button>
                  <button
                      onClick={handleUploadAndPost}
                      disabled={isUploading || selectedFiles.length === 0}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Đang xử lý...
                        </>
                    ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Đăng & Tải lên ({selectedFiles.length})
                        </>
                    )}
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* --- MODAL XEM TRƯỚC FILE --- */}
        {previewFile && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 line-clamp-1">{previewFile.fileName}</h3>
                      <p className="text-xs text-slate-500">Chế độ xem trước tài liệu</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                        href={previewFile.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <Download className="w-4 h-4" /> Tải về
                    </a>
                    <button
                        onClick={() => setPreviewFile(null)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-slate-100/50 w-full h-full relative">
                  {previewFile.fileName.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/) ? (
                      <div className="w-full h-full flex items-center justify-center p-6">
                        <img
                            src={previewFile.fileUrl}
                            alt={previewFile.fileName}
                            className="max-w-full max-h-full object-contain rounded shadow-sm border border-slate-200 bg-white"
                        />
                      </div>
                  ) : (
                      <iframe
                          src={getPreviewUrl(previewFile.fileUrl, previewFile.fileName)}
                          className="w-full h-full border-none"
                          title="Document Preview"
                          loading="lazy"
                      />
                  )}
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

function QuickLink({ label, to }: { label: string; to: string }) {
  return (
      <Link
          to={to}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
      >
        {label}
      </Link>
  );
}