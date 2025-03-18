"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, Upload } from "lucide-react";
import chatImage from "/app/mini.png";

import { Button } from "@/components/ui/button";
import { Layout } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePathname } from "next/navigation";
import { useUserFromCookie } from "@/utils/restrictClient";

export default function Sidebar() {
  const path = usePathname();
  const fileList = useQuery(api.storage.GetUserFiles, {
    createdBy: "Admin"
  });

  // Role-restricted user with redirection
  const user = useUserFromCookie();

  return (
    <div className="fixed left-0 top-0 bottom-0 z-40 w-64 overflow-y-auto border-r bg-background p-4 shadow-lg">
      <div className="flex flex-col h-full">
        <div className="flex-grow space-y-6">
          <div className="flex items-center justify-left">
            <Image
              src={chatImage}
              alt="Logo"
              width={60}
              height={60}
              className="rounded-lg"
            />
            <p className="text-sm">
              <b>INTELLINOTE</b>
            </p>
          </div>

          <nav className="flex flex-col space-y-3">
            <Link href={"/protected/intelli-notes/dashboard"} className="text-sm font-medium">
              <div
                className={`flex gap-2 item-center p-3 hover:bg-slate-100 rounded-lg cursor-poniter ${path == "/dashboard" && "bg-slate-200"}`}
              >
                <Layout />
                <h2> Workspace</h2>
              </div>
            </Link>

            <Link href={"/protected/intelli-notes/dashboard/upgrade"} className="text-sm font-medium">
              <div
                className={`flex gap-2 item-center p-3 hover:bg-slate-100 rounded-lg cursor-poniter ${path == "/dashboard/upgrade" && "bg-slate-200"}`}
              >
                <Shield />
                Upgrade
              </div>
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
