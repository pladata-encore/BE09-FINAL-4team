'use client'

import { FileText, Eye, Download } from 'lucide-react'
import { Button } from './button'
import { Attachment } from './attachments-manager'

interface AttachmentsSectionProps {
  attachments: Attachment[]
  onPreview?: (attachment: Attachment) => void
  onDownload?: (attachment: Attachment) => void
  className?: string
}

export function AttachmentsSection({ 
  attachments, 
  onPreview, 
  onDownload, 
  className = '' 
}: AttachmentsSectionProps) {
  const handlePreview = (attachment: Attachment) => {
    if (onPreview) {
      onPreview(attachment)
    } else if (attachment.url) {
      window.open(attachment.url, '_blank')
    }
  }

  const handleDownload = (attachment: Attachment) => {
    if (onDownload) {
      onDownload(attachment)
    } else if (attachment.url) {
      const link = document.createElement('a')
      link.href = attachment.url
      link.download = attachment.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (attachments.length === 0) {
    return (
      <div className={`text-sm text-gray-500 text-center py-4 ${className}`}>
        첨부파일이 없습니다.
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="space-y-1">
        {attachments.map((file, index) => (
          <div 
            key={file.id || `attachment-${index}`} 
            className="flex items-center justify-between p-2 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => handleDownload(file)}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                {file.size && <p className="text-xs text-gray-500">{file.size}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePreview(file)
                }}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload(file)
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
