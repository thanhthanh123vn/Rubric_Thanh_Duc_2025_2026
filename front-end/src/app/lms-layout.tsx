'use client'

import { SidebarProvider } from '@/components/ui/sidebar.tsx'
import Sidebar  from '@/components/home/Sidebar.tsx'
import Header from '@/components/home/Header.tsx'


export default function LMSLayout({
                                      children,
                                  }: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <Sidebar />
                <div className="flex flex-1 flex-col w-full">
                    <Header />
                    <main className="flex-1 overflow-auto bg-background">
                        <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}
