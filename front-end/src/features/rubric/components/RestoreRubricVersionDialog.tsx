import { ArrowRight, RotateCcw, ShieldCheck } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type RestoreRubricVersionDialogProps = {
    open: boolean;
    rubricName?: string;
    sourceVersion: number;
    nextVersion: number;
    submitting?: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

export default function RestoreRubricVersionDialog({
    open,
    rubricName,
    sourceVersion,
    nextVersion,
    submitting = false,
    onOpenChange,
    onConfirm,
}: RestoreRubricVersionDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={(nextOpen) => !submitting && onOpenChange(nextOpen)}>
            <AlertDialogContent className="overflow-hidden rounded-3xl p-0 sm:max-w-md">
                <div className="bg-gradient-to-r from-emerald-700 to-green-600 px-6 py-5 text-white">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15">
                        <RotateCcw className="h-5 w-5" />
                    </div>
                    <AlertDialogHeader className="mt-4 text-left">
                        <AlertDialogTitle className="text-xl font-bold text-white">Khôi phục version trước?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm leading-6 text-emerald-50">
                            {rubricName || "Rubric"}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                </div>

                <div className="space-y-4 px-6 py-5">
                    <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                        <div className="text-center">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Nội dung từ</p>
                            <p className="mt-1 font-mono text-xl font-black text-slate-800">v{sourceVersion}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-300" />
                        <div className="text-center">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Version mới</p>
                            <p className="mt-1 font-mono text-xl font-black text-emerald-700">v{nextVersion}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-3.5 text-amber-900">
                        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                        <div>
                            <p className="text-sm font-semibold">Cần Trưởng khoa phê duyệt</p>
                            <p className="mt-1 text-xs leading-5 text-amber-800/80">
                                HEAD hiện tại vẫn được giữ nguyên. Version mới chỉ được kích hoạt sau khi được duyệt.
                            </p>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting} className="min-h-11 rounded-xl">Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={submitting}
                            onClick={(event) => {
                                event.preventDefault();
                                onConfirm();
                            }}
                            className="min-h-11 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800"
                        >
                            {submitting ? "Đang gửi..." : "Khôi phục và gửi duyệt"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
