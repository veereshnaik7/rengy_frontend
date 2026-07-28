import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyUser from "./pages/auth/VerifyUser";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { restoreSession } from "./features/auth/authSlice";

const App = () => {
  const dispatch = useAppDispatch();
  const { authChecked } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!authChecked) {
      dispatch(restoreSession());
    }
  }, [authChecked, dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-user" element={<VerifyUser />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
