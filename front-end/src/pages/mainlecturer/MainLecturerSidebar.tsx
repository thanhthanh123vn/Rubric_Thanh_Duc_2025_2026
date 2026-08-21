import React, { useState } from 'react';
import { GraduationCap, ChevronDown } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { mainLecturerModuleLinks } from './mainLecturerData';

export default function MainLecturerSidebar() {

    const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

    const toggleSubMenu = (label: string) => {
        setOpenMenus((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    return (
        <>
            {/* --- DESKTOP SIDEBAR --- */}
            <aside className="sticky top-0 hidden h-screen w-80 shrink-0 border-r border-white/60 bg-white/80 px-6 py-6 backdrop-blur-xl xl:flex xl:flex-col">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-700 text-white shadow-lg shadow-green-700/25">
                        <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-700">Main Lecturer</p>
                        <h1 className="text-lg font-bold text-slate-900">Rubric Studio</h1>
                    </div>
                </div>

                <nav className="mt-6 space-y-1">
                    {mainLecturerModuleLinks.map((item) => {
                        const hasSubItems = item.subItems && item.subItems.length > 0;
                        const isSubMenuOpen = openMenus[item.label];

                        // 1. NẾU CÓ MENU CON
                        if (hasSubItems) {
                            return (
                                <div key={item.label} className="space-y-1">
                                    {/* Nút bấm cha để xổ menu */}
                                    <button
                                        onClick={() => toggleSubMenu(item.label)}
                                        className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all text-slate-600 hover:bg-green-50 hover:text-green-700"
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.label}</span>
                                        </div>
                                        <ChevronDown
                                            className={`h-4 w-4 transition-transform duration-200 ${
                                                isSubMenuOpen ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>

                                    {/* Danh sách các menu con */}
                                    {isSubMenuOpen && (
                                        <div className="ml-5 mt-1 space-y-1 border-l border-slate-200 pl-4">
                                            {item.subItems!.map((subItem) => (
                                                <NavLink
                                                    key={subItem.path}
                                                    to={subItem.path}
                                                    className={({ isActive }) =>
                                                        `flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                                                            isActive
                                                                ? 'bg-green-50 text-green-700 shadow-sm border border-green-100/50'
                                                                : 'text-slate-500 hover:bg-green-50 hover:text-green-700'
                                                        }`
                                                    }
                                                >
                                                    {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                                    <span>{subItem.label}</span>
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }


                        if (item.path === '/teacher') {
                            return (
                                <a
                                    key={item.path}
                                    href="/teacher"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all text-slate-600 hover:bg-green-50 hover:text-green-700"
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </a>
                            );
                        }

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/mainlecturer'}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                                        isActive
                                            ? 'bg-green-50 text-green-700'
                                            : 'text-slate-600 hover:bg-green-50 hover:text-green-700'
                                    }`
                                }
                            >
                                <item.icon className="h-4 w-4" />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>

            {/* --- MOBILE NAVIGATION --- */}
            <div className="flex gap-2 overflow-x-auto px-4 py-4 md:px-6 xl:hidden">
                {mainLecturerModuleLinks.map((item) => {
                    const hasSubItems = item.subItems && item.subItems.length > 0;

                    // Nếu có menu con, trải phẳng ra làm tab ngang
                    if (hasSubItems) {
                        return item.subItems!.map((subItem) => (
                            <NavLink
                                key={subItem.path}
                                to={subItem.path}
                                className={({ isActive }) =>
                                    `inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm ${
                                        isActive
                                            ? 'border-green-200 bg-green-50 text-green-700'
                                            : 'border-slate-200 bg-white text-slate-600'
                                    }`
                                }
                            >
                                {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                {subItem.label}
                            </NavLink>
                        ));
                    }


                    if (item.path === '/teacher') {
                        return (
                            <a
                                key={item.path}
                                href="/teacher"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all text-slate-600 hover:bg-green-50 hover:text-green-700"
                            >
                                <item.icon className="h-4 w-4" />
                                <span>{item.label}</span>
                            </a>
                        );
                    }

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/mainlecturer'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-green-50 text-green-700'
                                        : 'text-slate-600 hover:bg-green-50 hover:text-green-700'
                                }`
                            }
                        >
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </>
    );
}