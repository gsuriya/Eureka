"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileUp, LinkIcon, ArrowLeft, FileText, UploadIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleFileUpload = async () => {
    if (!file) return

    setIsUploading(true)

    // Simulate upload
    setTimeout(() => {
      setIsUploading(false)
      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded and is being processed.`,
      })

      // Redirect to reader view (in a real app)
      // router.push('/reader/123');
    }, 2000)
  }

  const handleUrlSubmit = async () => {
    if (!url) return

    setIsUploading(true)

    // Simulate processing
    setTimeout(() => {
      setIsUploading(false)
      toast({
        title: "Paper imported",
        description: "The paper has been imported and is being processed.",
      })

      // Redirect to reader view (in a real app)
      // router.push('/reader/123');
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 paper-texture">
      <header className="border-b shadow-sm bg-white dark:bg-gray-950">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1.5 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                PaperMind
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="flex flex-col items-center space-y-6 text-center mb-10">
          <div className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 text-blue-600 dark:text-blue-400">
            <UploadIcon className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-serif font-bold">Upload Research Paper</h1>
          <p className="text-gray-500 max-w-md">
            Upload a PDF file or provide a URL to a research paper to get started with PaperMind's advanced features.
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-lg">
            <TabsTrigger
              value="upload"
              className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Upload PDF
            </TabsTrigger>
            <TabsTrigger
              value="url"
              className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Import from URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card className="border-2 shadow-elegant overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col items-center">
                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 w-full text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                        <FileUp className="h-12 w-12 text-blue-500 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-lg">
                          {file ? file.name : "Drag and drop your PDF here or click to browse"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF up to 50MB"}
                        </p>
                      </div>
                    </div>
                    <Input id="file-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                  </div>

                  <div className="p-6 w-full bg-gray-50 dark:bg-gray-900/50">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
                      size="lg"
                      onClick={handleFileUpload}
                      disabled={!file || isUploading}
                    >
                      {isUploading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        "Upload Paper"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="url">
            <Card className="border-2 shadow-elegant overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col space-y-6">
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="paper-url" className="text-sm font-medium">
                      Paper URL
                    </label>
                    <div className="flex">
                      <div className="relative flex-grow">
                        <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <Input
                          id="paper-url"
                          placeholder="https://arxiv.org/pdf/2303.08774.pdf"
                          className="pl-10 border-2 focus:border-blue-500 transition-colors"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Supports direct PDF links from arXiv, ACL Anthology, IEEE Xplore, and other academic repositories
                    </p>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
                    size="lg"
                    onClick={handleUrlSubmit}
                    disabled={!url || isUploading}
                  >
                    {isUploading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Importing...
                      </>
                    ) : (
                      "Import Paper"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Want to try it out first?{" "}
            <Link
              href="/reader/demo"
              className="font-medium text-blue-600 hover:text-blue-700 underline underline-offset-4"
            >
              View a demo paper
            </Link>
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center p-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-medium mb-2">Multiple Formats</h3>
            <p className="text-sm text-gray-500">Support for PDF, arXiv, DOI, and direct URLs to academic papers.</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full mb-4">
              <BookOpen className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="font-medium mb-2">Automatic Extraction</h3>
            <p className="text-sm text-gray-500">
              We extract metadata, citations, and structure for better organization.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full mb-4">
              <LinkIcon className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-medium mb-2">Browser Extension</h3>
            <p className="text-sm text-gray-500">
              Save papers directly from journal websites with our browser extension.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
