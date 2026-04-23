import React, { useEffect, useState } from "react";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";
import { useParams } from "react-router-dom";
import { courseService } from "@/features/course/courseApi";

const AssignmentDetail = () => {
    const { assignmentId } = useParams();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [file, setFile] = useState<File | null>(null);
    const [link, setLink] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // ================= FETCH =================
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!assignmentId) return;

                const res = await courseService.getAssessmentDetail(assignmentId);
                setData(res);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [assignmentId]);

    // ================= CLEANUP =================
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, []);

    // ================= FILE CHANGE =================
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // clear old preview
            if (previewUrl) URL.revokeObjectURL(previewUrl);

            const url = URL.createObjectURL(selectedFile);

            setFile(selectedFile);
            setPreviewUrl(url);

            // allow re-select same file
            e.target.value = "";
        }
    };

    // ================= REMOVE FILE =================
    const handleRemoveFile = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFile(null);
        setPreviewUrl(null);
    };

    // ================= SUBMIT =================
    const handleSubmit = async () => {
        try {
            if (!assignmentId) return;

            const formData = new FormData();
            console.log(file)
            if (file) formData.append("file", file);
            if (link) formData.append("link", link);

            await courseService.submitAssignment(assignmentId, formData);

            alert("Nộp bài thành công!");

        } catch (err) {
            console.error(err);
            alert("Upload thất bại");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!data) return <p>Không có dữ liệu</p>;

    const closArray = Object.entries(data.clos || {}).map(
        ([code, name]) => ({ code, name })
    );

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />

            <div className="flex">
                <Sidebar />

                <div className="flex-1 p-4 lg:p-6">
                    <div className="max-w-3xl mx-auto">

                        {/* Banner */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl p-6 mb-6 shadow-sm">
                            <h2 className="text-2xl font-semibold">
                                {data.assessmentName}
                            </h2>
                            <p className="text-sm opacity-90 mt-1">
                                Hạn nộp: {new Date(data.endTime).toLocaleString()}
                            </p>
                        </div>

                        {/* Info */}
                        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
                            <h3 className="font-semibold mb-3">Mô tả bài tập</h3>

                            <p className="text-sm whitespace-pre-line">
                                {data.description}
                            </p>

                            {/* CLO */}
                            <div className="mt-5">
                                <p className="text-sm font-medium mb-2">CLO</p>
                                <div className="flex flex-wrap gap-2">
                                    {closArray.map((clo: any, index: number) => (
                                        <span
                                            key={index}
                                            title={clo.name}
                                            className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg"
                                        >
                                            {clo.code}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Weight */}
                            <div className="mt-4 flex justify-between font-bold">
                                <span>Trọng số</span>
                                <span className="text-emerald-600">
                                    {data.weight * 100}%
                                </span>
                            </div>
                        </div>

                        {/* SUBMIT */}
                        {/*{!data.submissionId && (*/}
                            <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
                                <h3 className="font-semibold mb-4">Nộp bài</h3>

                                {/* Upload box */}
                                <div className="border-2 border-dashed rounded-xl p-6 text-center">
                                    <p className="text-sm">Kéo & thả file hoặc</p>

                                    <button
                                        className="mt-2 text-emerald-600"
                                        onClick={() =>
                                            document.getElementById("fileInput")?.click()
                                        }
                                    >
                                        Chọn file
                                    </button>

                                    <input
                                        type="file"
                                        id="fileInput"
                                        hidden
                                        onChange={handleFileChange}
                                    />
                                </div>

                                {/* LINK */}
                                <input
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="Link GitHub / Drive..."
                                    className="w-full mt-4 rounded-lg px-4 py-2 text-sm border"
                                />

                                {/* PREVIEW */}
                                {file && (
                                    <div className="mt-4">
                                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>

                                            <button
                                                onClick={handleRemoveFile}
                                                className="text-red-500 text-sm"
                                            >
                                                Xóa
                                            </button>
                                        </div>

                                        {/* IMAGE */}
                                        {file.type.startsWith("image/") && previewUrl && (
                                            <img
                                                src={previewUrl}
                                                alt="preview"
                                                className="mt-3 max-h-56 rounded-lg border"
                                            />
                                        )}

                                        {/* PDF */}
                                        {file.type === "application/pdf" && previewUrl && (
                                            <iframe
                                                src={previewUrl}
                                                className="w-full h-64 border rounded-lg mt-3"
                                            />
                                        )}

                                        {/* OTHER */}
                                        {!file.type.startsWith("image/") &&
                                            file.type !== "application/pdf" && (
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Không hỗ trợ preview file này
                                                </p>
                                            )}
                                    </div>
                                )}

                                {/* SUBMIT BTN */}
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!file && !link}
                                        className="bg-emerald-600 disabled:bg-gray-300 text-white px-5 py-2 rounded-lg"
                                    >
                                        Nộp bài
                                    </button>
                                </div>
                            </div>
                        {/*)}*/}

                        {/* SUBMITTED */}
                        {/*{data.submissionId && (*/}
                        {/*    <div className="bg-green-50 rounded-2xl p-4 mb-6">*/}
                        {/*        <p className="text-green-700 font-medium">*/}
                        {/*            ✔ Bạn đã nộp bài*/}
                        {/*        </p>*/}
                        {/*        <p className="text-sm mt-1">*/}
                        {/*            {new Date(data.submissionAt).toLocaleString()}*/}
                        {/*        </p>*/}
                        {/*    </div>*/}
                        {/*)}*/}

                        {/* RESULT */}
                        {data.calculatedScore && (
                            <div className="bg-white rounded-2xl shadow-sm p-5">
                                <h3 className="font-semibold mb-4">Kết quả</h3>

                                <div className="flex justify-between">
                                    <p>Điểm</p>
                                    <p className="text-xl font-bold text-emerald-600">
                                        {data.calculatedScore}
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <p className="text-sm font-medium">
                                        Nhận xét
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {data.lecturerComment}
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignmentDetail;