import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import {forgotPassword,resetPassword} from './api/authService'
const ForgotPasswordPage = () => {
    const navigate = useNavigate();


    const [step, setStep] = useState<1 | 2>(1);

    // Form Data
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' }); // type: 'success' | 'error'

    // GỌI API: Yêu cầu gửi OTP
    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setMessage({ type: 'error', text: 'Vui lòng nhập địa chỉ email!' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {

            const response = await forgotPassword(email);

            if (response!==200) throw new Error('Email không tồn tại trong hệ thống!');

            setMessage({ type: 'success', text: 'Mã OTP đã được gửi đến email của bạn!' });
            setStep(2);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Có lỗi xảy ra, vui lòng thử lại!' });
        } finally {
            setIsLoading(false);
        }
    };

    // GỌI API: Xác nhận OTP và đổi mật khẩu
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await resetPassword(email,otp, newPassword);

            if (response!==200) throw new Error('Mã OTP không đúng hoặc đã hết hạn!');

            setMessage({ type: 'success', text: 'Đổi mật khẩu thành công! Đang chuyển hướng...' });


            setTimeout(() => navigate('/login'), 2000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Có lỗi xảy ra khi đổi mật khẩu!' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all">

                {/* Header Container */}
                <div className="p-6 pb-0">
                    <button
                        onClick={() => step === 2 ? setStep(1) : navigate('/login')}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="mt-6 mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                            {step === 1 ? 'Quên mật khẩu?' : 'Tạo mật khẩu mới'}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500">
                            {step === 1
                                ? 'Nhập email liên kết với tài khoản của bạn để nhận mã khôi phục.'
                                : `Vui lòng nhập mã OTP gồm 6 chữ số vừa được gửi tới ${email}.`}
                        </p>
                    </div>
                </div>

                {/* Thông báo lỗi / thành công (Alert) */}
                {message.text && (
                    <div className={`mx-6 mb-4 p-4 rounded-2xl flex items-start gap-3 text-sm font-medium ${
                        message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                        {message.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                        <p>{message.text}</p>
                    </div>
                )}

                {/* Body Form */}
                <div className="p-6 pt-0">
                    {step === 1 ? (
                        // BƯỚC 1: FORM NHẬP EMAIL
                        <form onSubmit={handleSendOTP} className="flex flex-col gap-5">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 sm:py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-base"
                                    placeholder="Ví dụ: 22130270@st.hcmuaf.edu.vn"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center gap-2 py-3.5 sm:py-4 px-4 border border-transparent rounded-2xl text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-md shadow-emerald-600/20"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gửi mã xác nhận'}
                            </button>
                        </form>

                    ) : (
                        // BƯỚC 2: FORM NHẬP OTP VÀ PASS MỚI
                        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    className="block w-full pl-11 pr-4 py-3.5 sm:py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-base tracking-widest font-medium"
                                    placeholder="Nhập 6 số OTP"
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 sm:py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-base"
                                    placeholder="Mật khẩu mới"
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 sm:py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-base"
                                    placeholder="Xác nhận mật khẩu mới"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-2 w-full flex justify-center items-center gap-2 py-3.5 sm:py-4 px-4 border border-transparent rounded-2xl text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-md shadow-emerald-600/20"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Xác nhận đổi mật khẩu'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;