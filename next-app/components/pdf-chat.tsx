'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bell,
  FileText,
  History,
  Layout,
  LogOut,
  MessageSquare,
  Mic,
  PanelLeftClose,
  Settings,
  Upload,
  User,
} from "lucide-react"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient('your-supabase-url', 'your-supabase-anon-key')

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function PdfChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('pdfs')
        .upload(`${Date.now()}-${file.name}`, file)
      
      if (error) {
        console.error('Error uploading file:', error)
        return
      }
      
      // Add system message about the uploaded PDF
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `PDF "${file.name}" has been uploaded. You can now ask questions about its contents.`
      }])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call Gemini API (implement your API call here)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          pdfUrl: selectedFile ? URL.createObjectURL(selectedFile) : null
        })
      })

      const data = await response.json()
      
      // Add assistant message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response
      }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-64 border-r bg-muted/50 p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">PDF Chat</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Layout className="h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <History className="h-4 w-4" />
            History
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </nav>

        <Button variant="ghost" className="justify-start gap-2 mt-auto">
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <PanelLeftClose className="h-5 w-5" />
            <h2 className="font-semibold">AI Chat Helper</h2>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="search"
              placeholder="Search messages..."
              className="w-64"
            />
            <Button size="icon" variant="ghost">
              <Bell className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="ghost">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 flex">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 mb-4 ${
                    message.role === 'assistant' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <Card className={`p-3 max-w-[80%] ${
                    message.role === 'assistant' 
                      ? 'bg-muted' 
                      : 'bg-primary text-primary-foreground'
                  }`}>
                    {message.content}
                  </Card>
                </div>
              ))}
            </ScrollArea>

            <footer className="p-4 border-t">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="shrink-0"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="h-5 w-5" />
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </Button>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="min-h-[44px] flex-1"
                  rows={1}
                />
                <Button type="button" size="icon" variant="ghost" className="shrink-0">
                  <Mic className="h-5 w-5" />
                </Button>
                <Button type="submit" disabled={isLoading}>
                  Send
                </Button>
              </form>
            </footer>
          </div>

          {/* Right Sidebar */}
          <div className="w-64 border-l p-4">
            <h3 className="font-semibold mb-4">Chat History</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-sm">
                Previous Chat 1
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm">
                Previous Chat 2
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}