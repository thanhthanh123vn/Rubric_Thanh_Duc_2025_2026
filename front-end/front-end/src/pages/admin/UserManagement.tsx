import React, { useState } from 'react';
import { Search, Plus, MoreVertical, Edit, Trash2, Mail, GraduationCap } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';

// Dữ liệu giả lập khớp với Backend User-Service
const MOCK_USERS = [
    { id: '21130001', username: '21130001', email: '21130001@st.hcmuaf.edu.vn', role: 'STUDENT', authProvider: 'LOCAL' },
    { id: 'GV002', username: 'tranb', email: 'tranb@hcmuaf.edu.vn', role: 'TEACHER', authProvider: 'GOOGLE' },
    { id: '21130003', username: 'lethic', email: '21130003@st.hcmuaf.edu.vn', role: 'STUDENT', authProvider: 'LOCAL' },
];

export default function UserManagement() {
    const [searchQuery, setSearchQuery] = useState('');

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'TEACHER': return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-[11px] font-semibold rounded-md uppercase">Giảng viên</span>;
            case 'ADMIN': return <span className="px-2 py-1 bg-red-100 text-red-700 text-[11px] font-semibold rounded-md uppercase">Admin</span>;
            default: return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[11px] font-semibold rounded-md uppercase">Sinh viên</span>;
        }
    };

    const filteredUsers = MOCK_USERS.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
            {/* HEADER TƯƠNG THÍCH MOBILE */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Quản lý Người dùng</h2>
                    <p className="text-sm text-slate-500 mt-1 hidden md:block">Quản lý tài khoản Giảng viên và Sinh viên.</p>
                </div>
                <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 h-11 md:h-10 rounded-xl md:rounded-lg shadow-sm text-white">
                    <Plus className="w-5 h-5 md:w-4 md:h-4 mr-2" /> Tạo người dùng
                </Button>
            </div>

            {/* SEARCH BAR */}
            <div className="bg-white p-3 md:p-4 rounded-2xl md:rounded-xl shadow-sm border border-slate-200/60 flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Tìm theo MSSV, Tên hoặc Email..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-9 h-11 md:h-10 bg-slate-50 border-slate-200 rounded-xl focus:bg-white"
                    />
                </div>
            </div>

            {/* --- MÀN HÌNH MÁY TÍNH: BẢNG (TABLE) --- */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="w-full overflow-x-auto">
                    <div className="min-w-[800px] inline-block w-full align-middle">
                        <Table>
                            <TableHeader className="bg-slate-50/80">
                                <TableRow className="border-slate-100">
                                    <TableHead className="w-[150px] text-slate-500 font-medium pl-6">Mã (ID)</TableHead>
                                    <TableHead className="text-slate-500 font-medium">Tên đăng nhập</TableHead>
                                    <TableHead className="text-slate-500 font-medium">Email</TableHead>
                                    <TableHead className="text-slate-500 font-medium">Vai trò</TableHead>
                                    <TableHead className="text-slate-500 font-medium">Đăng nhập bằng</TableHead>
                                    <TableHead className="text-right text-slate-500 font-medium pr-6">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                    <TableRow key={user.id} className="border-slate-100 hover:bg-slate-50/80 transition-colors group">
                                        <TableCell className="font-semibold text-slate-900 pl-6">{user.id}</TableCell>
                                        <TableCell className="font-medium text-slate-700">{user.username}</TableCell>
                                        <TableCell className="text-slate-500">{user.email}</TableCell>
                                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                                        <TableCell>
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-md tracking-wider ${user.authProvider === 'GOOGLE' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-slate-100 text-slate-600'}`}>
                        {user.authProvider}
                      </span>
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                            Không tìm thấy người dùng nào.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* --- MÀN HÌNH ĐIỆN THOẠI: CARD LIST --- */}
            <div className="md:hidden space-y-3 pb-4">
                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col gap-3 relative">
                        <button className="absolute top-3 right-3 p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 pr-8">
                            <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center shadow-inner border border-slate-100 ${user.role === 'TEACHER' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-slate-900 text-base truncate">{user.username}</h3>
                                <p className="text-sm font-medium text-slate-500">{user.id}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-100 text-sm mt-1">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-200/60">
                                {getRoleBadge(user.role)}
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {user.authProvider}
                </span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="bg-white p-8 rounded-2xl text-center text-slate-500 border border-slate-200/60 font-medium">
                        Không tìm thấy người dùng.
                    </div>
                )}
            </div>

        </div>
    );
}