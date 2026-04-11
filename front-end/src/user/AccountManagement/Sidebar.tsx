import React from 'react';
import { User, Settings, CheckCircle, Calendar, MessageSquare, LogOut } from 'lucide-react';

const Sidebar: React.FC = () => {
    const menuItems = [
        {
            id: 'account',
            label: 'Hộ số cá nhân',
            icon: User,
            active: true
        },
        {
            id: 'settings',
            label: 'Cài đặt tài khoản',
            icon: Settings,
            active: false
        },
        {
            id: 'results',
            label: 'Kết quả học tập',
            icon: CheckCircle,
            active: false
        },
        {
            id: 'messages',
            label: 'Tin nhắn',
            icon: MessageSquare,
            active: false
        },
        {
            id: 'schedule',
            label: 'Lịch học',
            icon: Calendar,
            active: false
        }
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <div className="w-10 h-10 bg-green-600 text-white rounded flex items-center justify-center font-bold text-xl">
                    VŨ
                </div>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                                item.active
                                    ? 'bg-green-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="border-t border-gray-200 p-4">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
