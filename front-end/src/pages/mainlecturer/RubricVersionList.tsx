import { ChevronDown, ChevronRight, Clock3, GitBranch, Pencil, Plus, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import CreateRubricModal from "@/features/rubric/components/CreateRubricModal.tsx";
import { getMyRubrics, getRubricForEdit, revertRubricHead } from "@/features/rubric/rubricApi.ts";

type Rubric = {
    id: string; name: string; description: string; criteria: unknown[];
    rubricType: "FACULTY" | "LECTURER_VARIANT";
    rootRubricId?: string | null; versionNumber: number;
    currentHead?: boolean;
    status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
};

const statusStyle = {
    APPROVED: "bg-emerald-100 text-emerald-700", PENDING: "bg-amber-100 text-amber-700",
    REJECTED: "bg-rose-100 text-rose-700", DRAFT: "bg-slate-100 text-slate-600",
};
const statusLabel = { APPROVED: "Đã duyệt", PENDING: "Chờ trưởng khoa", REJECTED: "Từ chối", DRAFT: "Bản nháp" };

export default function RubricVersionList() {
    const [rubrics, setRubrics] = useState<Rubric[]>([]);
    const [expandedRoot, setExpandedRoot] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [editRubric, setEditRubric] = useState<any | null>(null);
    const [loadingEdit, setLoadingEdit] = useState<string | null>(null);
    const [movingHead, setMovingHead] = useState<string | null>(null);

    const fetchRubrics = async () => {
        try {
            const response = await getMyRubrics();
            setRubrics(Array.isArray(response.data) ? response.data : []);
        } catch { toast.error("Không thể tải danh sách rubric"); }
    };
    useEffect(() => { void fetchRubrics(); }, []);

    const groups = useMemo(() => {
        const map = new Map<string, Rubric[]>();
        rubrics.forEach((rubric) => {
            const root = rubric.rootRubricId || rubric.id;
            map.set(root, [...(map.get(root) || []), rubric]);
        });
        return [...map.entries()].map(([rootId, versions]) => ({
            rootId, versions: versions.sort((a, b) => (b.versionNumber || 1) - (a.versionNumber || 1)),
        }));
    }, [rubrics]);

    const openEditor = async (rubricId: string) => {
        try {
            setLoadingEdit(rubricId);
            setEditRubric(await getRubricForEdit(rubricId));
        } catch { toast.error("Không thể tải rubric để chỉnh sửa"); }
        finally { setLoadingEdit(null); }
    };

    const moveHead = async (version: Rubric) => {
        if (!window.confirm(`Chuyển HEAD về v${version.versionNumber}? Các version và nhánh hiện có vẫn được giữ nguyên.`)) return;
        try {
            setMovingHead(version.id);
            await revertRubricHead(version.id);
            await fetchRubrics();
            toast.success(`Đã chuyển HEAD về v${version.versionNumber}`);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Không thể chuyển HEAD");
        } finally {
            setMovingHead(null);
        }
    };

    return (
        <div className="space-y-5">
            <header className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">Rubric Studio</p>
                    <h1 className="mt-1 text-2xl font-bold text-slate-900">Rubric và lịch sử version</h1>
                    <p className="mt-1 text-sm text-slate-500">Mỗi chỉnh sửa tạo version mới và phải được Trưởng khoa duyệt.</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"><Plus className="h-4 w-4"/>Rubric mới</button>
            </header>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {groups.length === 0 ? <div className="p-12 text-center text-sm text-slate-500">Chưa có rubric.</div> : groups.map(({ rootId, versions }, index) => {
                    const latest = versions.find((version) => version.currentHead) || versions[0];
                    const expanded = expandedRoot === rootId;
                    return <section key={rootId} className={index ? "border-t border-slate-200" : ""}>
                        <div className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50">
                            <button onClick={() => setExpandedRoot(expanded ? null : rootId)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-200">{expanded ? <ChevronDown className="h-5 w-5"/> : <ChevronRight className="h-5 w-5"/>}</button>
                            <GitBranch className="h-5 w-5 shrink-0 text-slate-400"/>
                            <button onClick={() => setExpandedRoot(expanded ? null : rootId)} className="min-w-0 flex-1 text-left">
                                <p className="truncate font-bold text-slate-900">{latest.name}</p>
                                <p className="mt-1 truncate text-xs text-slate-500">{latest.description || `${latest.criteria.length} tiêu chí`}</p>
                            </button>
                            <span className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline ${statusStyle[latest.status]}`}>{statusLabel[latest.status]}</span>
                            {(latest.status === "APPROVED" || latest.status === "REJECTED") && <button disabled={loadingEdit === latest.id} onClick={() => void openEditor(latest.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"><Pencil className="h-3.5 w-3.5"/>Chỉnh sửa</button>}
                            <span className="w-12 text-right font-mono text-sm font-bold text-slate-700">v{latest.versionNumber || 1}</span>
                        </div>
                        {expanded && <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 sm:pl-16">
                            <div className="relative space-y-1 border-l-2 border-slate-200 pl-5">
                                {versions.map((version) => <div key={version.id} className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white">
                                    <span className={`absolute -left-[27px] h-3 w-3 rounded-full border-2 border-white ring-1 ${version.currentHead ? "bg-green-600 ring-green-300" : "bg-slate-400 ring-slate-300"}`}/>
                                    <Clock3 className="h-4 w-4 shrink-0 text-slate-400"/>
                                    <Link to={`/mainlecturer/rubric/${version.id}`} className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 hover:text-green-700">{version.name}</Link>
                                    {version.currentHead
                                        ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-700">HEAD</span>
                                        : <button disabled={movingHead === version.id} onClick={() => void moveHead(version)} title="Chỉ chuyển HEAD, không xóa các nhánh version" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:border-green-300 hover:bg-green-50 hover:text-green-700 disabled:opacity-50"><RotateCcw className="h-3 w-3"/>Revert</button>}
                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyle[version.status]}`}>{statusLabel[version.status]}</span>
                                    <span className="w-12 text-right font-mono text-xs font-bold text-slate-600">v{version.versionNumber || 1}</span>
                                </div>)}
                            </div>
                        </div>}
                    </section>;
                })}
            </div>
            {showCreate && <CreateRubricModal open onClose={() => setShowCreate(false)} onSuccess={() => void fetchRubrics()}/>} 
            {editRubric && <CreateRubricModal open rubric={editRubric} onClose={() => setEditRubric(null)} onSuccess={() => void fetchRubrics()}/>} 
        </div>
    );
}
