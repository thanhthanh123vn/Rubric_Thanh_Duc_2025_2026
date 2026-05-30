import React, {useState, useEffect, useRef} from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {Plus, Search, Trash2, Edit, Upload, Download} from 'lucide-react';
import { useParams } from 'react-router-dom';
import {questionApi} from "@/api/questionApi.ts";
import { toast } from 'sonner';


interface AnswerOption {
  id?: string;
  content: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  content: string;
  type: 'MULTIPLE_CHOICE' | 'ESSAY';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  options: AnswerOption[];
  clos: any[]; // Thay bằng CourseCLO type
}

export default function TeacherQuestionBank() {
  const { courseId } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  // Mock fetch (Thay bằng RTK Query hoặc Axios gọi API)
  const fetchQuestions = async () => {
    try {
      const data = await questionApi.getQuestionsByCourse(courseId);
      setQuestions(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchQuestions();
    }
  }, [courseId]);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;


    if (!file.name.endsWith('.xlsx')) {
      toast.error("Vui lòng chọn file định dạng Excel (.xlsx)");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      toast.info("Đang xử lý dữ liệu...");


      const response = await questionApi.importQuestions(
          courseId,
          file
      );

      toast.success(response.data);


      fetchQuestions();

    } catch (error) {
      toast.error("Có lỗi xảy ra khi import file!");
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ngân hàng câu hỏi</h1>
            <p className="text-gray-500">Quản lý câu hỏi trắc nghiệm và tự luận cho môn học</p>
          </div>
          <div className="flex gap-2">
            {/* Nút tải template mẫu */}
            <Button variant="outline" className="text-gray-600">
              <Download className="w-4 h-4 mr-2"/>
              Tải file mẫu
            </Button>

            {/* Input file ẩn */}
            <input
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            {/* Nút trigger việc chọn file */}
            <Button
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2"/>
              {isUploading ? "Đang import..." : "Import Excel"}
            </Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2"/>
                  Thêm câu hỏi mới
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Tạo câu hỏi mới</DialogTitle>
                </DialogHeader>
                {/* Form tạo câu hỏi sẽ nằm ở đây */}
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nội dung câu hỏi</label>
                    <textarea className="w-full border rounded-md p-2 min-h-[100px]"
                              placeholder="Nhập nội dung..."></textarea>
                  </div>
                  <Button className="w-full">Lưu câu hỏi</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Bộ lọc & Tìm kiếm */}
          <div className="flex gap-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400"/>
              <Input
                  placeholder="Tìm kiếm theo nội dung..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="border rounded-md px-3 py-2 text-sm focus:outline-none">
              <option value="">Tất cả độ khó</option>
              <option value="EASY">Dễ</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HARD">Khó</option>
            </select>
            <select className="border rounded-md px-3 py-2 text-sm focus:outline-none">
              <option value="">Lọc theo CLO</option>
              {/* Lặp danh sách CLO của môn học vào đây */}
            </select>
          </div>

          {/* Bảng danh sách câu hỏi */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">STT</TableHead>
                  <TableHead>Nội dung câu hỏi</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Độ khó</TableHead>
                  <TableHead>Chuẩn đầu ra (CLOs)</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Chưa có câu hỏi nào trong ngân hàng.
                      </TableCell>
                    </TableRow>
                ) : (
                    questions.map((q, idx) => (
                        <TableRow key={q.id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell className="font-medium max-w-[300px] truncate" title={q.content}>
                            {q.content}
                          </TableCell>
                          <TableCell>
                            <Badge variant={q.type === 'MULTIPLE_CHOICE' ? 'default' : 'secondary'}>
                              {q.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Tự luận'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        q.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                            q.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                    }`}>
                      {q.difficulty}
                    </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {q.clos.map(clo => (
                                  <Badge key={clo.id} variant="outline" className="bg-blue-50 text-blue-700">
                                    {clo.cloName}
                                  </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600">
                                <Edit className="w-4 h-4"/>
                              </Button>
                              <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50">
                                <Trash2 className="w-4 h-4"/>
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
        );
        }