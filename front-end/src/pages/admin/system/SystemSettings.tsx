import React, {useState, useEffect, useRef} from "react";
import {
    Settings, Shield, Bell, Palette, Globe,
    Save, Smartphone, Mail, Lock, UploadCloud, Loader2, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { settingService, type SystemSettingDTO } from "@/api/settingApi";


const Button = ({ children, className = "", variant = "primary", isLoading = false, ...props }: any) => {
    const baseStyle = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants: Record<string, string> = {
        primary: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
        outline: "border border-slate-300 bg-transparent hover:bg-slate-50 text-slate-700",
    };
    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${className} ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </button>
    );
};

// Component Switch tái sử dụng
const Switch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            checked ? "bg-emerald-500" : "bg-slate-200"
        }`}
    >
    <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
        }`}
    />
    </button>
);

export default function SystemSettings() {
    const [activeTab, setActiveTab] = useState("general");
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    // State lưu trữ cấu hình hệ thống
    const [settings, setSettings] = useState<SystemSettingDTO>({
        systemName: "",
        contactEmail: "",
        timezone: "Asia/Ho_Chi_Minh",
        twoFactorAuth: false,
        requireStrongPwd: false,
        emailNotifications: false,
        smsAlerts: false,
        theme: "light",
        logoUrl: ""
    });

    // 1. Fetch dữ liệu khi khởi tạo component
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setIsFetching(true);
                const data = await settingService.getSettings();
                if (data) {
                    setSettings(data);
                }
            } catch (error) {
                console.error("Lỗi khi tải cấu hình:", error);
                toast.error("Không thể tải dữ liệu cấu hình hệ thống");
            } finally {
                setIsFetching(false);
            }
        };
        fetchSettings();
    }, []);

    // 2. Xử lý lưu dữ liệu
    const handleSave = async () => {
        setLoading(true);
        try {
            const updatedData = await settingService.updateSettings(settings);
            setSettings(updatedData); // Cập nhật lại UI bằng dữ liệu mới nhất từ server
            toast.success("Đã lưu thay đổi cấu hình hệ thống thành công!");
        } catch (error) {
            console.error("Lỗi khi lưu:", error);
            toast.error("Lưu cấu hình thất bại. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    // Hàm toggle nhanh cho các Switch
    const handleToggle = (key: keyof SystemSettingDTO) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Xử lý file được chọn
    const processFile = (file: File) => {
        // Kiểm tra dung lượng (Tối đa 2MB = 2 * 1024 * 1024 bytes)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Kích thước ảnh tối đa là 2MB");
            return;
        }

        // Đọc file thành chuỗi Base64
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setLogoPreview(base64String); // Hiển thị trên UI
            setSettings(prev => ({ ...prev, logoUrl: base64String })); // Lưu vào state để gửi lên backend
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Cần thiết để cho phép drop
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            processFile(file);
        } else {
            toast.error("Vui lòng chỉ tải lên file hình ảnh (PNG, JPG, SVG)");
        }
    };

    const handleRemoveLogo = () => {
        setLogoPreview(null);
        setSettings(prev => ({ ...prev, logoUrl: "" }));
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    };
    const tabs = [
        { id: "general", label: "Cấu hình chung", icon: Globe },
        { id: "security", label: "Bảo mật", icon: Shield },
        { id: "notifications", label: "Thông báo", icon: Bell },
        { id: "appearance", label: "Giao diện", icon: Palette },
    ];

    if (isFetching) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-600" />
                    <p>Đang tải cấu hình hệ thống...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Cài đặt hệ thống</h1>
                        <p className="text-sm text-slate-500 mt-1">Quản lý cấu hình toàn cục của ứng dụng</p>
                    </div>

                    <Button
                        onClick={handleSave}
                        isLoading={loading}
                        className="w-full sm:w-auto shadow-sm"
                    >
                        {!loading && <Save className="w-4 h-4 mr-2" />}
                        {loading ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                </div>

                {/* Layout chính */}
                <div className="flex flex-col md:flex-row gap-6">

                    {/* Sidebar Tabs */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <nav className="flex overflow-x-auto md:flex-col gap-2 pb-2 md:pb-0 hide-scrollbar">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-4 py-3 md:py-2.5 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${
                                            isActive
                                                ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                        }`}
                                    >
                                        <Icon className={`w-5 h-5 md:w-4 md:h-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Nội dung Tab */}
                    <main className="flex-1">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">

                            {/* Tab: Cấu hình chung */}
                            {activeTab === "general" && (
                                <div className="p-5 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-4 mb-6">
                                        Thông tin cơ bản
                                    </h3>

                                    <div className="space-y-6 max-w-2xl">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Tên hệ thống</label>
                                            <input
                                                type="text"
                                                value={settings.systemName || ""}
                                                onChange={(e) => setSettings({...settings, systemName: e.target.value})}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                                placeholder="VD: Hệ thống Quản lý OBE"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-slate-400"/>
                                                Email liên hệ hỗ trợ
                                            </label>
                                            <input
                                                type="email"
                                                value={settings.contactEmail || ""}
                                                onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                                placeholder="admin@domain.com"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Múi giờ mặc định</label>
                                            <select
                                                value={settings.timezone || "Asia/Ho_Chi_Minh"}
                                                onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all appearance-none"
                                            >
                                                <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
                                                <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                                                <option value="UTC">UTC (GMT+0)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab: Bảo mật */}
                            {activeTab === "security" && (
                                <div className="p-5 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-4 mb-6">
                                        Bảo mật hệ thống
                                    </h3>

                                    <div className="space-y-6 max-w-2xl">
                                        <div className="flex items-start sm:items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                                            <div className="pr-4">
                                                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                                    <Smartphone className="w-4 h-4 text-emerald-600"/>
                                                    Xác thực hai yếu tố (2FA)
                                                </h4>
                                                <p className="text-xs text-slate-500 mt-1">Bắt buộc tất cả Giảng viên và Quản trị viên sử dụng 2FA.</p>
                                            </div>
                                            <Switch checked={Boolean(settings.twoFactorAuth)} onChange={() => handleToggle("twoFactorAuth")} />
                                        </div>

                                        <div className="flex items-start sm:items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                                            <div className="pr-4">
                                                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                                    <Lock className="w-4 h-4 text-emerald-600"/>
                                                    Mật khẩu mạnh
                                                </h4>
                                                <p className="text-xs text-slate-500 mt-1">Yêu cầu mật khẩu tối thiểu 8 ký tự, có chữ hoa, số và ký tự đặc biệt.</p>
                                            </div>
                                            <Switch checked={Boolean(settings.requireStrongPwd)} onChange={() => handleToggle("requireStrongPwd")} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab: Thông báo */}
                            {activeTab === "notifications" && (
                                <div className="p-5 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-4 mb-6">
                                        Kênh gửi thông báo
                                    </h3>

                                    <div className="space-y-6 max-w-2xl">
                                        <div className="flex items-start sm:items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                                            <div className="pr-4">
                                                <h4 className="text-sm font-semibold text-slate-800">Thông báo Email (Email Notifications)</h4>
                                                <p className="text-xs text-slate-500 mt-1">Gửi thông báo hệ thống qua email định kỳ.</p>
                                            </div>
                                            <Switch checked={Boolean(settings.emailNotifications)} onChange={() => handleToggle("emailNotifications")} />
                                        </div>

                                        <div className="flex items-start sm:items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                                            <div className="pr-4">
                                                <h4 className="text-sm font-semibold text-slate-800">Cảnh báo SMS (SMS Alerts)</h4>
                                                <p className="text-xs text-slate-500 mt-1">Gửi cảnh báo bảo mật khẩn cấp qua SMS.</p>
                                            </div>
                                            <Switch checked={Boolean(settings.smsAlerts)} onChange={() => handleToggle("smsAlerts")} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab: Giao diện */}
                            {activeTab === "appearance" && (
                                <div className="p-5 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-4 mb-6">
                                        Tùy chỉnh thương hiệu
                                    </h3>

                                    <div className="space-y-6 max-w-2xl">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Logo Hệ Thống</label>

                                            {/* Input file bị ẩn */}
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/png, image/jpeg, image/svg+xml"
                                                onChange={handleFileChange}
                                            />

                                            {/* Khu vực preview hoặc kéo thả */}
                                            {!logoPreview ? (
                                                <div
                                                    onClick={handleUploadClick}
                                                    onDragOver={handleDragOver}
                                                    onDrop={handleDrop}
                                                    className="mt-2 h-40 flex justify-center items-center rounded-xl border border-dashed border-slate-300 px-6 hover:bg-slate-50 hover:border-emerald-400 transition-colors cursor-pointer group"
                                                >
                                                    <div className="text-center">
                                                        <UploadCloud
                                                            className="mx-auto h-12 w-12 text-slate-300 group-hover:text-emerald-500 transition-colors"
                                                            aria-hidden="true"
                                                        />

                                                        <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                                                        <span className="font-semibold text-emerald-600">
                                                            Tải ảnh lên
                                                        </span>
                                                            <p className="pl-1">hoặc kéo thả vào đây</p>
                                                        </div>

                                                        <p className="text-xs leading-5 text-slate-500 mt-1">
                                                            PNG, JPG, SVG tối đa 2MB
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    className="mt-2 w-full h-40 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-4">
                                                    {/* Ảnh ở giữa */}
                                                    <div className="h-24 w-full flex items-center justify-center">
                                                        <img
                                                            src={logoPreview}
                                                            alt="Logo preview"
                                                            className="max-h-24 max-w-[80%] object-contain rounded"
                                                        />
                                                    </div>

                                                    {/* Nút nằm dưới ảnh */}
                                                    <div className="mt-3 flex justify-center gap-3">
                                                        <Button
                                                            onClick={handleUploadClick}
                                                            className="h-9 px-4 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition-all"
                                                        >
                                                            <UploadCloud className="mr-2 h-4 w-4" />
                                                            Đổi ảnh
                                                        </Button>

                                                        <Button
                                                            variant="danger"
                                                            onClick={handleRemoveLogo}
                                                            className="h-9 px-4 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow transition-all"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Gỡ bỏ
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* CSS cho thanh cuộn ngang ẩn trên Mobile */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `
            }}/>
        </div>
    );
}