import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import AuthBox from "./AuthBox";
import { clearAuthMessage, loginUser } from "../../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useToast } from "../../components/ToastProvider";
import { loginSchema } from "../../validation/formSchemas";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthMessage());
    }
  }, [dispatch, error, toast]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      const result = await dispatch(loginUser(values));

      if (loginUser.fulfilled.match(result)) {
        navigate("/contacts", { replace: true });
      }
    },
  });

  return (
    <AuthBox>
      <h1 className="text-4xl font-bold mb-3">Welcome back</h1>
      <p className="text-xl mb-8">Login to continue your account.</p>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-xl bg-black text-white font-semibold flex items-center justify-center gap-2"
        >

          {loading ? "Logging in..." : "Login"}
          <ArrowRight size={18} />
        </button>
      </form>

      <div className="mt-6 flex justify-between text-sm font-medium">
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-1 text-blue-600 font-semibold"
        >
          <span>Forgot Password</span>
          <ArrowRight size={16} />
        </Link>

        <Link
          to="/register"
          className="inline-flex items-center gap-1 text-blue-600 font-semibold"
        >
          <span>Create Account</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </AuthBox>
  );
};

export default Login;
