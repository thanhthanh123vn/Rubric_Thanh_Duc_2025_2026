import React from "react";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar"

const Banner = () => {
    return (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-2xl font-semibold">TMDT Ca 2 thứ 3 phòng RD306</h2>
            <p className="text-sm opacity-90 mt-1">Bảng tin lớp học</p>
        </div>
    );
};

const CreatePostBox = () => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
                U
            </div>
            <input
                placeholder="Thông báo gì đó cho lớp của bạn..."
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
        </div>
    );
};

const UpcomingBox = () => {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
            <p className="text-gray-800 font-medium">Sắp đến hạn</p>
            <p className="text-sm text-gray-500 mt-1">
                Tuyệt vời, không có bài tập nào sắp đến hạn!
            </p>
        </div>
    );
};

const Post = ({ name, date, content }: any) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4 hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {name.charAt(0)}
                </div>
                <div>
                    <p className="font-semibold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">{date}</p>
                </div>
            </div>

            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {content}
            </p>

            <div className="mt-4 text-sm text-emerald-600 cursor-pointer hover:underline">
                Thêm nhận xét
            </div>
        </div>
    );
};

const ClassroomContent = () => {
    const posts = [
        {
            name: "Khương Hải Châu",
            date: "29 tháng 3",
            content:
                "THÔNG BÁO NGHỈ THỰC HÀNH 30/3 VÀ 31/3\nTuần này các em hoàn tất nội dung thiết kế giao diện nhé. Các nhóm phân chia công việc và dành thời gian làm bài ở nhà.",
        },
        {
            name: "Khương Hải Châu",
            date: "24 tháng 3",
            content: "Các bạn đăng ký đề tài seminar tại đây",
        },
    ];

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
                        <CreatePostBox />
                        <UpcomingBox />

                        {posts.map((post, index) => (
                            <Post key={index} {...post} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassroomContent;