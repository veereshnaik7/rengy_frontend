import { useEffect } from "react";
import { useFormik } from "formik";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Mail, ShieldCheck } from "lucide-react";
import AuthBox from "./AuthBox";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { clearAuthMessage, verifyUser } from "../../features/auth/authSlice";
import { useToast } from "../../components/ToastProvider";
import { verifyUserSchema } from "../../validation/formSchemas";

const VerifyUser = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
      email: searchParams.get("email") || "",
      otp: "",
    },
    validationSchema: verifyUserSchema,
    onSubmit: async (values) => {
      const result = await dispatch(verifyUser(values));

      if (verifyUser.fulfilled.match(result)) {
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

      <h1 className="text-4xl font-bold mb-3">Verify account</h1>
      <p className="text-xl mb-8">Enter the OTP sent to your email.</p>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-xl bg-black text-white font-semibold flex items-center justify-center gap-2"
        >
          {loading ? "Verifying..." : "Verify Account"}
          <ArrowRight size={18} />
        </button>
      </form>
    </AuthBox>
  );
};

export default VerifyUser;
