import React, { useEffect, useState } from "react";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";

import type {Type} from "@/features/course/student/api/type.ts";
import {couserService} from "@/features/course/courseApi.ts";
import {useParams} from "react-router-dom";


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

const StudentItem = ({ student }: { student: Type }) => {
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
    const [students, setStudents] = useState<Type[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);


    const { id } = useParams<{ id: string }>();
    console.log("mã Học phần",id);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!id) return;

            setIsLoading(true);
            try {
                // Gọi API backend
                const data = await couserService.getStudentsByOffering(id);
                setStudents(data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách sinh viên:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudents();
    }, [id]);

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


            <div>
                {isLoading ? (
                    <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
                ) : (
                    <>
                        {filtered.map((student) => (
                            <StudentItem key={student.id} student={student}/>
                        ))}

                        {filtered.length === 0 && (
                            <div className="text-center py-10 text-gray-500">
                                Không có sinh viên
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const StudentContent = () => {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* HEADER */}
            <Header/>

            {/* BODY */}
            <div className="flex">
                {/* SIDEBAR */}
                <Sidebar/>

                {/* CONTENT */}
                <div className="flex-1 p-4 lg:p-6">
                    <div className="max-w-3xl mx-auto">
                        <Banner/>
                        <StudentList/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentContent;