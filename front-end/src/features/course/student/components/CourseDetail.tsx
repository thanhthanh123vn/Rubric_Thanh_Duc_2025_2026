import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";
import { couserService } from "../../courseApi";

const Banner = ({ title, description }: any) => {
    return (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 mb-4 md:mb-6 shadow-sm">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="text-sm opacity-90 mt-1">{description}</p>
        </div>
    );
};

const CreatePostBox = ({ onPostSuccess }: { onPostSuccess: () => void }) => {

    const { id } = useParams<{ id: string }>();
    const offeringId = id || ""; // Đổi tên biến cho chuẩn ngữ nghĩa

    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePost = async () => {
        if (!content.trim() || !offeringId) return;
        try {
            setLoading(true);
            await couserService.createTopic(offeringId, content, "NORMAL");
            setContent("");
            onPostSuccess();
        } catch (error) {
            console.error("Lỗi khi đăng bài:", error);
            alert("Có lỗi xảy ra, không thể đăng bài!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm md:text-base">
                    U
                </div>
                <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handlePost(); }}
                    disabled={loading}
                    placeholder="Thông báo gì đó cho lớp..."
                    className="flex-1 bg-gray-100 rounded-full px-3 py-2 md:px-4 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
            </div>
            {content.trim() && (
                <div className="flex justify-end mt-3">
                    <button
                        onClick={handlePost}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition disabled:opacity-50"
                    >
                        {loading ? "Đang đăng..." : "Đăng bài"}
                    </button>
                </div>
            )}
        </div>
    );
};

const UpcomingBox = () => {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
            <p className="text-gray-800 font-medium">Sắp đến hạn</p>
            <p className="text-sm text-gray-500 mt-1">Tuyệt vời, không có bài tập nào sắp đến hạn!</p>
        </div>
    );
};

const Post = ({ username, createdAt, content }: any) => {
    const formattedDate = new Date(createdAt).toLocaleDateString("vi-VN", {
        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    });

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4 hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {username ? username.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                    <p className="font-semibold text-gray-900">{username}</p>
                    <p className="text-xs text-gray-500">{formattedDate}</p>
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
    // FIX BUG ROUTER: Lấy 'id' từ URL
    const { id } = useParams<{ id: string }>();
    const offeringId = id || "";

    const [course, setCourse] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!offeringId) return;
        try {
            setLoading(true);
            const [courseData, postsData] = await Promise.all([
                couserService.getCourseById(offeringId),
                couserService.getTopicsByOfferingId(offeringId)
            ]);
            setCourse(courseData);
            setPosts(postsData);
        } catch (error) {
            console.error("Lỗi tải dữ liệu trang:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [offeringId]);

    if (loading && !course) {
        return <div className="min-h-screen flex items-center justify-center">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Header />
            <div className="flex flex-1 flex-col md:flex-row">
                <div className="w-full md:w-64 shrink-0">
                    <Sidebar />
                </div>
                <div className="flex-1 p-3 sm:p-4 md:p-6 w-full">
                    <div className="max-w-3xl mx-auto w-full">
                        <Banner
                            title={course?.courseName || course?.name || "Lớp Học"}
                            description={`Mã lớp phần: ${offeringId}`}
                        />
                        <CreatePostBox onPostSuccess={fetchData} />

                        <div className="hidden md:block">
                            <UpcomingBox />
                        </div>

                        <div className="space-y-4">
                            {posts.length === 0 ? (
                                <div className="text-center text-gray-500 mt-8 text-sm md:text-base">
                                    Chưa có thông báo nào.
                                </div>
                            ) : (
                                posts.map((post: any) => (
                                    <Post key={post.postId} {...post} />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassroomContent;