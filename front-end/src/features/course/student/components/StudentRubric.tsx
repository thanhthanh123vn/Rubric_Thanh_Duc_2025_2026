import { CheckCircle2, Edit3, Layers3, Target, Printer } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAllClo, getAllRubric } from '@/features/rubric/rubricApi';
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAppSelector.ts";
import LMSLayout from "@/app/lms-layout";
import { Button } from "@/components/ui/button";

interface Clo {
    cloCode: string;
    cloName: string;
    description: string;
    bloomLevel: string;
    courseId?: string;
}

interface RubricDTO {
    id: string;
    name: string;
    description: string;
    defaultType?: string;
}

export default function StudentRubric() {
    const [cloItems, setCloItems] = useState<Clo[]>([]);
    const [rubricTemplates, setRubricTemplates] = useState<RubricDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    const { user: reduxUser } = useAppSelector((state) => state.auth);

    let user = reduxUser;
    if (!user) {
        const localUser = localStorage.getItem("user");
        if (localUser) {
            user = JSON.parse(localUser);
        }
    }

    useEffect(() => {
        const fetchRubricData = async () => {
            try {
                setLoading(true);

                const [cloResponse, rubricResponse] = await Promise.all([
                    getAllClo(),
                    getAllRubric()
                ]);

                setCloItems(cloResponse.data);
                setRubricTemplates(rubricResponse.data);

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu CLO và Rubric:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRubricData();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <LMSLayout>
            <div className="flex flex-col p-3 md:p-5 bg-gray-50/30 min-h-screen w-full overflow-x-hidden">

                {/* TIÊU ĐỀ & NÚT IN (Tương tự CalendarPage) */}
                <div className="border-b-2 border-emerald-700 pb-2 mb-6 flex flex-wrap gap-3 justify-between items-end">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Rubric module</p>
                        <h1 className="text-lg md:text-xl font-bold text-emerald-800 uppercase tracking-tight mt-0.5">
                            Quản lý chuẩn đầu ra và Rubric
                        </h1>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrint}
                        className="gap-2 text-xs h-8 px-3 shadow-sm bg-white"
                    >
                        <Printer size={14}/> <span className="hidden sm:inline font-medium">In thông tin</span>
                    </Button>
                </div>

                {/* KHUNG NỘI DUNG CHÍNH */}
                <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">

                    {/* Cột LO Mapping */}
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-xl font-bold text-slate-900">LO mapping</h4>
                                <p className="mt-1 text-sm text-slate-500">Ánh xạ CLO với tiêu chí chấm điểm</p>
                            </div>
                            <Target className="h-5 w-5 text-emerald-600" />
                        </div>

                        <div className="mt-6 space-y-4">
                            {loading ? (
                                <div className="text-center text-slate-500 py-4">Đang tải CLO...</div>
                            ) : cloItems.length > 0 ? (
                                cloItems.map((item) => (
                                    <div key={item.cloCode} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{item.cloCode}</p>
                                                <p className="mt-1 font-semibold text-slate-900">{item.cloName}</p>
                                            </div>
                                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                {item.bloomLevel}
                                            </span>
                                        </div>
                                        <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `50%` }} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-slate-500 py-4">Chưa có dữ liệu CLO.</div>
                            )}
                        </div>
                    </div>

                    {/* Cột Rubric Builder */}
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-xl font-bold text-slate-900">Rubric Builder</h4>
                                <p className="mt-1 text-sm text-slate-500">Tạo, sửa, lưu và tái sử dụng mẫu</p>
                            </div>
                            <Layers3 className="h-5 w-5 text-cyan-600" />
                        </div>

                        <div className="mt-6 space-y-3">
                            {loading ? (
                                <div className="text-center text-slate-500 py-4">Đang tải Rubrics...</div>
                            ) : rubricTemplates.length > 0 ? (
                                rubricTemplates.map((template) => (
                                    <div
                                        key={template.id || template.name}
                                        onClick={() =>
                                            navigate(
                                                user?.role === "ADMIN"
                                                    ? `/admin/rubrics/list/${template.id}`
                                                    : `/rubric/${template.id}`
                                            )
                                        }
                                        className="rounded-2xl border border-slate-200 p-4 hover:border-emerald-200 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-slate-900">{template.name}</p>
                                                <p className="mt-1 text-sm text-slate-500 line-clamp-1">{template.description}</p>
                                            </div>
                                            {/*<button className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors">*/}
                                            {/*    <Edit3 className="h-4 w-4" />*/}
                                            {/*</button>*/}
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {template.defaultType && (
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                                    {template.defaultType}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-slate-500 py-4">Chưa có dữ liệu Rubric.</div>
                            )}
                        </div>

                        <div className="mt-4 rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
                            <p className="font-semibold text-emerald-800">Lưu ý</p>
                            <p className="mt-2 text-sm leading-6 text-emerald-700">
                                Mỗi rubric cần tổng trọng số bằng 100% và được gán CLO trước khi lưu.
                            </p>
                        </div>
                    </div>

                </div>

            </div>
        </LMSLayout>
    );
}