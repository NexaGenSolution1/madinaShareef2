import { useState } from "react";
import { useNavigate } from "react-router";
import { useFormik } from "formik";
import * as Yup from "yup";

import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../Api/axios";

// Validation schema
const SignInSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
});

export default function SignInForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: SignInSchema,
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                const response = await axiosInstance.post("/auth/login", values, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const { token, user } = response.data;

                if (token && user) {
                    login(user, token); // Call login from AuthContext
                    navigate("/", { replace: true });
                }
            } catch (error: any) {
                setErrors({ email: "Invalid credentials" });
                setError((error as any).response.data.message);
                console.error("Login error", error);
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="flex flex-col flex-1">
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div className="mb-5 sm:mb-8">
                    <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                        Sign In
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enter your email and password to sign in!
                    </p>
                </div>

                {/* Social buttons (Google/X) omitted for brevity */}

                <div className="relative py-3 sm:py-5">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                            Or
                        </span>
                    </div>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-6">
                    <div>
                        <Label>
                            Email <span className="text-error-500">*</span>
                        </Label>
                        <Input
                            name="email"
                            placeholder="info@gmail.com"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            touched={formik.touched.email}
                            error={!!formik.errors.email}
                        />
                    </div>

                    <div>
                        <Label>
                            Password <span className="text-error-500">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                touched={formik.touched.password}
                                error={!!formik.errors.password}
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                            >
                                {showPassword ? (
                                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                ) : (
                                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                )}
                            </span>
                        </div>
                    </div>

                    <p className="text-red-500">{error}</p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Checkbox checked={isChecked} onChange={setIsChecked} />
                            <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                                Keep me logged in
                            </span>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        size="sm"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? "Signing in..." : "Sign in"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
