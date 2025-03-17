import React, { ReactNode } from "react";
import Sidebar from "./_components/sidebar";
import Provider from "@/app/provider";
import "/app/globals.css";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] fixed">
      <Provider>
        <Sidebar />
      </Provider>
      <div className="flex-1 overflow-auto p-6 md:ml-64">{children}</div>
    </div>
  );
};

export default DashboardLayout;
