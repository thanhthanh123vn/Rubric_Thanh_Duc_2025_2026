import React, { useState } from "react";
import {
    Settings, Shield, Bell, Palette, Globe,
    Save, Smartphone, Mail, Lock, UploadCloud
} from "lucide-react";


const Button = ({ children, className = "", variant = "primary", ...props }: any) => {
    const baseStyle = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variants: Record<string, string> = {
        primary: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
        outline: "border border-slate-300 bg-transparent hover:bg-slate-50 text-slate-700",
    };
    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};


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


    const [settings, setSettings] = useState({
        systemName: "Hệ thống Quản lý OBE",
        contactEmail: "admin@university.edu.vn",
        timezone: "Asia/Ho_Chi_Minh",
        twoFactorAuth: true,
        requireStrongPwd: true,
        emailNotifications: true,
        smsAlerts: false,
        theme: "light",
    });

    const handleToggle = (key: keyof typeof settings) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const tabs = [
        { id: "general", label: "Cấu hình chung", icon: Globe },
        { id: "security", label: "Bảo mật", icon: Shield },
        { id: "notifications", label: "Thông báo", icon: Bell },
        { id: "appearance", label: "Giao diện", icon: Palette },
    ];

    return (
        // Wrapper sử dụng mobile-first: Padding p-4 cho mobile, p-6 cho MD trở lên
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Cài đặt hệ thống</h1>
                        <p className="text-sm text-slate-500 mt-1">Quản lý cấu hình toàn cục của ứng dụng</p>
                    </div>
                    <Button className="w-full sm:w-auto shadow-sm">
                        <Save className="w-4 h-4 mr-2" />
                        Lưu thay đổi
                    </Button>
                </div>

                {/* Layout chính: Xếp dọc trên mobile (flex-col), chia cột Sidebar - Content trên tablet/desktop (md:flex-row) */}
                <div className="flex flex-col md:flex-row gap-6">

                    {/* Sidebar Tabs - Cuộn ngang trên Mobile, Nằm dọc trên Desktop */}
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
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

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
                                                value={settings.systemName}
                                                onChange={(e) => setSettings({...settings, systemName: e.target.value})}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-slate-400"/>
                                                Email liên hệ hỗ trợ
                                            </label>
                                            <input
                                                type="email"
                                                value={settings.contactEmail}
                                                onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Múi giờ mặc định</label>
                                            <select
                                                value={settings.timezone}
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
                                            <Switch checked={settings.twoFactorAuth} onChange={() => handleToggle("twoFactorAuth")} />
                                        </div>

                                        <div className="flex items-start sm:items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                                            <div className="pr-4">
                                                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                                    <Lock className="w-4 h-4 text-emerald-600"/>
                                                    Mật khẩu mạnh
                                                </h4>
                                                <p className="text-xs text-slate-500 mt-1">Yêu cầu mật khẩu tối thiểu 8 ký tự, có chữ hoa, số và ký tự đặc biệt.</p>
                                            </div>
                                            <Switch checked={settings.requireStrongPwd} onChange={() => handleToggle("requireStrongPwd")} />
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
                                                <h4 className="text-sm font-semibold text-slate-800">Email Notifications</h4>
                                                <p className="text-xs text-slate-500 mt-1">Gửi thông báo hệ thống qua email định kỳ.</p>
                                            </div>
                                            <Switch checked={settings.emailNotifications} onChange={() => handleToggle("emailNotifications")} />
                                        </div>

                                        <div className="flex items-start sm:items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                                            <div className="pr-4">
                                                <h4 className="text-sm font-semibold text-slate-800">SMS Alerts</h4>
                                                <p className="text-xs text-slate-500 mt-1">Gửi cảnh báo bảo mật khẩn cấp qua SMS.</p>
                                            </div>
                                            <Switch checked={settings.smsAlerts} onChange={() => handleToggle("smsAlerts")} />
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
                                            <div className="mt-2 flex justify-center rounded-xl border border-dashed border-slate-300 px-6 py-8 hover:bg-slate-50 transition-colors cursor-pointer">
                                                <div className="text-center">
                                                    <UploadCloud className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
                                                    <div className="mt-4 flex text-sm leading-6 text-slate-600">
                            <span className="relative cursor-pointer rounded-md font-semibold text-emerald-600 focus-within:outline-none hover:text-emerald-500">
                              Upload a file
                            </span>
                                                        <p className="pl-1">or drag and drop</p>
                                                    </div>
                                                    <p className="text-xs leading-5 text-slate-500">PNG, JPG, SVG up to 2MB</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </main>
                </div>
            </div>

            {/* Thêm chút CSS cho thanh cuộn ngang ẩn trên Mobile */}
            <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
        </div>
    );
}