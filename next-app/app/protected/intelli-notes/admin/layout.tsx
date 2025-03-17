import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Admin Panel - IntelliNote",
    description: "Admin dashboard for IntelliNote application",
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">{children}</div>
}

