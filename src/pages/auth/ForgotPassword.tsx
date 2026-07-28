import { useEffect } from "react";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import AuthBox from "./AuthBox";
import { clearAuthMessage, forgotPassword } from "../../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useToast } from "../../components/ToastProvider";
import { forgotPasswordSchema } from "../../validation/formSchemas";

const ForgotPassword = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { loading, message, error } = useAppSelector((state) => state.auth);

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
      email: "",
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values) => {
      const result = await dispatch(forgotPassword(values));

      if (forgotPassword.fulfilled.match(result)) {
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(values.email)}`);
        }, 800);
      }
    },
  });

  return (
    <AuthBox>
      <Link to="/login" className="mb-6 inline-flex items-center gap-2 font-medium">
        <ArrowLeft size={18} />
        Back to Login
      </Link>

      <h1 className="text-4xl font-bold mb-3">Forgot password</h1>
      <p className="text-xl mb-8">Enter your email to receive OTP.</p>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-xl bg-black text-white font-semibold flex items-center justify-center gap-2"
        >

          {loading ? "Sending..." : "Send OTP"}
          <ArrowRight size={18} />
        </button>
      </form>

      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-2 font-medium text-center"
      >
        <span>Already have an account?</span>
        <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
          Login <ArrowRight size={18} />
        </span>
      </Link>
    </AuthBox>
  );
};

export default ForgotPassword;
