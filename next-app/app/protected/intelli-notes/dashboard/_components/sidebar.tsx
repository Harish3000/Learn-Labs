"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, Layout, Menu, X } from "lucide-react";
import chatImage from "/app/mini.png";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [isOpen, setIsOpen] = React.useState(true);
  const path = usePathname();
  const fileList = useQuery(api.storage.GetUserFiles, {
    createdBy: "Admin"
  });

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Menu Icon - Shown only when sidebar is collapsed */}
      {
        !isOpen && (
          <button
            className="fixed top-20 left-7 z-50 bg-gray-800 text-white p-2 rounded-md"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
        )
      }

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 z-40 w-64 bg-background p-4 shadow-lg border-r transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
          onClick={toggleSidebar}
        >
          <X size={24} />
        </button>

        <div className="flex flex-col h-full">
          <div className="flex-grow space-y-6">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src={chatImage}
                alt="Logo"
                width={60}
                height={60}
                className="rounded-lg"
              />
              <p className="text-sm ml-2">
                <b>INTELLINOTE</b>
              </p>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col space-y-3">
              <Link href={"/protected/intelli-notes/dashboard"} className="text-sm font-medium">
                <div
                  className={`flex gap-2 items-center p-3 hover:bg-slate-100 rounded-lg cursor-pointer ${path == "/dashboard" ? "bg-slate-200" : ""
                    }`}
                >
                  <Layout />
                  <h2>Workspace</h2>
                </div>
              </Link>

              <Link href={"/protected/intelli-notes/dashboard/upgrade"} className="text-sm font-medium">
                <div
                  className={`flex gap-2 items-center p-3 hover:bg-slate-100 rounded-lg cursor-pointer ${path == "/dashboard/upgrade" ? "bg-slate-200" : ""
                    }`}
                >
                  <Shield />
                  Upgrade
                </div>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
