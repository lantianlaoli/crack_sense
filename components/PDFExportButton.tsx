'use client'

import { Download } from 'lucide-react'
import { generatePDFReport, PDFReportData } from '@/lib/pdf-utils'
import { CrackRecord } from '@/lib/supabase'

interface PDFExportButtonProps {
  crack: CrackRecord
  className?: string
}

export default function PDFExportButton({ crack, className = '' }: PDFExportButtonProps) {
  const handleExport = () => {
    if (!crack.detailed_analysis) {
      alert('该分析报告不支持PDF导出')
      return
    }

    const pdfData: PDFReportData = {
      analysis: crack.detailed_analysis,
      userQuestion: crack.user_question || crack.description,
      additionalInfo: crack.additional_info,
      timestamp: new Date(crack.created_at),
      userName: '案例用户'
    }
    
    generatePDFReport(pdfData)
  }

  if (!crack.detailed_analysis) {
    return null
  }

  return (
    <button
      onClick={handleExport}
      className={`inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ${className}`}
    >
      <Download className="w-4 h-4" />
      导出PDF
    </button>
  )
}