import React, { useState, useEffect } from "react";
import { useParams,useNavigate } from "react-router-dom";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";
import {courseService}  from "../../courseApi.ts";
import {useAppSelector} from "@/hooks/useAppSelector.ts";
import { assessmentService } from "@/pages/admin/api/assessmentService.ts";

const getInitial = (name?: string) => {
    if (!name) return "U";
    const words = name.trim().split(' ');
    const lastName = words[words.length - 1];
    return lastName.charAt(0).toUpperCase();
};
const Banner = ({ title, description }: any) => {
    return (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 mb-4 md:mb-6 shadow-sm">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="text-sm opacity-90 mt-1">{description}</p>
        </div>
    );
};

const CreatePostBox = ({onPostSuccess, fullName,avatarUrl}: { onPostSuccess: () => void, fullName?: string,avatarUrl?:string }) => {

    const { id } = useParams<{ id: string }>();
    const offeringId = id || "";
    console.log(avatarUrl);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePost = async () => {
        if (!content.trim() || !offeringId) return;
        try {
            setLoading(true);
            await courseService.createTopic(offeringId, content, "NORMAL");
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
                <div
                    className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full overflow-hidden bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm md:text-base relative">
                    {avatarUrl && avatarUrl.trim() !== "" ? (
                        <img
                            src={avatarUrl}
                            alt="avatar"
                            className="w-full h-full object-cover absolute inset-0"
                            onError={(e) => {

                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    ) : getInitial(fullName)}



                </div>
                <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handlePost();
                    }}
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
// Thêm lecturerName vào danh sách props
const AssignmentPost = ({ assessmentId, assessmentName, endTime, createdAt, offeringId, lecturerName }: any) => {
    const navigate = useNavigate();
    const dateToFormat = createdAt || new Date().toISOString();
    const formattedDate = new Date(dateToFormat).toLocaleDateString("vi-VN", {
        day: "numeric", month: "long"
    });

    const formattedEndTime = endTime
        ? new Date(endTime).toLocaleDateString("vi-VN", {
            day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
        })
        : "Không có hạn";

    return (
        <div
            onClick={() => navigate(`/course/${offeringId}/assignment/${assessmentId}`)}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 hover:shadow-md transition cursor-pointer flex items-center p-4 md:p-5 gap-4"
        >
            <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                </svg>
            </div>
            <div className="flex-1">
                {/* HIỂN THỊ TÊN GIẢNG VIÊN Ở ĐÂY */}
                <p className="font-semibold text-gray-900 text-sm md:text-base">
                    {lecturerName || "Giảng viên"} đã đăng một bài tập mới: {assessmentName}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <span className="font-medium text-emerald-600">Hạn nộp: {formattedEndTime}</span>
                </div>
            </div>
        </div>
    );
};
const Post = ({ postId, username, fullName,avatarUrl, createdAt, content, comments: initialComments = [] ,avatarUrlMe }: any) => {

    const formattedDate = new Date(createdAt).toLocaleDateString("vi-VN", {
        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
    const { user:reduxUser } = useAppSelector((state) => state.auth);
    let user = reduxUser;
    if (!user) {
        const localUser = localStorage.getItem("user");
        if (localUser) {
            user = JSON.parse(localUser);
        }
    }
    const studentId  = user?.studentId || user?.userId;
    const displayName = fullName || username || "Ẩn danh";

    console.log(avatarUrlMe);


    const [showComments, setShowComments] = useState(false);
    const [commentInput, setCommentInput] = useState("");
    const [loading, setLoading] = useState(false);

    const [localComments, setLocalComments] = useState<any[]>(initialComments);
    const fetchComments = async () => {
        try {
            const data = await courseService.getCommentsByPostId(postId);
            setLocalComments(data);
        } catch (error) {
            console.error("Lỗi lấy comment:", error);
        }
    };
    useEffect(() => {

            fetchComments();

    }, [showComments]);
    const handleAddComment = async () => {
        if (!commentInput.trim() || !postId) return;
        try {
            setLoading(true);


             await courseService.createComment(postId, commentInput);


            // const newComment = {
            //     commentId: Date.now().toString(),
            //     username: user.username,
            //     fullName : fullName,
            //     content: commentInput,
            //     createdAt: new Date().toISOString(),
            // };

            // setLocalComments([...localComments, newComment]);
            setCommentInput("");
            setShowComments(true);
            await fetchComments();
        } catch (error) {
            console.error("Lỗi khi gửi bình luận:", error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 hover:shadow-md transition overflow-hidden">
            {/* NỘI DUNG BÀI ĐĂNG */}
            <div className="p-4 md:p-5">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm md:text-base">
                        {avatarUrl && avatarUrl.trim() !== "" ?(
                            <img
                                src={avatarUrl}
                                alt="avatar"
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        ):getInitial(fullName)}

                    </div>

                    <div>
                        <p className="font-semibold text-gray-900">{fullName}</p>
                        <p className="text-xs text-gray-500">{formattedDate}</p>
                    </div>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {content}
                </p>
            </div>


            <div className="border-t border-gray-100"></div>


            <div className="p-4 bg-gray-50">

                {localComments.length > 0 && (
                    <div
                        className="text-sm text-emerald-600 font-medium cursor-pointer hover:underline mb-4 flex items-center gap-1"
                        onClick={() => setShowComments(!showComments)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2}
                             stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                        </svg>
                        {showComments ? "Ẩn nhận xét lớp học" : `${localComments.length} nhận xét của lớp học`}
                    </div>
                )}


                {showComments && (
                    <div className="space-y-4 mb-4">
                        {localComments.map((cmt: any) => {
                            const displayName = cmt.fullName || cmt.username || "Ẩn danh";

                            return (
                                <div key={cmt.commentId} className="flex gap-3">
                                    <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-semibold shrink-0">

                                        {cmt.avatarUrl && cmt.avatarUrl.trim() !== "" ? (
                                            <img
                                                src={cmt.avatarUrl}
                                                alt="avatar"
                                                className="w-full h-full object-cover rounded-full"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        ):getInitial(displayName)}
                                        {/*<span className="relative z-0">{getInitial(displayName)}</span>*/}
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-2">

                                            <p className="font-semibold text-gray-900 text-sm">{displayName}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(cmt.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-line">{cmt.content}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}


                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-xs shrink-0">
                        {avatarUrlMe && avatarUrlMe.trim() !== "" ? (
                            <img
                                src={avatarUrlMe}
                                alt="avatar"
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : getInitial(user.fullName)}
                    </div>
                    <div
                        className="flex-1 flex items-center bg-white border border-gray-200 rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                        <input
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(); }}
                            disabled={loading}
                            placeholder="Thêm nhận xét cho lớp học..."
                            className="flex-1 bg-transparent text-sm focus:outline-none py-1"
                        />
                        {/* Nút Gửi (Chỉ hiện khi có nhập chữ) */}
                        {commentInput.trim() && (
                            <button
                                onClick={handleAddComment}

                                disabled={loading}
                                className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-full transition-colors ml-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
const ClassroomContent = () => {
    const { user: reduxUser } = useAppSelector((state) => state.auth);
    let user = reduxUser;
    if (!user) {
        const localUser = localStorage.getItem("user");
        if (localUser) {
            user = JSON.parse(localUser);
        }
    }
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const { id } = useParams<{ id: string }>();
    const offeringId = id || "";

    const [course, setCourse] = useState<any>(null);
    const [feed, setFeed] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!offeringId) return;
        try {
            setLoading(true);
            const [courseData, postsData, assignmentsData] = await Promise.all([
                courseService.getCourseById(offeringId),
                courseService.getTopicsByOfferingId(offeringId),
                assessmentService.getAssessmentsByOffering(offeringId) // <--- Lấy danh sách bài tập
            ]);
            setCourse(courseData);


            const formattedAssignments = (assignmentsData || []).map((a: any) => ({
                ...a,
                feedType: 'ASSIGNMENT',

                sortTime: new Date(a.createdAt || a.endTime || new Date()).getTime()
            }));

            const formattedPosts = (postsData || []).map((p: any) => ({
                ...p,
                feedType: 'POST',
                sortTime: new Date(p.createdAt).getTime()
            }));


            const combinedFeed = [...formattedAssignments, ...formattedPosts].sort((a, b) => b.sortTime - a.sortTime);


            // const combinedFeed = [...formattedAssignments, ...formattedPosts];
            console.log("Bài Tập" ,formattedPosts);
            setFeed(combinedFeed);
        } catch (error) {
            console.error("Lỗi tải dữ liệu trang:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [offeringId, refreshKey]);

    if (loading && !course) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-gray-600">Đang tải dữ liệu...</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Header
                onMenuClick={() => setIsMobileMenuOpen(true)}
                onEnrollSuccess={() => setRefreshKey(prev => prev + 1)}
            />
            <div className="flex flex-1 flex-col md:flex-row">
                <div className="w-full md:w-64 shrink-0">
                    <Sidebar
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                    />
                </div>
                <div className="flex-1 p-3 sm:p-4 md:p-6 w-full">
                    <div className="max-w-3xl mx-auto w-full">
                        <Banner
                            title={course?.course?.courseName || "Lớp Học"}
                            description={`Giảng viên: ${course?.lecturerName} - Mã lớp: ${offeringId}`}
                        />

                        <CreatePostBox onPostSuccess={fetchData} fullName={user.fullName} avatarUrl={user.avatarUrl} />

                        <div className="hidden md:block">
                            <UpcomingBox />
                        </div>

                        <div className="space-y-4">
                            {feed.length === 0 ? (
                            <div className="text-center text-gray-500 mt-8 text-sm md:text-base">
                                Chưa có thông báo và bài tập nào.
                            </div>
                        ) : (
                            feed.map((item: any, idx: number) => {
                                if (item.feedType === 'ASSIGNMENT') {
                                    return (
                                        <AssignmentPost
                                            key={`assign-${item.assessmentId || idx}`}
                                            {...item}

                                            lecturerName={course?.lecturerName}
                                        />
                                    );
                                }
                                return <Post key={`post-${item.postId || idx}`} {...item} avatarUrlMe={user.avatarUrl} />;
                            })
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassroomContent;