import React, { useEffect, useState } from "react";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";

interface Student {
    id: string;
    fullName: string;
    email: string;
}

const Banner = () => {
    return (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-2xl font-semibold">
                TMDT Ca 2 thứ 3 phòng RD306
            </h2>
            <p className="text-sm opacity-90 mt-1">Danh sách sinh viên</p>
        </div>
    );
};

const StudentItem = ({ student }: { student: Student }) => {
    return (
        <div className="flex items-center justify-between p-4 border-b hover:bg-gray-50 transition">
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
                    {student.fullName.charAt(0)}
                </div>

                <div>
                    <p className="font-medium text-gray-900">{student.fullName}</p>
                    <p className="text-sm text-gray-500">{student.id}</p>
                </div>
            </div>

            <div className="text-sm text-gray-600">{student.email}</div>
        </div>
    );
};

const StudentList = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [search, setSearch] = useState("");

    // 🔥 Fake data (sau thay API)
    useEffect(() => {
        setStudents([
            { id: "SV001", fullName: "Nguyễn Văn A", email: "a@st.hcmuaf.edu.vn" },
            { id: "SV002", fullName: "Trần Thị B", email: "b@st.hcmuaf.edu.vn" },
            { id: "SV003", fullName: "Lê Văn C", email: "c@st.hcmuaf.edu.vn" },
        ]);
    }, []);

    const filtered = students.filter((s) =>
        s.fullName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            {/* Search */}
            <div className="p-4 border-b">
                <input
                    type="text"
                    placeholder="Tìm kiếm sinh viên..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
            </div>

            {/* List */}
            <div>
                {filtered.map((student) => (
                    <StudentItem key={student.id} student={student} />
                ))}

                {filtered.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        Không có sinh viên
                    </div>
                )}
            </div>
        </div>
    );
};

const StudentContent = () => {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* HEADER */}
            <Header />

            {/* BODY */}
            <div className="flex">
                {/* SIDEBAR */}
                <Sidebar />

                {/* CONTENT */}
                <div className="flex-1 p-4 lg:p-6">
                    <div className="max-w-3xl mx-auto">
                        <Banner />
                        <StudentList />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentContent;