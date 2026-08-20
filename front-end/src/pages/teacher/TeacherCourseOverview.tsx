import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  ClipboardList,
  Clock,
  Download,
  FileText,
  MessageSquare,
  Pencil,
  Send,
  Trash2,
  UploadCloud,
  Users,
  X,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import SockJS from "sockjs-client";

import { Client } from "@stomp/stompjs";

import type { SyllabusFile, PostResponse } from "@/api/type.ts";
import postService from "@/api/postService.ts";
import courseService from "@/pages/admin/api/courseService.ts";
import { courseService as studentCourseService } from "@/features/course/courseApi.ts";
import type { TeacherCourseItem } from "./teacherCourseData";
import { useAppSelector } from "@/hooks/useAppSelector";

type TopicPost = {
  postId: string;
  content: string;
  createdAt: string;
  fullName?: string;
  username?: string;
  avatarUrl?: string;
  comments?: any[];
};

type FeedItem =
    | {
  id: string;
  type: "material";
  createdAt: string;
  title: string;
  content: string;
  authorName?: string;
  files: SyllabusFile[];
  raw: PostResponse;
}
    | {
  id: string;
  type: "post";
  createdAt: string;
  content: string;
  authorName: string;
  avatarUrl?: string;
  comments?: any[];
  raw: TopicPost;
};

function getInitial(name?: string) {
  if (!name) return "U";
  const words = name.trim().split(" ");
  const lastName = words[words.length - 1];
  return lastName.charAt(0).toUpperCase();
}

function TeacherCreatePostBox({
                                onPostSuccess,
                                fullName,
                                avatarUrl,
                              }: {
  onPostSuccess: () => Promise<void> | void;
  fullName?: string;
  avatarUrl?: string;
}) {
  const { id } = useParams<{ id: string }>();
  const offeringId = id || "";
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim() || !offeringId) {
      return;
    }

    try {
      setIsPosting(true);
      await studentCourseService.createTopic(offeringId, content, "NORMAL");
      setContent("");
      await onPostSuccess();
      toast.success("Đã đăng bài thành công.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể đăng bài. Vui lòng thử lại.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-600 text-sm font-semibold text-white">
            {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
                getInitial(fullName)
            )}
          </div>
          <input
              value={content}
              onChange={(event) => setContent(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handlePost();
                }
              }}
              disabled={isPosting}
              placeholder="Thông báo gì đó cho lớp..."
              className="flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 outline-none ring-0 transition focus:bg-white focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        {content.trim() ? (
            <div className="mt-3 flex justify-end">
              <button
                  type="button"
                  onClick={handlePost}
                  disabled={isPosting}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {isPosting ? "Đang đăng..." : "Đăng bài"}
              </button>
            </div>
        ) : null}
      </div>
  );
}

function MaterialCard({
                        item,
                        onEdit,
                        onDelete,
                        onPreview,
                      }: {
  item: Extract<FeedItem, { type: "material" }>;
  onEdit: (post: PostResponse) => void;
  onDelete: (postId: string) => void;
  onPreview: (file: SyllabusFile) => void;
}) {
  return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">{item.title}</h4>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span>{item.authorName || "Giảng viên"}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
              </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
                type="button"
                onClick={() => onEdit(item.raw)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                title="Sửa bài đăng"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => onDelete(item.raw.id)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                title="Xóa bài đăng"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-4">
          {item.content ? <p className="text-sm leading-6 text-slate-600">{item.content}</p> : null}

          {item.files.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {item.files.map((file) => (
                    <div
                        key={file.id}
                        onClick={() => onPreview(file)}
                        className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-300 hover:bg-white"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-700">{file.fileName}</p>
                        <p className="mt-1 text-xs text-slate-500">Nhấn để xem trước</p>
                      </div>
                      <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="rounded-full border border-slate-200 bg-white p-2 text-slate-400 transition hover:border-emerald-300 hover:text-emerald-600"
                          title="Tải xuống"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                ))}
              </div>
          ) : null}
        </div>
      </div>
  );
}


function TopicCard({ item, currentUserAvatar, currentUserName, refreshKey }: { item: Extract<FeedItem, { type: "post" }>; currentUserAvatar?: string; currentUserName?: string; refreshKey: number }) {
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [localComments, setLocalComments] = useState<any[]>(item.comments || []);


  const [replyingTo, setReplyingTo] = useState<{id: string, name: string} | null>(null);
  const stompClientRef = useRef<any>(null);

    const fetchComments = async () => {
        try {
            const data = await studentCourseService.getCommentsByPostId(
                item.raw.postId
            );

            setLocalComments((prev) => {
                const map = new Map<string, any>();

                // Comment từ API
                data.forEach((comment: any) => {
                    const key = comment.commentId || comment.id;
                    if (key) {
                        map.set(key, comment);
                    }
                });


                prev.forEach((comment: any) => {
                    const key = comment.commentId || comment.id;

                    if (key && !map.has(key)) {
                        map.set(key, comment);
                    }
                });

                return Array.from(map.values());
            });

        } catch (error) {
            console.error("Lỗi lấy comment:", error);
        }
    };

  useEffect(() => {
    console.log(" WebSocket effect chạy");
    console.log("postId:", item?.raw?.postId);

    if (!item?.raw?.postId) {
      console.log(" Không có postId");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      console.log(" Không có token");
      return;
    }

    const wsUrl =
        import.meta.env.VITE_WS_URL_COURSE ||
        import.meta.env.VITE_WS_URL ||
        "http://localhost:8080";

    console.log(" WS URL:", wsUrl);
    console.log(" Post ID:", item.raw.postId);

    const stompClient = new Client({
      webSocketFactory: () => {
        console.log("🔌 Tạo SockJS connection...");

        return new SockJS(
            `${wsUrl}/ws?token=${token}`
        );
      },

      reconnectDelay: 5000,

      debug: (str) => {
        console.log("[STOMP]", str);
      },

      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      onConnect: () => {
        console.log(
            `ĐÃ KẾT NỐI COMMENT: ${item.raw.postId} ===`
        );

        stompClient.subscribe(
            `/topic/posts/${item.raw.postId}/comments`,
            (payload) => {
              console.log(
                  " Nhận comment:",
                  payload.body
              );

              try {
                const newComment = JSON.parse(payload.body);

                  setLocalComments((prev) => {
                      const map = new Map<string, any>();

                      [...prev, newComment].forEach((comment) => {
                          const key = comment.commentId || comment.id;

                          if (key) {
                              map.set(key, comment);
                          }
                      });

                      const next = Array.from(map.values());

                      console.log(" localComments SAU KHI WS:", next);

                      return next;
                  });
              } catch (error) {
                console.error(
                    " Parse comment lỗi:",
                    error
                );
              }
            }
        );
      },

      onStompError: (frame) => {
        console.error(
            " STOMP ERROR:",
            frame.headers["message"],
            frame.body
        );
      },

      onWebSocketError: (error) => {
        console.error(
            "WEBSOCKET ERROR:",
            error
        );
      },

      onWebSocketClose: () => {
        console.log(
            " WebSocket đã đóng"
        );
      },
    });

    stompClientRef.current = stompClient;

    console.log(" activate WebSocket...");

    stompClient.activate();

    return () => {
      console.log(
          `🔌 Cleanup WebSocket: ${item.raw.postId}`
      );

      stompClient.deactivate();
    };
  }, [item?.raw?.postId]);
    useEffect(() => {
        fetchComments();
    }, [item.raw.postId]);

  const handleAddComment = async () => {
    if (!commentInput.trim() || !item.raw.postId) return;
    try {
      setLoading(true);

      await studentCourseService.createComment(item.raw.postId, commentInput,replyingTo?.id);

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


  // Xây dựng cây phân cấp (Nesting Tree) cho Comments

  const commentTree = useMemo(() => {
    const map = new Map();
    const roots: any[] = [];

    // 1. Ánh xạ các comment với mảng `replies` rỗng hoặc có sẵn
    localComments.forEach((c) => {
      map.set(c.commentId || c.id, { ...c, replies: c.replies || c.childComments || c.children || [] });
    });

    // 2. Nhúng comment con vào comment cha (dựa theo parentId)
    localComments.forEach((c) => {
      const node = map.get(c.commentId || c.id);
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId).replies.push(node);
      } else {
        roots.push(node); // Nếu không có cha thì nó là gốc
      }
    });

    return roots;
  }, [localComments]);

  // Hàm render đệ quy (Recursive Render)
  const renderComment = (cmt: any, isChild = false) => {
    const cmtDisplayName = cmt.fullName || cmt.username || "Ẩn danh";
    console.log(cmt.fullName);
    const replies = cmt.replies || [];

    return (
        <div key={cmt.commentId || cmt.id} className={`flex gap-3 ${isChild ? "mt-3 border-l-2 border-emerald-100 pl-3" : "mt-4"}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white overflow-hidden relative">
            {cmt.avatarUrl ? (
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

            {/* Nút Phản hồi */}
            <button
                onClick={() => setReplyingTo({ id: cmt.commentId || cmt.id, name: cmtDisplayName })}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 transition-colors mt-1"
            >
              Phản hồi
            </button>

            {/* Render đệ quy các comment cấp con */}
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
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
        <div className="p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-600 text-sm font-semibold text-white">
              {item.avatarUrl ? (
                  <img src={item.avatarUrl} alt="avatar" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                  getInitial(item.authorName)
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{item.authorName}</p>
              <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString("vi-VN")}</p>
            </div>
          </div>
          <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{item.content}</p>
        </div>

        <div className="border-t border-slate-100" />

        {/* KHU VỰC BÌNH LUẬN */}
        <div className="bg-slate-50 p-4">
          {localComments.length > 0 && (
              <div
                  className="mb-4 flex cursor-pointer items-center gap-1 text-sm font-medium text-emerald-600 hover:underline"
                  onClick={() => setShowComments(!showComments)}
              >
                <MessageSquare className="h-4 w-4" />
                {showComments ? "Ẩn bình luận" : `${localComments.length} bình luận`}
              </div>
          )}

          {showComments && (
              <div className="mb-4 space-y-2">
                {commentTree.map((cmt: any) => renderComment(cmt, false))}
              </div>
          )}

          {/* Form nhập bình luận */}
          <div className="flex flex-col gap-2">
            {/* Box báo hiệu đang Reply ai đó */}
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
                {currentUserAvatar ? (
                    <img src={currentUserAvatar} alt="avatar" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                    getInitial(currentUserName)
                )}
              </div>
              <div className="flex flex-1 items-center rounded-full border border-slate-200 bg-white px-4 py-1.5 transition-all focus-within:ring-2 focus-within:ring-emerald-500">
                <input
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddComment();
                    }}
                    disabled={loading}
                    placeholder={replyingTo ? "Nhập phản hồi..." : "Thêm bình luận..."}
                    className="flex-1 bg-transparent py-1 text-sm outline-none"
                />
                {commentInput.trim() && (
                    <button
                        onClick={handleAddComment}
                        disabled={loading}
                        className="ml-1 rounded-full p-1.5 text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default function TeacherCourseOverview() {
  const { id } = useParams<{ id: string }>();
  const [courses, setCourses] = useState<TeacherCourseItem[]>([]);
  const [materialPosts, setMaterialPosts] = useState<PostResponse[]>([]);
  const [topicPosts, setTopicPosts] = useState<TopicPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Thêm trigger state để reload Comment trong TopicCard
  const [refreshKey, setRefreshKey] = useState(0);

  // User state lấy từ Redux (cho Socket & Avatar)
  const { user: reduxUser } = useAppSelector((state) => state.auth);
  const currentUser = reduxUser || JSON.parse(localStorage.getItem("user") || "{}");

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingPost, setEditingPost] = useState<PostResponse | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [existingFiles, setExistingFiles] = useState<SyllabusFile[]>([]);
  const [newSelectedFiles, setNewSelectedFiles] = useState<File[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const [previewFile, setPreviewFile] = useState<SyllabusFile | null>(null);

  const fetchCourses = async () => {
    try {
      const data = await courseService.getLecturerDashBoardCourses();
      setCourses(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadFeed = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const [materials, topics] = await Promise.all([
        postService.getPostsByOffering(id),
        studentCourseService.getTopicsByOfferingId(id),
      ]);

      const rawPosts = materials.content ? materials.content : materials;
      setMaterialPosts(rawPosts || []);
      setTopicPosts(topics || []);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải bài đăng và tài liệu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    loadFeed();
  }, [id]);


  // TÍCH HỢP WEBSOCKET REAL-TIME


  // useEffect(() => {
  //   if (!currentUser?.userId || !id) return;
  //
  //   const token = localStorage.getItem("token");
  //   if (!token) return;
  //
  //   const wsUrl =
  //       import.meta.env.VITE_WS_URL_NOTICATION ||
  //       "http://localhost:8080";
  //
  //   const stompClient = new Client({
  //     webSocketFactory: () =>
  //         new SockJS(`${wsUrl}/ws-notifications?token=${token}`),
  //
  //     // Tự động kết nối lại sau 5 giây
  //     reconnectDelay: 5000,
  //
  //     // Tắt log STOMP
  //     debug: () => {},
  //
  //     // Header gửi khi STOMP CONNECT
  //     connectHeaders: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //
  //     onConnect: () => {
  //       console.log(
  //           `WebSocket Notification connected: ${currentUser.userId}`
  //       );
  //
  //       stompClient.subscribe(
  //           `/topic/user/${currentUser.userId}`,
  //           (payload) => {
  //             try {
  //               const notification = JSON.parse(payload.body);
  //
  //               if (toast) {
  //                 toast.info(
  //                     notification.message ||
  //                     "Bạn có thông báo mới"
  //                 );
  //               }
  //
  //               loadFeed();
  //               setRefreshKey((prev) => prev + 1);
  //
  //             } catch (error) {
  //               console.error(
  //                   " Lỗi parse notification:",
  //                   error
  //               );
  //             }
  //           }
  //       );
  //     },
  //
  //     onStompError: (frame) => {
  //       console.error(
  //           " STOMP Error:",
  //           frame.headers["message"],
  //           frame.body
  //       );
  //     },
  //
  //     onWebSocketError: (error) => {
  //       console.error(
  //           " WebSocket Error:",
  //           error
  //       );
  //     },
  //
  //     onWebSocketClose: () => {
  //       console.log(
  //           " WebSocket Notification đã đóng"
  //       );
  //     },
  //   });
  //
  //   // Bắt đầu WebSocket
  //   stompClient.activate();
  //
  //   return () => {
  //     console.log(
  //         `Đóng WebSocket Notification: ${currentUser.userId}`
  //     );
  //
  //     stompClient.deactivate();
  //   };
  // }, [currentUser, id]);

  const course = courses.find((item) => item.offeringId === id);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveSelectedFile = (indexToRemove: number) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUploadAndPost = async () => {
    if (!uploadTitle.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài đăng.");
      return;
    }
    if (selectedFiles.length === 0 || !id) {
      toast.error("Vui lòng chọn ít nhất 1 tài liệu.");
      return;
    }

    setIsUploading(true);
    try {
      const uploadedFiles = await courseService.uploadSyllabus(id, selectedFiles);
      const uploadedFileIds = uploadedFiles.map((file: any) => file.id);

      await postService.createPost({
        offeringId: id,
        title: uploadTitle,
        content: uploadMessage,
        fileIds: uploadedFileIds,
      });

      setIsUploadModalOpen(false);
      setUploadTitle("");
      setUploadMessage("");
      setSelectedFiles([]);
      await loadFeed();
      toast.success("Đã đăng tài liệu thành công.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể đăng tài liệu. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài đăng tài liệu này không?")) {
      return;
    }

    try {
      await postService.deletePostSyllabusFile(postId);
      await loadFeed();
      toast.success("Đã xóa bài đăng tài liệu.");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xóa bài đăng.");
    }
  };

  const openEditModal = (post: PostResponse) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.content || "");
    setExistingFiles(post.files || []);
    setNewSelectedFiles([]);
  };

  const handleEditFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setNewSelectedFiles((prev) => [...prev, ...filesArray]);
    }
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const handleRemoveExistingFile = (fileId: string) => {
    setExistingFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleRemoveNewSelectedFile = (indexToRemove: number) => {
    setNewSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUpdatePost = async () => {
    if (!editingPost || !editTitle.trim() || !id) {
      toast.error("Vui lòng nhập tiêu đề bài đăng.");
      return;
    }

    setIsUpdating(true);
    try {
      let newUploadedFileIds: string[] = [];

      if (newSelectedFiles.length > 0) {
        const uploadedFiles = await courseService.uploadSyllabus(id, newSelectedFiles);
        newUploadedFileIds = uploadedFiles.map((file: any) => file.id);
      }

      const existingFileIds = existingFiles.map((file) => file.id);

      await postService.updatePostSyllabusFile(editingPost.id, {
        offeringId: id,
        title: editTitle,
        content: editContent,
        fileIds: [...existingFileIds, ...newUploadedFileIds],
      });

      setEditingPost(null);
      await loadFeed();
      toast.success("Đã cập nhật bài đăng tài liệu.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể cập nhật bài đăng.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getPreviewUrl = (url: string, fileName: string) => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith(".pdf") || lowerName.match(/\.(jpeg|jpg|gif|png)$/)) {
      return url;
    }
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  const stats = [
    { label: "Sinh viên", value: course?.studentCount || 0, icon: Users },
    { label: "Rubric", value: course?.rubricCount || 0, icon: FileText },
    { label: "Bài tập", value: course?.assignmentCount || 0, icon: ClipboardList },
    { label: "OBE", value: `${course?.obeProgress || 0}%`, icon: BookOpen },
  ];

  const feedItems: FeedItem[] = useMemo(() => {
    const materialItems: FeedItem[] = materialPosts.map((post) => ({
      id: `material-${post.id}`,
      type: "material",
      createdAt: post.createdAt,
      title: post.title,
      content: post.content || "",
      authorName: post.authorName,
      files: post.files || [],
      raw: post,
    }));

    const topicItems: FeedItem[] = topicPosts.map((post) => ({
      id: `post-${post.postId}`,
      type: "post",
      createdAt: post.createdAt,
      content: post.content,
      authorName: post.fullName || post.username || "Giảng viên",
      avatarUrl: post.avatarUrl,
      comments: post.comments,
      raw: post,
    }));

    return [...materialItems, ...topicItems].sort(
        (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    );
  }, [materialPosts, topicPosts]);

  return (
      <div className="relative space-y-6">
        {/* ... STATS DASHBOARD ... */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="mt-2 text-3xl font-black text-slate-900">{item.value}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                    <item.icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
          ))}
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  <MessageSquare className="h-5 w-5 text-emerald-600" />
                  Tài liệu & Bài đăng ({feedItems.length})
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  Đăng thông báo nhanh như giao diện sinh viên và đăng tài liệu ngay trong cùng một khu vực.
                </p>
              </div>

              <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
              >
                <UploadCloud className="h-4 w-4" />
                Đăng tài liệu
              </button>
            </div>

            <TeacherCreatePostBox onPostSuccess={loadFeed} fullName={currentUser?.fullName || course?.lecturerName} avatarUrl={currentUser?.avatarUrl} />
          </div>

          <div className="space-y-4">
            {isLoading ? (
                <div className="py-10 text-center text-sm text-slate-500">Đang tải dữ liệu...</div>
            ) : feedItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  Chưa có bài đăng hoặc tài liệu nào.
                </div>
            ) : (
                feedItems.map((item) =>
                    item.type === "material" ? (
                        <MaterialCard
                            key={item.id}
                            item={item}
                            onEdit={openEditModal}
                            onDelete={handleDeletePost}
                            onPreview={setPreviewFile}
                        />
                    ) : (
                        <TopicCard
                            key={item.id}
                            item={item}
                            currentUserAvatar={currentUser?.avatarUrl}
                            currentUserName={currentUser?.fullName}

                            refreshKey={refreshKey}
                        />
                    ),
                )
            )}
          </div>
        </div>

        {/* ... MODAL EDIT, UPLOAD VÀ PREVIEW FILE ... */}
        {editingPost ? (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                  <h3 className="flex items-center gap-2 font-bold text-slate-900">
                    <Pencil className="h-4 w-4 text-emerald-600" />
                    Sửa bài đăng tài liệu
                  </h3>
                  <button type="button" onClick={() => setEditingPost(null)} className="text-slate-400 hover:text-rose-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Tiêu đề bài đăng</label>
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Nội dung</label>
                    <textarea
                        rows={3}
                        value={editContent}
                        onChange={(event) => setEditContent(event.target.value)}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Tài liệu</label>
                    <div
                        onClick={() => editFileInputRef.current?.click()}
                        className="cursor-pointer rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/60 p-4 text-center text-sm text-emerald-700 transition hover:bg-emerald-50"
                    >
                      Nhấn để đính kèm thêm file
                      <input
                          ref={editFileInputRef}
                          type="file"
                          onChange={handleEditFileSelect}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.jpg,.png"
                          multiple
                      />
                    </div>

                    <div className="mt-3 space-y-2">
                      {existingFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
                            <span className="truncate text-sm text-slate-700">{file.fileName}</span>
                            <button type="button" onClick={() => handleRemoveExistingFile(file.id)} className="text-slate-400 hover:text-rose-500">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                      ))}
                      {newSelectedFiles.map((file, index) => (
                          <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                            <span className="truncate text-sm text-emerald-800">{file.name}</span>
                            <button type="button" onClick={() => handleRemoveNewSelectedFile(index)} className="text-emerald-600 hover:text-rose-500">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                  <button
                      type="button"
                      onClick={() => setEditingPost(null)}
                      className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-100"
                  >
                    Hủy
                  </button>
                  <button
                      type="button"
                      onClick={handleUpdatePost}
                      disabled={isUpdating}
                      className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            </div>
        ) : null}

        {isUploadModalOpen ? (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
              <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <UploadCloud className="h-5 w-5 text-emerald-600" />
                    Đăng tài liệu mới
                  </h3>
                  <button type="button" onClick={() => !isUploading && setIsUploadModalOpen(false)} className="text-slate-400 hover:text-rose-500">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-5 p-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Tiêu đề bài đăng</label>
                    <input
                        type="text"
                        placeholder="Nhập tiêu đề tài liệu"
                        value={uploadTitle}
                        onChange={(event) => setUploadTitle(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Nội dung</label>
                    <textarea
                        rows={3}
                        placeholder="Thêm mô tả ngắn cho tài liệu"
                        value={uploadMessage}
                        onChange={(event) => setUploadMessage(event.target.value)}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Tài liệu đính kèm</label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/60 p-6 text-center text-sm text-emerald-700 transition hover:bg-emerald-50"
                    >
                      Nhấn để chọn file từ máy tính
                      <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileSelect}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.jpg,.png"
                          multiple
                      />
                    </div>

                    {selectedFiles.length > 0 ? (
                        <div className="mt-4 space-y-2">
                          {selectedFiles.map((file, index) => (
                              <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
                                <span className="truncate text-sm text-slate-700">{file.name}</span>
                                <button type="button" onClick={() => handleRemoveSelectedFile(index)} className="text-slate-400 hover:text-rose-500">
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                          ))}
                        </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                  <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(false)}
                      disabled={isUploading}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Hủy
                  </button>
                  <button
                      type="button"
                      onClick={handleUploadAndPost}
                      disabled={isUploading || selectedFiles.length === 0}
                      className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {isUploading ? "Đang xử lý..." : "Đăng tài liệu"}
                  </button>
                </div>
              </div>
            </div>
        ) : null}

        {previewFile ? (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                  <div>
                    <h3 className="font-bold text-slate-900">{previewFile.fileName}</h3>
                    <p className="text-xs text-slate-500">Chế độ xem trước tài liệu</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                        href={previewFile.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      <Download className="h-4 w-4" />
                      Tải về
                    </a>
                    <button type="button" onClick={() => setPreviewFile(null)} className="text-slate-400 hover:text-rose-500">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="h-full w-full bg-slate-100/60">
                  {previewFile.fileName.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/) ? (
                      <div className="flex h-full w-full items-center justify-center p-6">
                        <img
                            src={previewFile.fileUrl}
                            alt={previewFile.fileName}
                            className="max-h-full max-w-full rounded border border-slate-200 bg-white object-contain shadow-sm"
                        />
                      </div>
                  ) : (
                      <iframe
                          src={getPreviewUrl(previewFile.fileUrl, previewFile.fileName)}
                          className="h-full w-full border-none"
                          title="Document Preview"
                      />
                  )}
                </div>
              </div>
            </div>
        ) : null}
      </div>
  );
}