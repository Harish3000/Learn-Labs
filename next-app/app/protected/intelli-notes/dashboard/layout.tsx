import React, { ReactNode } from "react";
import Sidebar from "./_components/sidebar";
import Provider from "@/app/provider";
import "/app/globals.css";
import "../admin/layout";
import type { Metadata } from "next"


export const metadata: Metadata = {
    title: "Dashboard - IntelliNote",
    description: "User dashboard for IntelliNote application",
}

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <>
      {/* <div className="flex min-h-[calc(1000vh-10rem)] fixed"> */}
      <Provider>
        <Sidebar />
      </Provider>
      <div className="md:ml-64">{children}</div>
      {/*  </div> */}
    </>
  );
};

export default DashboardLayout;
