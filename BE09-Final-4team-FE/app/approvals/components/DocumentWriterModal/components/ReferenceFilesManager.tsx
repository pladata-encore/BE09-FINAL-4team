"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Download } from "lucide-react"
import { ReferenceFilesManagerProps } from "../types"

export function ReferenceFilesManager({
  referenceFiles
}: ReferenceFilesManagerProps) {
  const handleDownload = (file: any) => {
    console.log("다운로드:", file.fileName, file.fileId)
    const downloadUrl = `/api/files/${file.fileId}/download`
    window.open(downloadUrl, '_blank')
  }

  if (!referenceFiles || referenceFiles.length === 0) {
    return null
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {referenceFiles.map((file) => (
          <div key={file.fileId} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900 truncate">{file.fileName}</p>
              {/* <p className="text-xs text-blue-700 mt-1">{(file.fileSize / 1024).toFixed(1)}KB • {file.contentType}</p> */}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(file)}
                  className="ml-3 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{file.fileName}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        ))}
      </div>
    </TooltipProvider>
  )
}