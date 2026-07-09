import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, Search, Trash2, Edit, Upload, FileSpreadsheet, CheckCircle2, Circle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { questionApi } from "@/api/questionApi.ts";
import { toast } from 'sonner';
import { getAllClo } from "@/features/rubric/rubricApi.ts";
import {questionBankApi} from "@/api/QuestionBankApi.ts";
import type {Course} from "@/pages/admin/api/type.ts";
import courseService from "@/pages/admin/api/courseService.ts";

interface AnswerOption {
  content: string;
  correct: boolean;
}

interface Clo {
  cloId:string;
  cloCode: string;
  cloName: string;
  description: string;
  bloomLevel: string;
  courseId?: string;
}

interface Question {
  id: string;
  content: string;
  type: 'MULTIPLE_CHOICE' | 'ESSAY';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  score: number;
  options: AnswerOption[];
  cloIds: string[];
}

export default function TeacherQuestionBank() {
  const { id, bankId } = useParams();

  const [bank, setBank] = useState<any>(null);

  // States cho Dữ liệu
  const [questions, setQuestions] = useState<Question[]>([]);
  const [cloItems, setCloItems] = useState<Clo[]>([]);

  // States cho Bộ Lọc & Tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterClo, setFilterClo] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // States cho Modal & Upload
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [courses, setCourses] = useState<Course[]>([]);

  // States cho Form Thêm/Sửa
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cloIds: [] as string[],
    topicId: '',
    difficulty: 'MEDIUM',
    type: 'ESSAY',
    score:1,
    content: ''
  });
  const [options, setOptions] = useState<AnswerOption[]>([
    { content: '', correct: true },
    { content: '', correct: false },
    { content: '', correct: false },
    { content: '', correct: false },
  ]);
  useEffect(() => {
    const fetchBank = async () => {
      try {
        const [questionsAll, courseAll] = await Promise.all([
          questionBankApi.getQuestionBanksByCourse(id),
          courseService.getAllCourseNoPage(),
        ]);

        const currentBank = questionsAll.find(
            (b: any) => b.id === bankId
        );

        setBank(currentBank);
        setCourses(courseAll);
      } catch (error) {
        console.error(error);
      }
    };

    if (bankId) {
      fetchBank();
    }
  }, [bankId]);

  const fetchQuestions = async () => {
    try {
      const data = await questionApi.getQuestionsByCourseIdAndBankID(id,bankId);
      setQuestions(data || []);

    } catch (error) {
      console.error("Lỗi lấy danh sách câu hỏi:", error);
    }
  };
  console.log(bank);

  // Lấy danh sách Chuẩn đầu ra (CLO)
  const fetchClos = async () => {
    try {
      const response = await getAllClo();
      setCloItems(response.data || []);
      console.log(response.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách CLO:", error);
      toast.error("Không thể tải danh sách Chuẩn đầu ra");
    }
  };

  useEffect(() => {

      fetchQuestions();

    fetchClos();
  }, [id]);

  // Reset form khi đóng modal
  useEffect(() => {
    if (!isModalOpen) {
      setEditingQuestionId(null);
      setFormData({ cloIds:[], topicId: '', difficulty: 'MEDIUM', score: 1,type: 'ESSAY', content: '' });
      setOptions([
        { content: '', correct: true }, { content: '', correct: false },
        { content: '', correct: false }, { content: '', correct: false },
      ]);
    }
  }, [isModalOpen]);

  // Hành động bấm nút "Sửa"
  const handleEditClick = async (question: Question) => {
    setEditingQuestionId(question.id);
    console.log(question);
    setFormData({
      cloIds: question.cloIds || '',
      topicId: 'T1', // Tuỳ chỉnh theo logic project của bạn
      difficulty: question.difficulty,
      score: 1,
      type: question.type,
      content: question.content
    });



    if (question.type === 'MULTIPLE_CHOICE' && question.options) {
      const newOptions = Array(4).fill({ content: '', isCorrect: false }).map((defaultOpt, idx) => {
        return question.options[idx] ? { content: question.options[idx].content, isCorrect: question.options[idx].correct } : defaultOpt;
      });

      setOptions(newOptions);
    }
    setIsModalOpen(true);
  };
  const handleDelClick = async (questionId: string) => {

    const isConfirm = window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này không? Hành động này không thể hoàn tác.");

    if (!isConfirm) return;

    try {

      await questionApi.deleteQuestion(questionId);

      toast.success("Đã xóa câu hỏi thành công!");


      fetchQuestions();

    } catch (error) {
      console.error("Lỗi khi xóa câu hỏi:", error);
      toast.error("Xóa câu hỏi thất bại. Vui lòng thử lại!");
    }
  };
  // Xử lý Import Excel
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error("Vui lòng chọn file định dạng Excel (.xlsx, .xls)");
      return;
    }

    try {
      setIsUploading(true);
      toast.info("Đang xử lý dữ liệu...");
      const response = await questionApi.importQuestionsToBank(id, file,bankId);
      toast.success(response.data || "Import thành công!");
      fetchQuestions();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi import file!");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Lưu Câu Hỏi (Tạo mới & Cập nhật)
  const handleSaveQuestion = async () => {
    if (!formData.content || !formData.cloIds) {
      toast.error("Vui lòng nhập nội dung câu hỏi và chọn Chuẩn đầu ra!");
      return;
    }

    const payload = {
      ...formData,
      options: formData.type === "MULTIPLE_CHOICE" ? options : [],
    };

    try {
      if (editingQuestionId) {
        // Update
        await questionApi.updateQuestion(editingQuestionId, payload);

        toast.success("Đã cập nhật câu hỏi thành công!");
      } else {
        // Create
        await questionApi.createQuestionToBank(id, bankId,payload);

        toast.success("Đã tạo câu hỏi mới thành công!");
      }

      setIsModalOpen(false);

      // Load lại danh sách câu hỏi
      fetchQuestions();
    } catch (error) {
      console.error("Lỗi lưu câu hỏi:", error);
      toast.error("Không thể lưu câu hỏi!");
    }
  };

  // --- LOGIC LỌC DỮ LIỆU HIỂN THỊ TẠI BẢNG ---
  const filteredQuestions = questions.filter(q => {
    const matchSearch = q.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDifficulty = filterDifficulty ? q.difficulty === filterDifficulty : true;
    const matchClo = filterClo ? q.cloIds?.some((c: any) => c.cloCode === filterClo || c.cloName === filterClo) : true;
    return matchSearch && matchDifficulty && matchClo;
  });

  return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900">
              {bank?.name || "Đang tải..."}
            </h1>

            <p className="text-sm text-slate-500 font-medium">
              Quản lý và cập nhật danh sách câu hỏi trong kho
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3">
            <Button variant="outline"
                    className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-600 border-slate-200 shadow-sm">
              <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600"/>
              <span className="hidden sm:inline">Mẫu Excel</span>
              <span className="sm:hidden">Template</span>
            </Button>

            <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleFileChange}/>

            <Button
                variant="outline"
                className="w-full sm:w-auto bg-white border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2"/>
              {isUploading ? "Đang xử lý..." : "Import"}
            </Button>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                    className="col-span-2 sm:col-span-1 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  <Plus className="w-4 h-4 mr-2"/>
                  Thêm câu hỏi
                </Button>
              </DialogTrigger>

              {/* MODAL TẠO / SỬA CÂU HỎI */}
              <DialogContent
                  className="w-[95vw] sm:max-w-[750px] md:max-w-[850px] rounded-xl p-0 overflow-hidden bg-white border-slate-200">
                <DialogHeader className="p-5 sm:px-6 border-b border-slate-100 bg-slate-50/50">
                  <DialogTitle className="text-lg font-bold text-slate-800">
                    {editingQuestionId ? 'Sửa câu hỏi' : 'Tạo câu hỏi mới'}
                  </DialogTitle>
                </DialogHeader>

                <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[75vh]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    {/* Ô Môn học */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Môn học <span
                          className="text-red-500">*</span></label>
                      <Input disabled value={`Học phần (Mã: ${id})`}
                             className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"/>
                    </div>

                    {/* Ô Chọn CLO */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Chuẩn đầu ra <span className="text-red-500">*</span>
                      </label>

                      <div className="border border-slate-300 rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                        {cloItems.map((clo) => (
                            <label
                                key={clo.cloId}
                                className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded"
                            >
                              <input
                                  type="checkbox"
                                  className="h-4 w-4"
                                  checked={formData.cloIds.includes(clo.cloId)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData({
                                        ...formData,
                                        cloIds: [...formData.cloIds, clo.cloId],
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        cloIds: formData.cloIds.filter(
                                            (id) => id !== clo.cloId
                                        ),
                                      });
                                    }
                                  }}
                              />

                              <span className="text-sm">
          <span className="font-medium">{clo.cloCode}</span>
                                {clo.description && (
                                    <span className="text-slate-500 ml-1">
              - {clo.description}
            </span>
                                )}
        </span>
                            </label>
                        ))}
                      </div>
                    </div>

                    {/* Ô Chủ đề */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Chủ đề <span
                          className="text-red-500">*</span></label>
                      <select
                          className="w-full h-10 px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white cursor-pointer"
                          value={formData.topicId}
                          onChange={(e) =>
                              setFormData({
                                ...formData,
                                topicId: e.target.value,
                              })
                          }
                      >
                        <option value="" disabled hidden>
                          -- Chọn khóa học --
                        </option>

                        {courses.map((course: any) => (
                            <option key={course.courseId} value={course.courseId}>
                              {course.courseName}
                            </option>
                        ))}
                      </select>
                    </div>

                    {/* Ô Độ khó */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Độ khó <span
                          className="text-red-500">*</span></label>
                      <select
                          className="w-full h-10 px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white cursor-pointer"
                          value={formData.difficulty}
                          onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                      >
                        <option value="EASY">Dễ</option>
                        <option value="MEDIUM">Trung bình</option>
                        <option value="HARD">Khó</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Điểm <span
                          className="text-red-500">*</span></label>
                      <Input
                          type="number"
                          min="0"
                          step="0.5"
                          className="w-full h-10 px-3 py-2 bg-white border-slate-300 text-slate-700"
                          value={formData.score}
                          onChange={(e) => setFormData({...formData, score: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Kiểu câu hỏi <span
                        className="text-red-500">*</span></label>
                    <select
                        className="w-full sm:w-1/2 h-10 px-3 py-2 rounded-md border border-slate-300 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white cursor-pointer"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="ESSAY">Tự luận</option>
                      <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Nội dung câu hỏi <span
                        className="text-red-500">*</span></label>
                    <textarea
                        className="w-full min-h-[120px] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-400 resize-y"
                        placeholder="Nhập nội dung câu hỏi tại đây..."
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                    ></textarea>
                  </div>

                  {formData.type === 'MULTIPLE_CHOICE' && (
                      <div className="space-y-3 pt-2 animate-in fade-in zoom-in-95 duration-200">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          Các đáp án <span className="text-xs text-slate-400 font-normal">(Click vào ô tròn để chọn đáp án đúng)</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {['A', 'B', 'C', 'D'].map((label, index) => (
                              <div
                                  key={index}
                                  className={`relative flex items-start gap-3 p-3 rounded-lg border transition-all ${options[index].correct ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                              >
                                <div
                                    className="mt-0.5 cursor-pointer text-slate-400 hover:text-blue-500 transition-colors"
                                    onClick={() => {
                                      const newOpts = options.map((opt, i) => ({...opt, isCorrect: i === index}));
                                      setOptions(newOpts);
                                    }}
                                >
                                  {options[index].correct ? (
                                      <CheckCircle2 className="w-5 h-5 text-blue-600"/>
                                  ) : (
                                      <Circle className="w-5 h-5"/>
                                  )}
                                </div>
                                <div className="flex-1 space-y-1">
                                  <span className="text-xs font-semibold text-slate-500">Đáp án {label}</span>
                                  <Input
                                      className="h-8 text-sm border-slate-200 bg-transparent px-2"
                                      placeholder={`Nhập đáp án ${label}...`}
                                      value={options[index].content}
                                      onChange={(e) => {
                                        const newOpts = [...options];
                                        newOpts[index].content = e.target.value;
                                        setOptions(newOpts);
                                      }}
                                  />
                                </div>
                              </div>
                          ))}
                        </div>
                      </div>
                  )}
                </div>

                <div
                    className="p-4 sm:px-6 sm:py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)} className="bg-white">
                    Hủy
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 px-6" onClick={handleSaveQuestion}>
                    {editingQuestionId ? 'Lưu thay đổi' : 'Lưu câu hỏi mới'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* FILTER & TABLE */}
        <Card className="rounded-xl border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col flex-1">
          <div
              className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row gap-4 lg:items-center bg-white">
          <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                  placeholder="Tìm kiếm nội dung câu hỏi..."
                  className="pl-10 h-10 w-full bg-slate-50 border-slate-200 focus-visible:ring-blue-100 focus-visible:border-blue-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                  className="h-10 px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer text-slate-700 sm:min-w-[160px]"
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
              >
                <option value="">Tất cả độ khó</option>
                <option value="EASY">Dễ</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HARD">Khó</option>
              </select>

              <select
                  className="h-10 px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer text-slate-700 sm:min-w-[160px]"
                  value={filterClo}
                  onChange={(e) => setFilterClo(e.target.value)}
              >
                <option value="">Tất cả CĐR</option>
                {cloItems.map((clo) => (
                    <option key={clo.cloCode} value={clo.cloCode}>
                      {clo.cloCode}
                    </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <div className="min-w-[900px] w-full align-middle">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="w-[60px] text-center font-semibold text-slate-600">STT</TableHead>
                    <TableHead className="font-semibold text-slate-600">Nội dung câu hỏi</TableHead>
                    <TableHead className="w-[140px] font-semibold text-slate-600">Kiểu</TableHead>
                    <TableHead className="w-[120px] font-semibold text-slate-600 text-center">Độ khó</TableHead>
                    <TableHead className="w-[80px] font-semibold text-slate-600 text-center">Điểm</TableHead>
                    <TableHead className="w-[150px] font-semibold text-slate-600">CĐR</TableHead>
                    <TableHead className="w-[100px] font-semibold text-slate-600 text-right pr-6">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-[300px] text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400 space-y-3">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                              <Search className="h-8 w-8 text-slate-300" />
                            </div>
                            <p className="text-sm font-medium text-slate-500">Chưa có câu hỏi nào phù hợp</p>
                          </div>
                        </TableCell>
                      </TableRow>
                  ) : (
                      filteredQuestions.map((q, idx) => (
                          <TableRow key={q.id} className="group hover:bg-slate-50/80 transition-colors border-slate-100 cursor-default">
                            <TableCell className="text-center font-medium text-slate-500">{idx + 1}</TableCell>
                            <TableCell>
                              <p className="line-clamp-2 text-slate-700 font-medium max-w-[400px]" title={q.content}>
                                {q.content}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge
                                  variant={q.type === 'MULTIPLE_CHOICE' ? 'default' : 'secondary'}
                                  className={`font-medium shadow-none ${q.type === 'MULTIPLE_CHOICE' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
                              >
                                {q.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Tự luận'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            q.difficulty === 'EASY' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                q.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {q.difficulty === 'EASY' ? 'Dễ' : q.difficulty === 'MEDIUM' ? 'Trung bình' : 'Khó'}
                        </span>
                            </TableCell>

                            <TableCell className="text-center">
                              <span className="font-medium text-slate-700">{q.score ?? 1}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {q.cloIds && q.cloIds.length > 0 ? (
                                    q.cloIds.map((cloIdStr) => {
                                      // Tìm CLO tương ứng trong danh sách tổng 'clos' dựa vào cloId hoặc cloCode
                                      const matchedClo = cloItems.find(
                                          (c) => c.cloId === cloIdStr || c.cloCode === cloIdStr
                                      );
                                      return (
                                          <Badge key={cloIdStr} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {matchedClo ? matchedClo.cloCode : cloIdStr}
                                          </Badge>
                                      );
                                    })
                                ) : (
                                    <span className="text-xs text-slate-400 italic">--</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right pr-4">
                              <div className="flex justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-md"
                                    onClick={() => handleEditClick(q)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-md"
                                        onClick={() => handleDelClick(q.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      </div>
  );
}