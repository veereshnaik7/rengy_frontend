import { Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import { ContactRound, LogOut, Menu, User, X } from "lucide-react";
import { useState } from "react";
import { logoutUser } from "../../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import Contacts from "./Contacts";
import Profile from "./Profile";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authUser = useAppSelector((state) => state.auth.user);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const userRecord = (authUser as any)?.user || authUser;
  const displayEmail = userRecord?.email || "";
  const displayName =
    userRecord?.name ||
    userRecord?.firstName ||
    userRecord?.username ||
    displayEmail.split("@")[0] ||
    "User";
  const displayInitial =
    (userRecord?.name || userRecord?.firstName || displayEmail || displayName)
      .trim()
      .charAt(0)
      .toUpperCase() || "U";
  const showSidebarText = sidebarOpen || mobileSidebarOpen;

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login", { replace: true });
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex h-12 w-full items-center gap-3 rounded-md px-3 text-base font-semibold transition ${showSidebarText ? "justify-start" : "justify-center"
    } ${isActive ? "bg-[#b7ff4a] text-black" : "text-white hover:bg-white/10"}`;

  return (
    <div className="min-h-screen bg-black text-black">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen w-full">
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col border-r border-white/10 bg-black px-3 py-5 transition-all duration-200 lg:sticky lg:top-0 lg:translate-x-0 ${showSidebarText ? "w-60" : "w-20"
            } ${mobileSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
            }`}
        >
          <div
            className={`mb-6 flex items-center gap-4 ${showSidebarText ? "justify-between" : "justify-center"
              }`}
          >
            {showSidebarText && (
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#1d3013] text-xl font-black text-[#b7ff4a]">
                  {displayInitial}
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xl font-bold text-white">
                    {displayName}
                  </h1>
                  <p className="truncate text-sm font-semibold text-slate-400">
                    {displayEmail}
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileSidebarOpen(false);
                } else {
                  setSidebarOpen(!sidebarOpen);
                }
              }}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border-2 border-[#238cff] bg-black text-white"
            >
              {showSidebarText ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <nav className="flex-1 space-y-2 border-t border-white/10 pt-6">
            <NavLink
              to="/contacts"
              onClick={() => setMobileSidebarOpen(false)}
              className={navClass}
            >
              <ContactRound size={22} />
              {showSidebarText && "Contacts"}
            </NavLink>

            <NavLink
              to="/profile"
              onClick={() => setMobileSidebarOpen(false)}
              className={navClass}
            >
              <User size={22} />
              {showSidebarText && "Profile"}
            </NavLink>
          </nav>

          <div className="border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={handleLogout}
              className={`flex h-12 w-full items-center gap-3 rounded-md border border-white/20 bg-black px-3 text-base font-semibold text-white transition hover:bg-white/10 ${showSidebarText ? "justify-start" : "justify-center"
                }`}
            >
              <LogOut size={22} />
              {showSidebarText && "Logout"}
            </button>
          </div>
        </aside>

        <main className="h-screen min-w-0 flex-1 overflow-y-auto bg-[#f7ffd9] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="mb-4 flex items-center gap-3 rounded-md bg-black px-4 py-3 text-white lg:hidden">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-md bg-black text-white"
            >
              <Menu size={24} />
            </button>

            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#1d3013] font-black text-[#b7ff4a]">
              {displayInitial}
            </div>

            <div className="min-w-0">
              <p className="truncate font-black leading-tight">{displayName}</p>
              <p className="truncate text-sm font-semibold text-slate-400">
                {displayEmail}
              </p>
            </div>
          </div>

          <Routes>
            <Route index element={<Navigate to="/contacts" replace />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/contacts" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
