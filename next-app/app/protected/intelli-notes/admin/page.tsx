"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUserFromCookie } from "@/utils/restrictClient"
import { redirect } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { FileText, Users, BookOpen, Search } from "lucide-react"
import { useEffect, useState } from "react";
import UploadPdfDialog from "./_components/upload-pdf-dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { chatSession } from "@/configs/ai-model";
import { generates } from "@/configs/generates";


export default function AdminPanel() {
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

  const topKeywords = useQuery(api.notes.GetTopKeywords);
  const keywordAnalytics = topKeywords || [];

  const latestNotes = useQuery(api.notes.GetAllNotes) || [];
  const chartConfig = {
    keywords: {
      label: "Keywords",
      color: "hsl(var(--chart-2))",
      icon: Search,
    },
  }

  const generateTopics = async () => {
    if (!keywordAnalytics || keywordAnalytics.length === 0) {
      console.warn("No keywords available for topic generation.");
      return [];
    }

    // Extract keywords for the prompt
    const keywordsList = keywordAnalytics.map(k => k.keyword).join(", ");

    const TEXT = generates.TopicSugesstion([keywordsList]);

    try {
      const AiModelResult = await chatSession.sendMessage(TEXT);
      const generatedText = AiModelResult.response.text();

      // Convert AI response into a structured list
      return generatedText.split("\n").filter(line => line.trim() !== "");
    } catch (error) {
      console.error("Error generating topics:", error);
      return [];
    }
  };
  const [generatedTopics, setGeneratedTopics] = useState<string[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      const topics = await generateTopics();
      setGeneratedTopics(topics);
    };

    fetchTopics();
  }, [keywordAnalytics]); // Re-run when new keywords are available


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="upload">Notes Upload</TabsTrigger>
          <TabsTrigger value="upgrade">Upgrade</TabsTrigger>

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
                <div className="text-2xl font-bold truncate"> {keywordAnalytics.length > 0 ? keywordAnalytics[0]?.keyword : "No data"}</div>
                <p className="text-xs text-muted-foreground">
                  {keywordAnalytics.length > 0 ? `${keywordAnalytics[0]?.count} searches` : "0 searches"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Latest Notes Created */}
            <Card className="col-span-3">
              <CardContent>
                <h2 className="text-xl font-bold mt-4">Latest Notes Created</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>File upload</TableHead>
                      <TableHead>File Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestNotes.map((note) => (
                      <TableRow key={note._id}>
                        <TableCell>
                          {new Date(note._creationTime).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>{note.createdBy}</TableCell>
                        <TableCell>{note.fileName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>


              <Separator orientation="horizontal" />
              {/* Recommanded content */}
              <CardContent>
                <h2 className="text-xl font-bold mt-4">Recommended Topics for Upload</h2>
                {generatedTopics.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 mt-3">
                    {generatedTopics.map((topic, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg shadow-sm">

                        <span className="text-gray-700 font-medium">{topic}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-4 text-gray-500 bg-gray-100 rounded-lg mt-3">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Generating topics...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top keywords */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Top Keywords</CardTitle>
                <CardDescription>Most searched keywords in questions</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer className="h-[350px]" config={chartConfig}>
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
                    isMaxFile={(fileList?.length ?? 0) >= 5 ? true : false}
                  >
                    <Button className="w-[50%] gap-2 m-5">
                      <Upload className="h-4 w-4" /> Upload PDF
                    </Button>
                  </UploadPdfDialog>

                )}

              </div>
              <div className="mt-5 w-[50%]">
                <Progress value={((fileList?.length ?? 0) / 5) * 100} />
                <p className="text-sm mt-1">{fileList?.length} Uploaded out of 5</p>
              </div>
            </CardContent>
          </Card>
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

                          <span className="text-gray-700"> Limited Videos Uploads</span>
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

                          <span className="text-gray-700"> Limited Doubt Clarify </span>
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

                          <span className="text-gray-700"> Single Co-Lab Meetings</span>
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

                          <span className="text-gray-700"> 5 PDF Uploads with Note Taking </span>
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

                          <span className="text-gray-700"> Upload Videos Directly </span>
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

                          <span className="text-gray-700"> Ask Unlimted Doubts </span>
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

                          <span className="text-gray-700"> Multiple Co-Lab Meetings </span>
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

                          <span className="text-gray-700"> 20 PDF Uploads with Note Taking </span>
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




      </Tabs>
    </div>
  )
}

