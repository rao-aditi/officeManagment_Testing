import React, { memo, useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getEnums, reqToUserLogin } from "../../store/slice/auth/authSlice";
import { useAlert } from "../../helpers/AlertContent";
import logo from "../../assets/logo.png";
import TextInput from "../ui/TextInput";
import Button from "../ui/Button";
import Loader from "../Loader/Loader";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { showAlert } = useAlert();
    const loading = useSelector((state) => state.auth.loading);
    const [showPassword, setShowPassword] = useState(false);

    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
        password: Yup.string()
            .min(6, "Password must be at least 6 characters")
            .required("Password is required"),
    });

    // const handleSubmit = (values, { setSubmitting }) => {
    //     dispatch(
    //         reqToUserLogin({
    //             userRole: values.userRole,
    //             email: values.email,
    //             password: values.password,

    //             onSuccess: (res) => {
    //                 setSubmitting(false);
    //                 if (!res?.success) {
    //                     showAlert({
    //                         type: "error",
    //                         title: "Error",
    //                         message: res?.message || "Invalid email or password",
    //                     });

    //                     return;
    //                 }
    //                 showAlert({
    //                     type: "success",
    //                     title: "Success",
    //                     message: res?.message || "Login successful!",
    //                 });
    //                 setTimeout(() => {
    //                     navigate("/");
    //                 }, 300);
    //             },

    //             onError: (err) => {
    //                 setSubmitting(false);
    //                 const errorMsg =
    //                     err?.response?.data?.message ||
    //                     err?.message ||
    //                     "Something went wrong";
    //                 showAlert({
    //                     type: "error",
    //                     title: "Error",
    //                     message: errorMsg,
    //                 });
    //             },
    //         })
    //     );
    // };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const res = await dispatch(reqToUserLogin(values)).unwrap();

            showAlert({
                type: "success",
                message: res.message || "Login successful",
            });

            navigate("/officeManagment_DashBoard");
        } catch (error) {
            showAlert({
                type: "error",
                message: error || "Something went wrong",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema,
        onSubmit: handleSubmit,
    });

    return (
        <div className="relative min-h-screen bg-[#04506B] flex items-center justify-center px-4 py-8 overflow-hidden">
            {(formik.isSubmitting || loading) && <Loader fullPage />}
            <div className="w-full max-w-6xl bg-[#F5F5F5] rounded-[32px] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2">

                <div className="relative bg-gradient-to-b from-[#045C78] via-[#034B64] to-[#022B3A] text-white p-8 lg:p-10 flex flex-col justify-between">
                    <div>
                        <div className="flex flex-col items-start">
                            <img
                                src={logo}
                                alt="logo"
                                className="w-40 h-20 object-contain"
                            />

                            <div>
                                <h1 className="text-5xl font-extrabold leading-tight">
                                    Office Management
                                </h1>
                                <p className="mt-4 text-white/85 text-base max-w-sm leading-6">
                                    Complete office management solution for firms, accounting teams, GST compliance, taxation,
                                    billing & client management.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 mt-12">
                            <div className="bg-[#1D617B] border border-white/10 rounded-3xl px-6 py-4 shadow-lg">
                                <p className="uppercase tracking-[4px] text-sm text-white/70 mb-1 font-semibold">
                                    Demo Email
                                </p>
                                <p className="text-base font-semibold">
                                    admin@caoffice.com
                                </p>
                            </div>

                            <div className="bg-[#1D617B] border border-white/10 rounded-3xl px-6 py-4 shadow-lg">
                                <p className="uppercase tracking-[4px] text-sm text-white/70 mb-1 font-semibold">
                                    Demo Password
                                </p>

                                <p className="text-base font-semibold">
                                    office@12345
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16">
                        <p className="text-base leading-6 text-white/90 max-w-lg">
                            Secure cloud-based platform for efficient office management
                        </p>
                    </div>
                    <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/10 blur-3xl rounded-full" />
                </div>

                <div className="bg-[#F5F5F5] flex items-center justify-center p-8 lg:p-10">
                    <div className="w-full max-w-xl bg-white border border-gray-300 rounded-2xl shadow-sm px-8 py-10 lg:px-12">
                        <div className="mb-8 text-center">
                            <h2 className="text-4xl font-bold text-black">
                                Sign In
                            </h2>

                            <p className="text-gray-600 mt-3 text-base">
                                Enter your credentials to access your account
                            </p>
                        </div>

                        <form
                            onSubmit={formik.handleSubmit}
                            className="space-y-4"
                        >
                            <TextInput
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="vikram@outstripinfotech.com"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.errors.email}
                                touched={formik.touched.email}
                                icon={Mail}
                                size="lg"
                            />

                            <TextInput
                                label="Password"
                                name="password"
                                type={
                                    showPassword ? "text" : "password"
                                }
                                placeholder="••••••••"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.errors.password}
                                touched={formik.touched.password}
                                icon={Lock}
                                size="lg"
                                showToggle
                                onToggle={() =>
                                    setShowPassword(!showPassword)
                                }
                            />

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    size="lg"
                                    loading={
                                        formik.isSubmitting || loading
                                    }
                                    disabled={
                                        formik.isSubmitting || loading
                                    }
                                    styleClass="w-full"
                                >
                                    NEXT →
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(Login)


