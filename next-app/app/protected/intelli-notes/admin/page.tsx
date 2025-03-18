"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUserFromCookie } from "@/utils/restrictClient"
import { redirect } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { FileText, Users, BookOpen, Search } from "lucide-react"
import { useEffect, useState } from "react";
import UploadPdfDialog from "./_components/upload-pdf-dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

export default function AdminPanel() {
  const notesData = useQuery(api.notes.GetAllNotes);
  // const [keywordCounts, setKeywordCounts] = useState([]);

  // useEffect(() => {
  //   if (notesData) {
  //     const text = notesData.join(" ").toLowerCase();
  //     const words = text.match(/\b\w+\b/g) || []; // Extract words
  //     const freqMap = words.reduce((acc, word) => {
  //       acc[word] = (acc[word] || 0) + 1;
  //       return acc;
  //     }, {});

  //     const sortedKeywords = Object.entries(freqMap)
  //       .sort((a, b) => b[1] - a[1])
  //       .slice(0, 5) // Get top 5 keywords
  //       .map(([keyword, count]) => ({ keyword, count }));

  //     setKeywordCounts(sortedKeywords);
  //   }
  // }, [notesData]);

  // Check if user is admin, redirect if not
  const user = useUserFromCookie()

  if (user && user.user_metadata?.role !== "admin") {
    redirect("/protected/intelli-notes/dashboard")
  }

  // Fetch data from Convex
  const fileList = useQuery(api.storage.GetUserFiles, {
    createdBy: "Admin",
  })

  const [adminCount, setAdminCount] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [totalCount, setTotalCOunt] = useState(null);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await fetch('/api/intellinote/get-user-count');
        const data = await response.json();
        setUserCount(data.userCount);
        setAdminCount(data.adminCount);
        setTotalCOunt(data.totalCount);
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    };

    fetchUserCount();
  }, []);


  // Function to render count or spinner
  const renderCount = (count: number | null | undefined) => {
    return count !== null && count !== undefined ? count : <Loader2 className="h-5 w-5 animate-spin text-gray-500" />;
  };


  // Sample data for charts - replace with actual data from your backend
  const mostUsedNotes = [
    { name: "Physics Notes", count: 45 },
    { name: "Chemistry Formulas", count: 38 },
    { name: "Math Equations", count: 32 },
    { name: "Biology Terms", count: 28 },
    { name: "History Dates", count: 22 },
  ]

  const keywordAnalytics = [
    { keyword: "quantum physics", count: 67 },
    { keyword: "organic chemistry", count: 54 },
    { keyword: "calculus", count: 48 },
    { keyword: "cell biology", count: 41 },
    { keyword: "world war 2", count: 36 },
  ]

  const chartConfig = {
    notes: {
      label: "Notes Usage",
      color: "hsl(var(--chart-1))",
      icon: BookOpen,
    },
    keywords: {
      label: "Keywords",
      color: "hsl(var(--chart-2))",
      icon: Search,
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="upgrade">Upgrade</TabsTrigger>
          <TabsTrigger value="upload">Notes Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{renderCount(fileList?.length)}</div>
                <p className="text-xs text-muted-foreground">
                  {fileList?.length !== null && fileList?.length !== undefined
                    ? fileList.length === 100
                      ? "Maximum limit reached"
                      : `${100 - fileList.length} slots remaining`
                    : "Calculating remaining slots..."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{renderCount(totalCount)}</div>
                <p className="text-xs text-muted-foreground">Active in the last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Distribution</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-md font-bold flex items-center gap-2">
                  <span>Admins: {renderCount(adminCount)}</span>
                  <Separator orientation="vertical" className="h-5" />
                  <span>Users: {renderCount(userCount)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Active user distribution</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Keyword</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold truncate">{keywordAnalytics[0]?.keyword || "No data"}</div>
                <p className="text-xs text-muted-foreground">{keywordAnalytics[0]?.count || 0} searches</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Most Used Notes</CardTitle>
                <CardDescription>Top 5 most accessed notes by users</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mostUsedNotes}>
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
                      <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-notes)" radius={[4, 4, 0, 0]} name="Notes Usage" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Keywords</CardTitle>
                <CardDescription>Most searched keywords in questions</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={keywordAnalytics} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="keyword" type="category" tickLine={false} axisLine={false} width={120} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-keywords)" radius={[0, 4, 4, 0]} name="Keywords" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upgrade" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upgrade your plan</CardTitle>
              <CardDescription>Detailed analysis of search patterns and topics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[430px]">
                <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-5 lg:px-8">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-center md:gap-8">

                    <div className="rounded-2xl border border-zinc-500 p-6 shadow-xs sm:px-8 lg:p-12">
                      <div className="text-center">
                        <h2 className="text-lg font-medium text-gray-900">
                          Free
                          <span className="sr-only">Plan</span>
                        </h2>

                        <p className="mt-2 sm:mt-4">
                          <strong className="text-3xl font-bold text-gray-900 sm:text-4xl"> 0$ </strong>

                          <span className="text-sm font-medium text-gray-700">/month</span>
                        </p>
                      </div>

                      <ul className="mt-6 space-y-2">
                        <li className="flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-5 text-indigo-700"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>

                          <span className="text-gray-700"> 10 PDF Upload </span>
                        </li>

                        <li className="flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-5 text-indigo-700"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>

                          <span className="text-gray-700"> Unlimited Notes Taking </span>
                        </li>

                        <li className="flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-5 text-indigo-700"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>

                          <span className="text-gray-700"> Email support </span>
                        </li>

                        <li className="flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-5 text-indigo-700"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>

                          <span className="text-gray-700"> Help center access </span>
                        </li>
                      </ul>

                      <a
                        href="/protected/intelli-notes/dashboard"
                        className="mt-8 block rounded-full border border-indigo-600 bg-white px-12 py-3 text-center text-sm font-medium text-indigo-600 hover:ring-1 hover:ring-indigo-600 focus:ring-3 focus:outline-hidden"
                      >
                        Current Plan
                      </a>
                    </div>

                    <div className="rounded-2xl border border-indigo-600 p-6 shadow-xs sm:px-8 lg:p-12">
                      <div className="text-center">
                        <h2 className="text-lg font-medium text-gray-900">
                          Unlimited
                          <span className="sr-only">Plan</span>
                        </h2>

                        <p className="mt-2 sm:mt-4">
                          <strong className="text-3xl font-bold text-gray-900 sm:text-4xl"> 19.99$ </strong>

                          <span className="text-sm font-medium text-gray-700">/One Time</span>
                        </p>
                      </div>

                      <ul className="mt-6 space-y-2">
                        <li className="flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-5 text-indigo-700"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>

                          <span className="text-gray-700"> Unlimted PDF Upload </span>
                        </li>

                        <li className="flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-5 text-indigo-700"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>

                          <span className="text-gray-700"> Unlimited Notes Taking </span>
                        </li>

                        <li className="flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-5 text-indigo-700"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>

                          <span className="text-gray-700"> Email support </span>
                        </li>

                        <li className="flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-5 text-indigo-700"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>

                          <span className="text-gray-700"> Help center access </span>
                        </li>
                      </ul>

                      <a
                        href="/protected/intelli-notes/admin/payment"
                        className="mt-8 block rounded-full border border-indigo-600 bg-indigo-600 px-12 py-3 text-center text-sm font-medium text-white hover:ring-1 hover:ring-indigo-600 focus:ring-3 focus:outline-hidden"
                      >
                        Get Started
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Note uploader</CardTitle>
              <CardDescription>Upload your reference notes for the lectures in here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="ml-10 h-[150px] w-[80%]">
                {user && user.user_metadata?.role === "admin" && (
                  <UploadPdfDialog
                    isMaxFile={(fileList?.length ?? 0) >= 10 ? true : false}
                  >
                    <Button className="w-[50%] gap-2 m-5">
                      <Upload className="h-4 w-4" /> Upload PDF
                    </Button>
                  </UploadPdfDialog>

                )}

              </div>
              <div className="mt-5 w-[50%]">
                <Progress value={((fileList?.length ?? 0) / 10) * 100} />
                <p className="text-sm mt-1">{fileList?.length} Uploaded out of 10</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}

