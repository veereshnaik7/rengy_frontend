import type { ReactNode } from "react";

const AuthBox = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-xl bg-lime-200 px-8 py-12 md:px-14 rounded-lg">
        {children}
      </div>
    </div>
  );
};

export default AuthBox;