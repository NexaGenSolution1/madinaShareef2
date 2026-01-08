import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import axiosInstance from "../../../api/axios";
import { toast } from "react-toastify";
import countryCodes from "../../../data/countryCodes.json"; // adjust path
import Select from "react-select";
import Header from "../../../components/Header";

const Register = () => {
    const [userType, setUserType] = useState("normal");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        role: "User",
        companyName: "",
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const togglePasswordVisibility = (field) => {
        if (field === "password") setShowPassword((prev) => !prev);
        if (field === "confirmPassword") setShowConfirmPassword((prev) => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                companyName: userType === "agency" ? formData.companyName.trim() : "",
                phone: formData.phone.trim(),
                role: userType === "agency" ? "Agency" : "User",
            };

            const res = await axiosInstance.post("/auth/register", payload);

            if (res.status === 201) {
                toast.success("Registration successful! Please login.");
                navigate("/auth/login");
            }
        } catch (error) {
            if (error.response) {
                toast.error(error.response.data.message || "Registration failed");
            } else {
                toast.error("Server error. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    const options = countryCodes.map((c) => ({
        value: `+${c.code}`,
        label: `${String.fromCodePoint(
            ...[...c.iso].map((ch) => 127397 + ch.charCodeAt())
        )} ${c.country} (+${c.code})`,
    }));

    // Find selected value
    const selectedOption = options.find(
        (opt) => opt.value === formData.countryCode
    );

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

            {/* ---- Top Text Section ---- */}
            <div className="relative z-10 text-center mb-10">
                    <span className="text-2xl md:text-3xl mt-20 font-bold mb-2 tracking-widest text-[#fff] block leading-tight animate-pulse">
                    JOIN US
                </span>
                <p className="text-lg md:text-xl max-w-2xl mx-auto text-white">
                    Start your journey with us
                </p>
            </div>

            {/* ---- Centered Form ---- */}
            <div className="z-10 flex justify-center items-center w-full px-4 mb-20 relative">
                <div
                    className="w-full max-w-3xl rounded-3xl bg-white/90 shadow-2xl p-12 flex flex-col gap-6 border border-white/60 backdrop-blur-md"
                    style={{
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                    }}
                >
                    <form
                        onSubmit={handleSubmit}
                        autoComplete="off"
                        className="flex flex-col gap-6 mt-2"
                    >
                        {/* User Type Toggle */}
                        <div className="flex gap-2 justify-center mb-4">
                            {["normal", "agency"].map((type) => (
                                <button
                                    type="button"
                                    key={type}
                                    onClick={() => {
                                        setUserType(type)
                                        setFormData((prev) => ({
                                            ...prev,
                                            role: type === "agency" ? "Agency" : "User",
                                            companyName: "",
                                        }));
                                    }}
                                    className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 border
                    ${userType === type
                                            ? "bg-[#2A166D] text-white border-[#2A166D]"
                                            : "bg-white/70 text-[#2A166D] border-[#2A166D] hover:bg-[#ede9ff]"
                                        }`}
                                >
                                    {type === "normal" ? "User" : "Agency"}
                                </button>
                            ))}
                        </div>

                        {/* Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <label className="text-base font-semibold text-gray-900">
                                    Name
                                </label>
                                <input
                                    autoComplete="name"
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A166D]"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-base font-semibold text-gray-900">
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
                                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A166D] "
                                />
                            </div>

                            <div className="relative">
                                <label className="text-base font-semibold text-gray-900">
                                    Password
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    autoComplete="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A166D] "
                                />
                                {/* Eye icon inside input */}
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("password")}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                                >
                                    {showPassword ? (
                                        <AiOutlineEye size={20} />
                                    ) : (
                                        <AiOutlineEyeInvisible size={20} />
                                    )}
                                </button>
                                <p className="text-xs text-gray-600 mt-1">
                                    Password must be at least 8 characters
                                </p>
                            </div>

                            <div className="relative">
                                <label className="text-base font-semibold text-gray-900">
                                    Confirm Password
                                </label>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    autoComplete="off"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2"
                                />
                                {/* Eye icon inside input */}
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("confirmPassword")}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                                >
                                    {showConfirmPassword ? (
                                        <AiOutlineEye size={20} />
                                    ) : (
                                        <AiOutlineEyeInvisible size={20} />
                                    )}
                                </button>
                            </div>

                            {/* Contact Number */}
                            <div className="md:col-span-2">
                                <label className="text-base font-semibold text-gray-900">
                                    Contact Number
                                </label>
                                <div className="flex items-center gap-3">
                                    <Select
                                        options={options}
                                        value={selectedOption}
                                        onChange={(selected) =>
                                            handleChange({
                                                target: { name: "countryCode", value: selected.value },
                                            })
                                        }
                                        className="w-64"
                                        classNamePrefix="country-select"
                                        placeholder="Select country code..."
                                        isSearchable
                                    />
                                    <input
                                        type="text"
                                        name="phone"
                                        placeholder="Your contact number"
                                        autoComplete="off"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2A166D]"
                                    />
                                </div>
                            </div>

                            {/* Agency Name (only if agency) */}
                            {userType === "agency" && (
                                <div className="md:col-span-2">
                                    <label className="text-base font-semibold text-gray-900">
                                        Agency Name
                                    </label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        placeholder="Enter agency name"
                                        autoComplete="off"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A166D]"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-md text-lg font-semibold mt-4 
                ${loading
                                    ? "bg-gray-400 text-white cursor-not-allowed"
                                    : "bg-[#2A166D] text-white hover:bg-[#3a1c9a] shadow-md"
                                } 
                transition-all duration-200`}
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    {/* Already have account */}
                    <div className="text-center text-gray-900 text-base mt-4">
                        Already have an account?{" "}
                        <Link
                            to="/auth/login"
                            className="text-[#2A166D] font-semibold hover:underline"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
            </div>
        </>
    );
};

export default Register;
