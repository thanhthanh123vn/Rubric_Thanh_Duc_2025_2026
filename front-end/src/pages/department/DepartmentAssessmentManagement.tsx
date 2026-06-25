import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Edit, Trash2, Eye, CheckCircle } from 'lucide-react';


interface Assessment {
    id: string;
    name: string;
    courseName: string;
    type: string;
    weight: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
}

const DepartmentAssessmentManagement = () => {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {

        setTimeout(() => {
            const mockData: Assessment[] = [
                { id: '1', name: 'Đồ án giữa kỳ', courseName: 'Nhập môn CNPM', type: 'Project', weight: 30, status: 'APPROVED', createdAt: '2025-10-12' },
                { id: '2', name: 'Thi cuối kỳ', courseName: 'Cấu trúc dữ liệu', type: 'Exam', weight: 50, status: 'PENDING', createdAt: '2025-10-15' },
                { id: '3', name: 'Bài tập nhóm', courseName: 'Lập trình Web', type: 'Assignment', weight: 20, status: 'REJECTED', createdAt: '2025-10-18' },
            ];
            setAssessments(mockData);
            setIsLoading(false);
        }, 500);
    }, []);


    const filteredAssessments = assessments.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.courseName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'APPROVED': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Đã duyệt</span>;
            case 'PENDING': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Chờ duyệt</span>;
            case 'REJECTED': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Từ chối</span>;
            default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Đánh giá (Department)</h1>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus size={16} /> Tạo bài đánh giá mới
                </Button>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Danh sách Bài đánh giá / Rubric</CardTitle>
                    <div className="flex items-center justify-between mt-4">
                        <div className="relative w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Tìm theo tên bài hoặc môn học..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline">Lọc theo trạng thái</Button>
                            <Button variant="outline">Lọc theo môn học</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead>Tên đánh giá</TableHead>
                                        <TableHead>Môn học</TableHead>
                                        <TableHead>Loại hình</TableHead>
                                        <TableHead>Trọng số</TableHead>
                                        <TableHead>Ngày tạo</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAssessments.length > 0 ? (
                                        filteredAssessments.map((assessment) => (
                                            <TableRow key={assessment.id} className="hover:bg-gray-50/50">
                                                <TableCell className="font-medium">{assessment.name}</TableCell>
                                                <TableCell>{assessment.courseName}</TableCell>
                                                <TableCell>{assessment.type}</TableCell>
                                                <TableCell>{assessment.weight}%</TableCell>
                                                <TableCell>{assessment.createdAt}</TableCell>
                                                <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" title="Xem/Duyệt" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                            <CheckCircle size={16} />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" title="Chi tiết" className="h-8 w-8 text-gray-600 hover:bg-gray-100">
                                                            <Eye size={16} />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" title="Chỉnh sửa" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                                                            <Edit size={16} />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" title="Xóa" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                Không tìm thấy dữ liệu đánh giá nào phù hợp.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default DepartmentAssessmentManagement;