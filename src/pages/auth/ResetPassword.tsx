import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Mail,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import AuthBox from "./AuthBox";
import { clearAuthMessage, resetPassword } from "../../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useToast } from "../../components/ToastProvider";
import { resetPasswordSchema } from "../../validation/formSchemas";

const ResetPassword = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { loading, message, error } = useAppSelector((state) => state.auth);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearAuthMessage());
    }

    if (error) {
      toast.error(error);
      dispatch(clearAuthMessage());
    }
  }, [dispatch, error, message, toast]);

  const formik = useFormik({
    initialValues: {
      email: searchParams.get("email") || "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values) => {
      const result = await dispatch(resetPassword(values));

      if (resetPassword.fulfilled.match(result)) {
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    },
  });

  return (
    <AuthBox>
      <Link to="/login" className="mb-6 inline-flex items-center gap-2 font-medium">
        <ArrowLeft size={18} />
        Back to Login
      </Link>

      <h1 className="text-4xl font-bold mb-3">Reset password</h1>
      <p className="text-xl mb-8">Enter OTP and create a new password.</p>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        <div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={20} />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full h-14 rounded-xl bg-white pl-12 pr-4 outline-none"
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1 text-sm font-semibold text-red-600">
              {formik.errors.email}
            </p>
          )}
        </div>

        <div>
          <div className="relative">
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2" size={20} />
            <input
              name="otp"
              placeholder="OTP"
              value={formik.values.otp}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full h-14 rounded-xl bg-white pl-12 pr-4 outline-none"
            />
          </div>
          {formik.touched.otp && formik.errors.otp && (
            <p className="mt-1 text-sm font-semibold text-red-600">
              {formik.errors.otp}
            </p>
          )}
        </div>

        <div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={20} />
            <input
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full h-14 rounded-xl bg-white pl-12 pr-12 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {formik.touched.newPassword && formik.errors.newPassword && (
            <p className="mt-1 text-sm font-semibold text-red-600">
              {formik.errors.newPassword}
            </p>
          )}
        </div>

        <div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={20} />
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full h-14 rounded-xl bg-white pl-12 pr-12 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="mt-1 text-sm font-semibold text-red-600">
              {formik.errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-xl bg-black text-white font-semibold flex items-center justify-center gap-2"
        >
          <KeyRound size={20} />
          {loading ? "Resetting..." : "Reset Password"}
          <ArrowRight size={18} />
        </button>
      </form>
    </AuthBox>
  );
};

export default ResetPassword;
