import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import axiosInstance from "../../../api/axios";
import { toast } from "react-toastify";
import Header from "../../../components/Header";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axiosInstance.post("/auth/login", {
                email: formData.email.trim(),
                password: formData.password,
            });

            if (res.status === 200 && res.data.success) {
                const { token, user } = res.data;

                // Store token and user data
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));

                toast.success("Login successful!");
                
                // Redirect based on role
                if (user.role === "Admin") {
                    window.location.href = "/admin-portal/";
                } else {
                    navigate("/");
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

    return (
        <>
            <Header />
            <div
            className="min-h-screen w-full flex flex-col items-center justify-start 
             bg-no-repeat bg-cover bg-center bg-fixed relative"
            style={{
                backgroundImage: `url('https://images.pexels.com/photos/20277838/pexels-photo-20277838.jpeg')`,
                backgroundColor: "#000000",
                paddingTop: "60px",
            }}
        >
            <div className="absolute inset-0 bg-black/50 z-0" />

            {/* Top Text Section */}
            <div className="relative z-10 text-center mb-10">
                <span className="text-2xl md:text-3xl mt-20 font-bold mb-2 tracking-widest text-[#fff] block leading-tight animate-pulse">
                    WELCOME BACK
                </span>
                <p className="text-lg md:text-xl max-w-2xl mx-auto text-white">
                    Sign in to continue your journey
                </p>
            </div>

            {/* Centered Form */}
            <div className="z-10 flex justify-center items-center w-full px-4 mb-20 relative">
                <div
                    className="w-full max-w-md rounded-3xl bg-white/90 shadow-2xl p-12 flex flex-col gap-6 border border-white/60 backdrop-blur-md"
                    style={{
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                    }}
                >
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
                        Login
                    </h2>

                    <form
                        onSubmit={handleSubmit}
                        autoComplete="off"
                        className="flex flex-col gap-6"
                    >
                        {/* Email */}
                        <div>
                            <label className="text-base font-semibold text-gray-900 block mb-2">
                                Email
                            </label>
                            <input
                                autoComplete="email"
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A166D]"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <label className="text-base font-semibold text-gray-900 block mb-2">
                                Password
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A166D]"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-[42px] text-gray-600 hover:text-gray-800"
                            >
                                {showPassword ? (
                                    <AiOutlineEyeInvisible size={22} />
                                ) : (
                                    <AiOutlineEye size={22} />
                                )}
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-full text-lg font-semibold transition-all duration-300 
                                ${loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-[#2A166D] text-white hover:bg-[#3a1c9a]"
                                }`}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                        {/* Register Link */}
                        <p className="text-center text-gray-700 text-sm">
                            Don't have an account?{" "}
                            <Link
                                to="/auth/register"
                                className="text-[#2A166D] font-semibold hover:underline"
                            >
                                Register here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
            </div>
        </>
    );
};

export default Login;