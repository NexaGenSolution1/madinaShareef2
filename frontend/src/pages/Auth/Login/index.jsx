import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { toast } from "react-toastify";
import Header from "../../../components/Header";

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        agentCode: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [autoLoginTriggered, setAutoLoginTriggered] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const performLogin = async (payload) => {
        setLoading(true);

        try {
            const res = await axiosInstance.post("/auth/login", {
                agencyCode: payload.agentCode.trim(),
                email: payload.email.trim(),
                password: payload.password,
            });

            if (res.status === 200 && res.data.success) {
                const { token, user } = res.data;

                // Store token and user data
                localStorage.setItem("frontend_token", token);
                localStorage.setItem("frontend_user", JSON.stringify(user));

                toast.success("Login successful!");
                
                // Redirect based on role
                if (user.role === "Admin") {
                    window.location.href = "/admin-portal/";
                } else {
                    // Update parent component state
                    if (onLogin) {
                        onLogin(user);
                    }
                }
            }
        } catch (error) {
            if (error.response) {
                const msg = error.response.data.message || "Login failed";
                const status = error.response.data.status;
                if (status) {
                    toast.error(`${msg}`);
                } else {
                    toast.error(msg);
                }
            } else {
                toast.error("Server error. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        performLogin(formData);
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const prefills = {
            agentCode: params.get("agentCode") || params.get("agencyCode") || "",
            email: params.get("email") || "",
            password: params.get("password") || "",
        };
        const shouldAuto = (params.get("auto") || params.get("autoLogin")) === "true";

        if (prefills.agentCode || prefills.email || prefills.password) {
            setFormData((prev) => ({
                ...prev,
                ...prefills,
            }));
        }

        if (
            shouldAuto &&
            prefills.agentCode &&
            prefills.email &&
            prefills.password &&
            !autoLoginTriggered
        ) {
            setAutoLoginTriggered(true);
            performLogin(prefills);
        }
    }, [autoLoginTriggered]);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!forgotEmail.trim()) {
            toast.error("Email is required");
            return;
        }
        setForgotLoading(true);
        try {
            const res = await axiosInstance.post("/auth/forgot-password", {
                email: forgotEmail.trim(),
            });
            if (res.data?.success) {
                toast.success("Password reset link sent to your email.");
                setShowForgot(false);
            } else {
                toast.error(res.data?.message || "Failed to send reset link");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send reset link");
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div
                className="min-h-screen w-full flex flex-col items-center justify-start bg-no-repeat bg-cover bg-center bg-fixed relative pt-36 md:pt-42 lg:pt-48 pb-12"
                style={{
                    backgroundImage: `url('https://images.pexels.com/photos/20277838/pexels-photo-20277838.jpeg')`,
                    backgroundColor: "#000000",
                }}
            >
                <div className="absolute inset-0 bg-black/55 z-0" />

                <div className="z-10 flex justify-center w-full px-4 sm:px-5 md:px-6 mb-16 md:mb-20 relative">
                    <div className="w-full max-w-xl sm:max-w-2xl rounded-2xl bg-white/95 shadow-2xl p-6 sm:p-7 md:p-8 lg:p-10 flex flex-col gap-6 border border-white/70 backdrop-blur-md">
                        <div className="flex flex-col gap-2 text-left">
                            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Welcome back</h1>
                            <p className="text-sm sm:text-base text-gray-700">
                                Don’t have an account yet?{" "}
                                <Link
                                    to="/auth/register"
                                    className="text-[#2A166D] font-semibold hover:underline"
                                >
                                    Sign up for free
                                </Link>
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            autoComplete="off"
                            className="flex flex-col gap-4"
                        >
                            <input
                                autoComplete="off"
                                type="text"
                                name="agentCode"
                                placeholder="Agent Code"
                                value={formData.agentCode}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A166D] focus:border-transparent text-gray-900 placeholder:text-gray-500"
                            />

                            <input
                                autoComplete="email"
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A166D] focus:border-transparent text-gray-900 placeholder:text-gray-500"
                            />

                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A166D] focus:border-transparent text-gray-900 placeholder:text-gray-500"
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 rounded text-base font-semibold mt-2
                                ${loading
                                    ? "bg-gray-400 cursor-not-allowed text-white"
                                    : "bg-[#2A166D] text-white hover:bg-[#3a1c9a] shadow-md"}
                                transition-all duration-200`}
                            >
                                {loading ? "Logging in..." : "Login"}
                            </button>

                            <div className="text-left">
                                <button
                                    type="button"
                                    onClick={() => setShowForgot(true)}
                                    className="text-[#2A166D] font-semibold hover:underline text-sm"
                                >
                                    Forgot your password?
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {showForgot && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowForgot(false)}
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 sm:p-7 md:p-8 z-10">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                                Write your email address.
                            </h2>
                            <button
                                type="button"
                                aria-label="Close"
                                onClick={() => setShowForgot(false)}
                                className="text-2xl text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                            <input
                                type="email"
                                name="forgotEmail"
                                placeholder="Email"
                                autoComplete="email"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A166D] focus:border-transparent text-gray-900 placeholder:text-gray-500"
                                required
                            />

                            <button
                                type="submit"
                                disabled={forgotLoading}
                                className={`w-full py-3 rounded text-base font-semibold mt-1
                                ${forgotLoading
                                    ? "bg-gray-400 cursor-not-allowed text-white"
                                    : "bg-[#2A166D] text-white hover:bg-[#3a1c9a] shadow-md"}
                                transition-all duration-200`}
                            >
                                {forgotLoading ? "Sending..." : "Send Me Password"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Login;