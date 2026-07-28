import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import AuthBox from "./AuthBox";
import { clearAuthMessage, registerUser } from "../../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useToast } from "../../components/ToastProvider";
import { registerSchema } from "../../validation/formSchemas";

const Register = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthMessage());
    }
  }, [dispatch, error, toast]);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      const result = await dispatch(registerUser(values));

      if (registerUser.fulfilled.match(result)) {
        toast.success(result.payload.message || "Verification OTP sent");
        navigate(`/verify-user?email=${encodeURIComponent(values.email)}`);
      }
    },
  });

  return (
    <AuthBox>
      <Link to="/login" className="mb-6 inline-flex items-center gap-2 font-medium">
        <ArrowLeft size={18} />
        Back to Login
      </Link>

      <h1 className="text-4xl font-bold mb-3">Create account</h1>
      <p className="text-xl mb-8">Register to get started for free.</p>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        <div>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2" size={20} />
            <input
              name="name"
              placeholder="Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full h-14 rounded-xl bg-white pl-12 pr-4 outline-none"
            />
          </div>
          {formik.touched.name && formik.errors.name && (
            <p className="mt-1 text-sm font-semibold text-red-600">
              {formik.errors.name}
            </p>
          )}
        </div>

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
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={20} />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full h-14 rounded-xl bg-white pl-12 pr-12 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-sm font-semibold text-red-600">
              {formik.errors.password}
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

          {loading ? "Creating..." : "Register"}
          <ArrowRight size={18} />
        </button>
       <Link
  to="/login"
  className="flex items-center justify-center gap-1 text-center"
>
  <span>Already have an account?</span>
  <span className="flex items-center gap-1 font-medium text-blue-600 hover:underline">
    Login
    <ArrowRight size={16} />
  </span>
</Link>
      </form>
    </AuthBox>
  );
};

export default Register;
