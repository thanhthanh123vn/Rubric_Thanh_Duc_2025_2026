import { BookOpen, ClipboardList, FileText, Users, Workflow, UploadCloud, Download, X, Eye, MessageSquare, Send, Trash2, Pencil } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { type TeacherCourseItem } from './teacherCourseData';
import { useEffect, useState, useRef } from "react";
import courseService from "@/pages/admin/api/courseService.ts";
import { toast } from "sonner";
import type { SyllabusFile } from "@/api/type.ts";
import postService from "@/api/postService.ts";


export default function TeacherCourseOverview() {
  const { id } = useParams<{ id: string }>();

  const [courses, setCourses] = useState<TeacherCourseItem[]>([]);
  const [syllabusFiles, setSyllabusFiles] = useState<SyllabusFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE CHO ĐĂNG BÀI MỚI ---
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTitle, setUploadTitle] = useState("");

  const [previewFile, setPreviewFile] = useState<SyllabusFile | null>(null);

  // --- STATE CHO SỬA TÀI LIỆU ---
  const [editingFile, setEditingFile] = useState<SyllabusFile | null>(null);
  const [editFileName, setEditFileName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const data = await courseService.getLecturerDashBoardCourses();
      setCourses(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách lớp:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSyllabusFiles = async () => {
    if (!id) return;
    try {
      const data = await courseService.getSyllabusFiles(id);
      setSyllabusFiles(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải thông tin tài liệu môn học");
    }
  };

  useEffect(() => {
    fetchCourses();
    loadSyllabusFiles();
  }, [id]);

  const course = courses.find((item) => item.offeringId === id);

  // --- CÁC HÀM XỬ LÝ UPLOAD (THÊM) ---
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

      await loadSyllabusFiles();
      toast.success(`Đã tải lên ${selectedFiles.length} file và tạo thông báo thành công!`);

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

  // --- HÀM XÓA TÀI LIỆU ---
  const handleDeleteFile = async (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn chặn mở Modal xem trước
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này vĩnh viễn?")) return;

    try {
      await courseService.deleteSyllabusFile(fileId);
      toast.success("Đã xóa tài liệu thành công!");
      await loadSyllabusFiles(); // Tải lại danh sách
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xóa tài liệu!");
    }
  };

  // --- HÀM SỬA TÊN TÀI LIỆU ---
  const openEditModal = (file: SyllabusFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFile(file);
    setEditFileName(file.fileName);
  };

  const handleUpdateFileName = async () => {
    if (!editFileName.trim() || !editingFile) {
      toast.error("Vui lòng nhập tên tài liệu hợp lệ!");
      return;
    }

    setIsUpdating(true);
    try {
      await courseService.updateSyllabusFileName(editingFile.id, editFileName);
      toast.success("Cập nhật tên tài liệu thành công!");
      setEditingFile(null);
      await loadSyllabusFiles();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật tên tài liệu!");
    } finally {
      setIsUpdating(false);
    }
  };

  const getPreviewUrl = (url: string, fileName: string) => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith('.pdf') || lowerName.match(/\.(jpeg|jpg|gif|png)$/)) {
      return url;
    }
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  const stats = [
    { label: 'Sinh vien', value: course?.studentCount || 0, icon: Users },
    { label: 'Rubric', value: course?.rubricCount || 0, icon: FileText },
    { label: 'Bai tap', value: course?.assignmentCount || 0, icon: ClipboardList },
    { label: 'OBE', value: `${course?.obeProgress || 0}%`, icon: BookOpen },
  ];

  return (
      <div className="space-y-6 relative">
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

        {/* --- QUẢN LÝ GIÁO TRÌNH --- */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Giáo trình môn học ({syllabusFiles.length})
              </h4>
              <p className="mt-1 text-sm text-slate-500">
                Quản lý các tài liệu. Bấm vào file để xem trước.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                  onClick={() => setIsUploadModalOpen(true)}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <UploadCloud className="h-4 w-4" />
                Đăng & Tải lên mới
              </button>
            </div>
          </div>

          <div className="pt-4">
            {syllabusFiles.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-500">Chưa có giáo trình nào được tải lên cho môn học này.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {syllabusFiles.map((file) => (
                      <div
                          key={file.id}
                          onClick={() => setPreviewFile(file)}
                          className="group flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="truncate pr-2 max-w-[200px] sm:max-w-xs">
                            <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-emerald-700" title={file.fileName}>
                              {file.fileName}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Eye className="w-3 h-3" /> Nhấn xem trước
                            </p>
                          </div>
                        </div>

                        {/* CÁC NÚT HÀNH ĐỘNG SỬA/XÓA/TẢI VỀ */}
                        <div className="flex items-center gap-1 shrink-0 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-white/80 p-1 rounded-lg backdrop-blur-sm">
                          <button
                              onClick={(e) => openEditModal(file, e)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Đổi tên tài liệu"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                              onClick={(e) => handleDeleteFile(file.id, e)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa tài liệu"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="w-px h-4 bg-slate-200 mx-1"></div>
                          <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Tải xuống"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </div>

        {/* 3. Link nhanh và Hoạt động gần đây */}
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

        {/* --- MODAL CHỈNH SỬA TÊN TÀI LIỆU --- */}
        {editingFile && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Pencil className="w-4 h-4 text-emerald-600" />
                    Đổi tên tài liệu
                  </h3>
                  <button onClick={() => setEditingFile(null)} className="text-slate-400 hover:text-red-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tên file hiển thị mới</label>
                  <input
                      type="text"
                      value={editFileName}
                      onChange={(e) => setEditFileName(e.target.value)}
                      placeholder="Nhập tên tài liệu mới..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      autoFocus
                  />
                  <p className="text-xs text-slate-400 mt-2">Lưu ý: Không nên xóa phần mở rộng của file (VD: .pdf, .docx).</p>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button onClick={() => setEditingFile(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl">
                    Hủy bỏ
                  </button>
                  <button
                      onClick={handleUpdateFileName}
                      disabled={isUpdating || !editFileName.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50"
                  >
                    {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* --- MODAL 1: NHẬP NỘI DUNG VÀ CHỌN FILE ĐỂ ĐĂNG BÀI --- */}
        {isUploadModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50  p-4 sm:p-6 animate-in fade-in duration-200">
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

        {/* --- MODAL 2: XEM TRƯỚC FILE KHI BẤM VÀO GIÁO TRÌNH HIỆN CÓ --- */}
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