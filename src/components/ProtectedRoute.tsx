import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authChecked, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!authChecked) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7ffd9] px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative grid h-16 w-16 place-items-center rounded-full bg-black">
            <div className="absolute h-full w-full animate-spin rounded-full border-4 border-black border-t-[#b7ff4a]" />
            <div className="h-6 w-6 rounded-full bg-[#b7ff4a]" />
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-black">
            Loading
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
