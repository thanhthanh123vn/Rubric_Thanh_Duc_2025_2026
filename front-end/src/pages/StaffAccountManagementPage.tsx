import React, { useState, useMemo } from 'react';
import {
    Search, Plus, Edit, Trash2, Shield, UserCheck,
    Lock, Unlock, Filter, MoreVertical, Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// --- KIỂU DỮ LIỆU ---
export type StaffRole = 'ADMIN' | 'DEAN' | 'HEAD_OF_DEPARTMENT' | 'LECTURER';

export type StaffAccount = {
    id: string;
    username: string; // Mã số CBGV
    fullName: string;
    email: string;
    role: StaffRole;
    department: string;
    status: 'ACTIVE' | 'LOCKED';
    createdAt: string;
};

// --- DỮ LIỆU MẪU (MOCK DATA) ---
const MOCK_ACCOUNTS: StaffAccount[] = [
    { id: '1', username: 'GV001', fullName: 'Nguyễn Văn A', email: 'nva@hcmuaf.edu.vn', role: 'ADMIN', department: 'Phòng Đào Tạo', status: 'ACTIVE', createdAt: '2023-01-15' },
    { id: '2', username: 'GV002', fullName: 'TS. Lê Thị B', email: 'ltb@hcmuaf.edu.vn', role: 'DEAN', department: 'Khoa CNTT', status: 'ACTIVE', createdAt: '2023-02-20' },
    { id: '3', username: 'GV003', fullName: 'PGS.TS Trần C', email: 'tranc@hcmuaf.edu.vn', role: 'HEAD_OF_DEPARTMENT', department: 'Bộ môn CNPM', status: 'ACTIVE', createdAt: '2023-03-10' },
    { id: '4', username: 'GV004', fullName: 'ThS. Phạm D', email: 'phamd@hcmuaf.edu.vn', role: 'LECTURER', department: 'Bộ môn HTTT', status: 'ACTIVE', createdAt: '2023-04-05' },
    { id: '5', username: 'GV005', fullName: 'Vũ Văn E', email: 'vve@hcmuaf.edu.vn', role: 'LECTURER', department: 'Bộ môn MMT', status: 'LOCKED', createdAt: '2023-05-12' },
];

export default function StaffAccountManagementPage() {
    const [accounts, setAccounts] = useState<StaffAccount[]>(MOCK_ACCOUNTS);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<StaffRole | 'ALL'>('ALL');

    // Lọc dữ liệu
    const filteredAccounts = useMemo(() => {
        return accounts.filter(acc => {
            const matchSearch = acc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                acc.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                acc.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchRole = roleFilter === 'ALL' || acc.role === roleFilter;
            return matchSearch && matchRole;
        });
    }, [accounts, searchQuery, roleFilter]);

    // Các hàm Render UI Helper
    const getRoleBadge = (role: StaffRole) => {
        switch (role) {
            case 'ADMIN': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none">Quản trị viên</Badge>;
            case 'DEAN': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">Trưởng khoa</Badge>;
            case 'HEAD_OF_DEPARTMENT': return <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-200 border-none">Trưởng bộ môn</Badge>;
            case 'LECTURER': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Giảng viên</Badge>;
            default: return <Badge>{role}</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        return status === 'ACTIVE'
            ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20"><UserCheck className="h-3.5 w-3.5" /> Hoạt động</span>
            : <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20"><Lock className="h-3.5 w-3.5" /> Bị khóa</span>;
    };

    // Mock Actions
    const handleToggleLock = (id: string) => {
        setAccounts(prev => prev.map(acc =>
            acc.id === id ? { ...acc, status: acc.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' } : acc
        ));
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Tài khoản Cán bộ</h1>
                        <p className="text-sm text-slate-500 mt-1">Quản lý giảng viên, trưởng bộ môn, trưởng khoa và admin hệ thống.</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm">
                        <Plus className="mr-2 h-4 w-4" /> Thêm tài khoản mới
                    </Button>
                </div>

                {/* Filters & Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="md:col-span-3 border-slate-200 shadow-sm rounded-2xl">
                        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Tìm theo tên, email, hoặc mã CBGV..."
                                    className="pl-9 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-blue-500 w-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Filter className="h-4 w-4 text-slate-400" />
                                <select
                                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-[180px]"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value as StaffRole | 'ALL')}
                                >
                                    <option value="ALL">Tất cả chức vụ</option>
                                    <option value="ADMIN">Quản trị viên (Admin)</option>
                                    <option value="DEAN">Trưởng khoa (Dean)</option>
                                    <option value="HEAD_OF_DEPARTMENT">Trưởng bộ môn</option>
                                    <option value="LECTURER">Giảng viên (Lecturer)</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                        <CardContent className="p-4 flex items-center justify-between h-full">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Tổng số tài khoản</p>
                                <p className="text-3xl font-bold mt-1">{filteredAccounts.length}</p>
                            </div>
                            <Shield className="h-10 w-10 text-blue-200/50" />
                        </CardContent>
                    </Card>
                </div>

                {/* Data Table */}
                <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                                <TableRow>
                                    <TableHead className="w-[300px] font-semibold text-slate-700">Cán bộ / Giảng viên</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Chức vụ</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Đơn vị công tác</TableHead>
                                    <TableHead className="font-semibold text-slate-700">Trạng thái</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-700">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAccounts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                            Không tìm thấy tài khoản nào phù hợp.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAccounts.map((acc) => (
                                        <TableRow key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-900">{acc.fullName}</span>
                                                    <span className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" /> {acc.email}
                          </span>
                                                    <span className="text-xs text-slate-400 mt-1">Mã CBGV: {acc.username}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getRoleBadge(acc.role)}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-medium text-slate-700">{acc.department}</span>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(acc.status)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600 rounded-lg">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={`h-8 w-8 rounded-lg ${acc.status === 'ACTIVE' ? 'text-slate-500 hover:text-amber-600' : 'text-emerald-500 hover:text-emerald-700'}`}
                                                        onClick={() => handleToggleLock(acc.id)}
                                                        title={acc.status === 'ACTIVE' ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                                    >
                                                        {acc.status === 'ACTIVE' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
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
                </Card>

            </div>
        </div>
    );
}