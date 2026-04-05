import React from 'react';
import { BrowserRouter} from 'react-router-dom';
import AppRoutes from "./routes/AppRoutes";


const StudentDashboard = () => (
    <div className="p-10 text-2xl font-bold text-emerald-800">
        Chào mừng Thạnh đến với Bảng điều khiển Sinh viên! 🎓
        <p className="text-sm font-normal mt-4 text-gray-600">Đây là nơi sẽ hiển thị Biểu đồ mạng nhện đánh giá năng lực.</p>
    </div>
);

function App() {
    return (
        <BrowserRouter>
            <AppRoutes/>
        </BrowserRouter>
    );
}

export default App;
