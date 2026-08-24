import { History, Search } from "lucide-react";
import { useState } from "react";
import RubricVersionLogPanel from "@/features/rubric/components/RubricVersionLogPanel.tsx";

export default function RubricVersionHistory() {
    const [search, setSearch] = useState("");

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <header className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                            <History className="h-4 w-4" /> Theo dõi thay đổi
                        </div>
                        <h1 className="text-2xl font-black text-slate-900">Lịch sử version rubric</h1>
                        <p className="mt-2 text-sm text-slate-600">Theo dõi các version được gửi, phê duyệt, từ chối hoặc khôi phục.</p>
                    </div>
                    <label className="relative block w-full lg:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Tìm rubric, version, người gửi..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                        />
                    </label>
                </div>
            </header>
            <RubricVersionLogPanel searchQuery={search} />
        </div>
    );
}
