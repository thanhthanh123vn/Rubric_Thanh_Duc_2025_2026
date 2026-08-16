import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";
import { courseService } from "../../courseApi.ts";
import { useAppSelector } from "@/hooks/useAppSelector.ts";
import { assessmentService } from "@/pages/admin/api/assessmentService.ts";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { toast } from "sonner";
import postService from "@/api/postService.ts";
import { X, Send, MessageSquare } from "lucide-react";

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

const CreatePostBox = ({ onPostSuccess, fullName, avatarUrl }: { onPostSuccess: () => void, fullName?: string, avatarUrl?: string }) => {
    const { id } = useParams<{ id: string }>();
    const offeringId = id || "";

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
            toast.error("Có lỗi xảy ra, không thể đăng bài!");
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

// const UpcomingBox = () => {
//     return (
//         <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
//             <p className="text-gray-800 font-medium">Sắp đến hạn</p>
//             <p className="text-sm text-gray-500 mt-1">Tuyệt vời, không có bài tập nào sắp đến hạn!</p>
//         </div>
//     );
// };

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
            onClick={() => navigate(`/course/${offeringId}/assignments/${assessmentId}`)}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 hover:shadow-md transition cursor-pointer flex items-center p-4 md:p-5 gap-4"
        >
            <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                </svg>
            </div>
            <div className="flex-1">
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

const AnnouncementPost = ({ id: postId, title, content, createdAt, offeringId, lecturerName }: any) => {
    const navigate = useNavigate();
    const formattedDate = new Date(createdAt).toLocaleDateString("vi-VN", {
        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    });

    return (
        <div
            onClick={() => navigate(`/course/${offeringId}/document/materials/${postId}`)}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 hover:shadow-md transition cursor-pointer flex items-start p-4 md:p-5 gap-4"
        >
            <div className="w-10 h-10 shrink-0 rounded-full bg-blue-500 text-white flex items-center justify-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
            </div>
            <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm md:text-base">
                    {lecturerName || "Giảng viên"} đã đăng một thông báo một tài liệu mới: {title}
                </p>
                <div className="text-xs text-gray-500 mb-2 mt-0.5">{formattedDate}</div>
                {content && (
                    <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-2 mt-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        {content}
                    </p>
                )}
            </div>
        </div>
    );
};



// COMPONENT POST DÀNH CHO SINH VIÊN (ĐÃ FIX LỖI REALTIME)

const Post = ({ postId, id, username, fullName, avatarUrl, createdAt, content, comments: initialComments = [], avatarUrlMe }: any) => {
    const formattedDate = new Date(createdAt).toLocaleDateString("vi-VN", {
        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    });

    // Lấy đúng ID của bài đăng (bảo vệ trường hợp backend trả về `id` thay vì `postId`)
    const currentPostId = postId || id;

    const { user: reduxUser } = useAppSelector((state) => state.auth);
    let user = reduxUser;
    if (!user) {
        const localUser = localStorage.getItem("user");
        if (localUser) {
            user = JSON.parse(localUser);
        }
    }
    const displayName = fullName || username || "Ẩn danh";

    const [showComments, setShowComments] = useState(true);
    const [commentInput, setCommentInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [localComments, setLocalComments] = useState<any[]>(initialComments);
    const [replyingTo, setReplyingTo] = useState<{ id: string, name: string } | null>(null);

    const stompClientRef = useRef<any>(null);

    const fetchComments = async () => {
        if (!currentPostId) return;

        try {
            const data = await courseService.getCommentsByPostId(currentPostId);

            const safeData = Array.isArray(data)
                ? data
                : (data?.content || data?.data || []);

            setLocalComments(safeData);
        } catch (error) {
            console.error("Lỗi lấy comment:", error);
        }
    };


    useEffect(() => {
        if (!currentPostId) {
            console.error(" Không tìm thấy ID bài đăng.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) return;

        const wsUrl =
            import.meta.env.VITE_WS_URL_COURSE ||
            import.meta.env.VITE_WS_URL ||
            "http://localhost:8080";

        const stompClient = new Client({
            webSocketFactory: () => new SockJS(`${wsUrl}/ws?token=${token}`),


            reconnectDelay: 5000,

            // Tắt log STOMP
            debug: () => {},

            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },

            onConnect: () => {
                console.log(
                    ` [WebSocket] Đã kết nối comment bài viết: ${currentPostId}`
                );

                stompClient.subscribe(
                    `/topic/posts/${currentPostId}/comments`,
                    (payload) => {
                        try {
                            const newComment = JSON.parse(payload.body);

                            setLocalComments((prev) => {
                                const exists = prev.some(
                                    c => (c.commentId || c.id) === newComment.commentId
                                );

                                if (exists) return prev;

                                return [...prev, newComment];
                            });
                        } catch (error) {
                            console.error(
                                " Không thể parse comment:",
                                error
                            );
                        }
                    }
                );
            },

            onStompError: (frame) => {
                console.error(
                    " STOMP Error:",
                    frame.headers["message"],
                    frame.body
                );
            },

            onWebSocketError: (error) => {
                console.error(" WebSocket Error:", error);
            },

            onWebSocketClose: () => {
                console.log(" WebSocket đã đóng.");
            },
        });

        stompClientRef.current = stompClient;

        // Bắt đầu kết nối
        stompClient.activate();

        return () => {
            console.log(
                `🔌 [WebSocket] Đóng kết nối comment bài viết: ${currentPostId}`
            );

            stompClient.deactivate();
        };
    }, [currentPostId]);

    useEffect(() => {
        fetchComments();
    }, [currentPostId]);

    const handleAddComment = async () => {
        if (!commentInput.trim() || !currentPostId) return;
        try {
            setLoading(true);

            // Gửi API tạo comment. (Backend sẽ tự động broadcast qua socket)
            await courseService.createComment(currentPostId, commentInput, replyingTo?.id);

            setCommentInput("");
            setReplyingTo(null);
            setShowComments(true);


        } catch (error) {
            console.error("Lỗi khi gửi bình luận:", error);
            toast.error("Lỗi khi gửi bình luận");
        } finally {
            setLoading(false);
        }
    };

    // Xây dựng cây bình luận (Nesting Tree) an toàn
    const commentTree = useMemo(() => {
        const map = new Map();
        const roots: any[] = [];

        const safeComments = Array.isArray(localComments) ? localComments : [];

        safeComments.forEach((c) => {
            const cId = c.commentId || c.id;
            if (cId) map.set(cId, { ...c, replies: [] });
        });

        safeComments.forEach((c) => {
            const cId = c.commentId || c.id;
            const pId = c.parentId || c.parentCommentId; // Bắt 2 trường hợp tên biến backend
            const node = map.get(cId);

            if (node) {
                if (pId && map.has(pId)) {
                    map.get(pId).replies.push(node);
                } else {
                    roots.push(node);
                }
            }
        });

        return roots;
    }, [localComments]);

    // Hàm đệ quy render Comment
    const renderComment = (cmt: any, isChild = false) => {
        const cmtDisplayName = cmt.fullName || cmt.username || "Ẩn danh";
        const replies = cmt.replies || [];
        const currentId = cmt.commentId || cmt.id;

        return (
            <div key={currentId} className={`flex gap-3 ${isChild ? "mt-3 border-l-2 border-emerald-100 pl-3" : "mt-4"}`}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white overflow-hidden relative">
                    {cmt.avatarUrl && cmt.avatarUrl.trim() !== "" ? (
                        <img src={cmt.avatarUrl} alt="avatar" className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                        getInitial(cmtDisplayName)
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                        <p className="text-sm font-semibold text-slate-900">{cmtDisplayName}</p>
                        <p className="text-xs text-slate-500">
                            {new Date(cmt.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                    </div>
                    <p className="mt-0.5 whitespace-pre-line text-sm text-slate-700">{cmt.content}</p>

                    <button
                        onClick={() => setReplyingTo({ id: currentId, name: cmtDisplayName })}
                        className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 transition-colors mt-1"
                    >
                        Phản hồi
                    </button>

                    {replies.length > 0 && (
                        <div className="mt-2 space-y-2">
                            {replies.map((reply: any) => renderComment(reply, true))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-4 hover:shadow-md transition overflow-hidden">
            {/* NỘI DUNG BÀI ĐĂNG */}
            <div className="p-4 md:p-5">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full overflow-hidden bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm md:text-base relative">
                        {avatarUrl && avatarUrl.trim() !== "" ? (
                            <img
                                src={avatarUrl}
                                alt="avatar"
                                className="w-full h-full object-cover absolute inset-0"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        ) : getInitial(fullName)}
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

            {/* KHU VỰC BÌNH LUẬN */}
            <div className="p-4 bg-gray-50">
                {localComments.length > 0 && (
                    <div
                        className="text-sm text-emerald-600 font-medium cursor-pointer hover:underline mb-4 flex items-center gap-1"
                        onClick={() => setShowComments(!showComments)}
                    >
                        <MessageSquare className="w-4 h-4" />
                        {showComments ? "Ẩn nhận xét lớp học" : `${localComments.length} nhận xét của lớp học`}
                    </div>
                )}

                {showComments && (
                    <div className="space-y-2 mb-4">
                        {commentTree.map((cmt: any) => renderComment(cmt, false))}
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    {replyingTo && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-lg w-fit ml-11 transition-all">
                            <span>Đang phản hồi <strong>{replyingTo.name}</strong></span>
                            <button onClick={() => setReplyingTo(null)} className="hover:text-rose-600 transition-colors">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-600 text-xs font-semibold text-white">
                            {avatarUrlMe && avatarUrlMe.trim() !== "" ? (
                                <img
                                    src={avatarUrlMe}
                                    alt="avatar"
                                    className="absolute inset-0 h-full w-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : getInitial(user?.fullName)}
                        </div>
                        <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                            <input
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(); }}
                                disabled={loading}
                                placeholder={replyingTo ? "Nhập phản hồi..." : "Thêm nhận xét cho lớp học..."}
                                className="flex-1 bg-transparent text-sm focus:outline-none py-1"
                            />
                            {commentInput.trim() && (
                                <button
                                    onClick={handleAddComment}
                                    disabled={loading}
                                    className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-full transition-colors ml-1"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
const ClassroomContent = () => {
    const { user: reduxUser } = useAppSelector((state: any) => state.auth);
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

    const [postPage, setPostPage] = useState(0);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const POST_SIZE = 10;

    const fetchData = async () => {
        if (!offeringId) return;
        try {
            setLoading(true);
            setPostPage(0);

            const [courseData, topicsData, assignmentsData, postsPageData] = await Promise.all([
                courseService.getCourseById(offeringId),
                courseService.getTopicsByOfferingId(offeringId),
                assessmentService.getAssessmentsByOffering(offeringId),
                postService.getPostsByOffering(offeringId, 0, POST_SIZE).catch(() => ({ content: [], last: true }))
            ]);

            setCourse(courseData);
            const rawPosts = postsPageData.content ? postsPageData.content : postsPageData;
            setHasMorePosts(rawPosts.length === POST_SIZE);

            const formattedAssignments = (assignmentsData || []).map((a: any) => ({
                ...a,
                feedType: 'ASSIGNMENT',
                sortTime: new Date(a.createdAt || a.endTime || new Date()).getTime()
            }));

            const formattedTopics = (topicsData || []).map((p: any) => ({
                ...p,
                feedType: 'POST',
                sortTime: new Date(p.createdAt).getTime()
            }));

            const formattedAnnouncements = (rawPosts || []).map((ann: any) => ({
                ...ann,
                feedType: 'ANNOUNCEMENT',
                sortTime: new Date(ann.createdAt).getTime()
            }));

            const combinedFeed = [...formattedAssignments, ...formattedTopics, ...formattedAnnouncements]
                .sort((a, b) => b.sortTime - a.sortTime);

            setFeed(combinedFeed);
        } catch (error) {
            console.error("Lỗi tải dữ liệu trang:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMorePosts = async () => {
        if (!hasMorePosts || !offeringId) return;
        try {
            const nextPage = postPage + 1;
            const postsPageData = await postService.getPostsByOffering(offeringId, nextPage, POST_SIZE);
            const rawPosts = postsPageData.content ? postsPageData.content : postsPageData;

            if (rawPosts.length > 0) {
                const formattedAnnouncements = rawPosts.map((ann: any) => ({
                    ...ann,
                    feedType: 'ANNOUNCEMENT',
                    sortTime: new Date(ann.createdAt).getTime()
                }));

                setFeed(prevFeed => {
                    const updatedFeed = [...prevFeed, ...formattedAnnouncements];
                    return updatedFeed.sort((a, b) => b.sortTime - a.sortTime);
                });
                setPostPage(nextPage);
            }
            setHasMorePosts(rawPosts.length === POST_SIZE);
        } catch (error) {
            console.error("Lỗi tải thêm bài viết:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [offeringId, refreshKey]);

    // useEffect(() => {
    //     if (!user || !user.userId) return;
    //
    //     const token = localStorage.getItem("token");
    //     const wsUrl = import.meta.env.VITE_WS_URL_NOTICATION || import.meta.env.VITE_WS_URL || "http://localhost:8080";
    //     const socket = new SockJS(`${wsUrl}/ws-notifications?token=${token}`);
    //     const stompClient = Stomp.over(socket);
    //     stompClient.debug = () => {};
    //
    //     stompClient.connect({ Authorization: `Bearer ${token}` }, () => {
    //         stompClient.subscribe(`/topic/user/${user.userId}`, (payload) => {
    //             const notification = JSON.parse(payload.body);
    //             if (toast) {
    //                 toast.info(notification.message);
    //             } else {
    //                 alert(notification.message);
    //             }
    //             fetchData();
    //         });
    //     }, (error: any) => {
    //         console.error("Lỗi kết nối WebSocket Notification:", error);
    //     });
    //
    //     return () => {
    //         if (stompClient.connected) {
    //             stompClient.disconnect(() => {
    //                 console.log("Đã ngắt kết nối WebSocket Notification");
    //             });
    //         }
    //     };
    // }, [user, offeringId]);

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
                            title={`${course?.course?.courseName || "Lớp Học"}${
                                course ? ` - ${course.semester} (${course.year})` : ""
                            }`}
                            description={`Giảng viên: ${
                                course?.lecturers?.map((l: any) => l.lecturerName).join(", ") || ""
                            } - Mã lớp: ${offeringId}`}
                        />

                        <CreatePostBox onPostSuccess={fetchData} fullName={user.fullName} avatarUrl={user.avatarUrl} />

                        {/*<div className="hidden md:block mb-4">*/}
                        {/*    <UpcomingBox />*/}
                        {/*</div>*/}

                        <div className="space-y-4">
                            {feed.length === 0 ? (
                                <div className="text-center text-gray-500 mt-8 text-sm md:text-base">
                                    Chưa có thông báo và bài tập nào.
                                </div>
                            ) : (
                                <>
                                    {feed.map((item: any, idx: number) => {
                                        if (item.feedType === 'ASSIGNMENT') {
                                            return <AssignmentPost key={`assign-${item.assessmentId || idx}`} {...item} lecturerName={course?.lecturerName} />;
                                        }
                                        if (item.feedType === 'ANNOUNCEMENT') {
                                            return <AnnouncementPost key={`ann-${item.id || idx}`} {...item} lecturerName={course?.lecturerName} />;
                                        }
                                        return <Post key={`post-${item.postId || idx}`} {...item} avatarUrlMe={user?.avatarUrl} />;
                                    })}

                                    {hasMorePosts && (
                                        <div className="flex justify-center mt-6">
                                            <button
                                                onClick={loadMorePosts}
                                                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-full shadow-sm hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                                            >
                                                Tải thêm bài đăng cũ...
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassroomContent;