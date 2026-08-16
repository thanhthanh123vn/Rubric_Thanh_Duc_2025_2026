import { useEffect, useState } from "react";
import { Download, WifiOff, X } from "lucide-react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaStatus({ visible }: { visible: boolean }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => setInstallPrompt(null);
    const handleUpdate = () => toast.info("Đã có phiên bản mới", {
      description: "Tải lại trang để cập nhật ứng dụng.",
      action: { label: "Tải lại", onClick: () => window.location.reload() },
      duration: 10000,
    });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    window.addEventListener("pwa-update-available", handleUpdate);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("pwa-update-available", handleUpdate);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  };

  if (!visible) return null;

  if (!isOnline) {
    return (
      <div className="fixed inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[100] mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl" role="status">
        <WifiOff className="h-5 w-5 shrink-0 text-amber-300" />
        <span>Bạn đang ngoại tuyến. Cần có mạng để gửi điểm danh.</span>
      </div>
    );
  }

  if (!installPrompt || dismissed) return null;

  return (
    <div className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[90] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-emerald-200 bg-white p-3 shadow-2xl" role="status">
      <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700"><Download className="h-5 w-5" /></div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900">Cài LMS Rubric</p>
        <p className="text-xs text-slate-500">Mở nhanh như ứng dụng trên điện thoại.</p>
      </div>
      <button type="button" onClick={() => void installApp()} className="min-h-11 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white">Cài đặt</button>
      <button type="button" onClick={() => setDismissed(true)} className="grid min-h-11 min-w-11 place-items-center rounded-xl text-slate-500" aria-label="Đóng"><X className="h-5 w-5" /></button>
    </div>
  );
}
