import React, { useState } from "react";
import Header from "../../../../components/home/Header";
import Sidebar from "./Sidebar";

const Banner = () => {
    return (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Nhóm của tôi</h2>
            <p className="text-sm opacity-90 mt-1">Trao đổi và làm việc nhóm</p>
        </div>
    );
};

const GroupInfo = () => {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
            <h3 className="font-semibold text-gray-900">Nhóm 1 - Web OBE</h3>
            <p className="text-sm text-gray-500 mt-1">Thành viên:</p>

            <div className="mt-2 flex flex-wrap gap-2">
                {["Bạn", "Nguyễn Văn A", "Trần Thị B", "Lê Văn C"].map((m, i) => (
                    <span
                        key={i}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                    >
                        {m}
                    </span>
                ))}
            </div>
        </div>
    );
};

const ChatBox = () => {
    const [messages, setMessages] = useState([
        { sender: "Nguyễn Văn A", text: "Mọi người làm tới đâu rồi?" },
        { sender: "Bạn", text: "Mình đang làm phần UI" },
    ]);

    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;

        setMessages([...messages, { sender: "Bạn", text: input }]);
        setInput("");
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[400px]">

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${
                            msg.sender === "Bạn" ? "justify-end" : "justify-start"
                        }`}
                    >
                        <div
                            className={`px-4 py-2 rounded-2xl text-sm max-w-[70%] ${
                                msg.sender === "Bạn"
                                    ? "bg-emerald-500 text-white"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                        >
                            <p className="font-semibold text-xs mb-1">
                                {msg.sender}
                            </p>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none"
                />
                <button
                    onClick={handleSend}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700"
                >
                    Gửi
                </button>
            </div>
        </div>
    );
};

const CourseGroups = () => {
    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />

            <div className="flex">
                <Sidebar />

                <div className="flex-1 p-4 lg:p-6">
                    <div className="max-w-4xl mx-auto">
                        <Banner />
                        <GroupInfo />
                        <ChatBox />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseGroups;