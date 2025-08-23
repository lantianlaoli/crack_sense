import jsPDF from 'jspdf'
import { DetailedAnalysis } from './supabase'

export interface PDFReportData {
  analysis: DetailedAnalysis
  userQuestion?: string
  additionalInfo?: string
  images?: string[]
  timestamp: Date
  userName?: string
}

export function generatePDFReport(data: PDFReportData): void {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.width
  const pageHeight = pdf.internal.pageSize.height
  const margin = 20
  let currentY = margin

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredHeight: number) => {
    if (currentY + requiredHeight > pageHeight - margin) {
      pdf.addPage()
      currentY = margin
      return true
    }
    return false
  }

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    pdf.setFontSize(fontSize)
    const lines = pdf.splitTextToSize(text, maxWidth)
    const lineHeight = fontSize * 0.5
    
    checkPageBreak(lines.length * lineHeight)
    
    lines.forEach((line: string, index: number) => {
      pdf.text(line, x, currentY + (index * lineHeight))
    })
    
    currentY += (lines.length * lineHeight) + 8
    return lines.length * lineHeight
  }

  // Helper function to add section header
  const addSectionHeader = (title: string, fontSize: number = 16) => {
    checkPageBreak(15)
    pdf.setFontSize(fontSize)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(20, 20, 20)
    pdf.text(title, margin, currentY)
    currentY += 12
    
    // Add subtle underline
    pdf.setDrawColor(200, 200, 200)
    pdf.setLineWidth(0.5)
    pdf.line(margin, currentY - 2, margin + 60, currentY - 2)
    currentY += 8
  }

  // Company Header
  pdf.setFillColor(20, 20, 20)
  pdf.rect(0, 0, pageWidth, 25, 'F')
  
  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(255, 255, 255)
  pdf.text('CrackSense', margin, 15)
  
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Professional Structural Analysis Report', margin, 22)
  
  currentY = 40
  
  // Report Title
  pdf.setFontSize(24)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(20, 20, 20)
  pdf.text('Structural Engineering', margin, currentY)
  currentY += 8
  pdf.text('Crack Analysis Report', margin, currentY)
  currentY += 20

  // Report metadata box
  pdf.setFillColor(248, 250, 252)
  pdf.setDrawColor(226, 232, 240)
  pdf.roundedRect(margin, currentY, pageWidth - 2 * margin, 25, 3, 3, 'FD')
  
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(75, 85, 99)
  
  const dateStr = data.timestamp.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  pdf.text(`Report Date: ${dateStr}`, margin + 5, currentY + 8)
  if (data.userName) {
    pdf.text(`Client: ${data.userName}`, margin + 5, currentY + 15)
  }
  pdf.text(`Analysis ID: CRK-${data.timestamp.getTime().toString().slice(-6)}`, margin + 5, currentY + 22)
  
  currentY += 35

  // Executive Summary Section
  addSectionHeader('EXECUTIVE SUMMARY')

  // Risk assessment box
  const riskLevel = data.analysis.riskLevel
  const riskText = riskLevel === 'high' ? 'HIGH RISK' : 
                   riskLevel === 'moderate' ? 'MODERATE RISK' : 'LOW RISK'
  const riskColor = riskLevel === 'high' ? [239, 68, 68] : 
                    riskLevel === 'moderate' ? [251, 191, 36] : [34, 197, 94]
  const bgColor = riskLevel === 'high' ? [254, 242, 242] : 
                  riskLevel === 'moderate' ? [255, 251, 235] : [236, 253, 245]

  // Risk assessment card
  pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2])
  pdf.setDrawColor(riskColor[0], riskColor[1], riskColor[2])
  pdf.roundedRect(margin, currentY, pageWidth - 2 * margin, 30, 5, 5, 'FD')
  
  // Risk badge
  pdf.setFillColor(riskColor[0], riskColor[1], riskColor[2])
  pdf.roundedRect(margin + 10, currentY + 8, 35, 10, 3, 3, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  pdf.text(riskText, margin + 27.5, currentY + 15, { align: 'center' })
  
  // Summary stats
  pdf.setTextColor(55, 65, 81)
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Confidence Level: ${data.analysis.confidence}%`, margin + 55, currentY + 12)
  pdf.text(`Cracks Identified: ${data.analysis.crackCount}`, margin + 55, currentY + 20)
  pdf.text(`Analysis Model: Gemini AI Vision`, margin + 55, currentY + 28)
  
  currentY += 40

  // Client Information Section
  if (data.userQuestion || data.additionalInfo) {
    addSectionHeader('CLIENT INFORMATION')

    if (data.userQuestion) {
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(55, 65, 81)
      pdf.text('Problem Description:', margin, currentY)
      currentY += 8
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(75, 85, 99)
      addWrappedText(data.userQuestion, margin + 5, currentY, pageWidth - 2 * margin - 5, 10)
    }

    if (data.additionalInfo) {
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(55, 65, 81)
      pdf.text('Additional Information:', margin, currentY)
      currentY += 8
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(75, 85, 99)
      addWrappedText(data.additionalInfo, margin + 5, currentY, pageWidth - 2 * margin - 5, 10)
    }
  }

  // Analysis Summary
  addSectionHeader('PROFESSIONAL ANALYSIS')
  
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(75, 85, 99)
  addWrappedText(data.analysis.aiNotes, margin, currentY, pageWidth - 2 * margin, 11)

  // Detailed Findings
  if (data.analysis.findings && data.analysis.findings.length > 0) {
    addSectionHeader('DETAILED FINDINGS')

    data.analysis.findings.forEach((finding, index) => {
      checkPageBreak(50)
      
      // Finding card background
      pdf.setFillColor(249, 250, 251)
      pdf.setDrawColor(229, 231, 235)
      pdf.roundedRect(margin, currentY, pageWidth - 2 * margin, 35, 3, 3, 'FD')
      
      // Finding header
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(31, 41, 55)
      pdf.text(`Finding ${index + 1}: ${finding.type}`, margin + 8, currentY + 10)

      // Severity and measurements row
      const severityColor = finding.severity === 'High' ? [239, 68, 68] : 
                           finding.severity === 'Moderate' ? [251, 191, 36] : [34, 197, 94]
      
      // Severity badge
      pdf.setFillColor(severityColor[0], severityColor[1], severityColor[2])
      pdf.roundedRect(margin + 8, currentY + 15, 25, 8, 2, 2, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.text(finding.severity.toUpperCase(), margin + 20.5, currentY + 20.5, { align: 'center' })
      
      // Measurements
      pdf.setTextColor(75, 85, 99)
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Length: ${finding.length}`, margin + 40, currentY + 19)
      pdf.text(`Width: ${finding.width}`, margin + 90, currentY + 19)
      
      // Description
      pdf.setTextColor(55, 65, 81)
      pdf.setFontSize(9)
      const descLines = pdf.splitTextToSize(finding.description, pageWidth - 2 * margin - 16)
      pdf.text(descLines.slice(0, 2), margin + 8, currentY + 28) // Limit to 2 lines
      
      currentY += 45
    })
  }

  // Recommendations
  if (data.analysis.recommendations && data.analysis.recommendations.length > 0) {
    addSectionHeader('RECOMMENDATIONS')

    data.analysis.recommendations.forEach((recommendation, index) => {
      checkPageBreak(20)
      
      // Recommendation item background
      pdf.setFillColor(254, 249, 195)
      pdf.setDrawColor(251, 191, 36)
      pdf.roundedRect(margin, currentY, pageWidth - 2 * margin, 15, 2, 2, 'FD')
      
      // Priority number
      pdf.setFillColor(251, 191, 36)
      pdf.circle(margin + 8, currentY + 7.5, 4, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text((index + 1).toString(), margin + 8, currentY + 9.5, { align: 'center' })
      
      // Recommendation text
      pdf.setTextColor(92, 83, 8)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      const recText = pdf.splitTextToSize(recommendation, pageWidth - 2 * margin - 25)
      pdf.text(recText.slice(0, 2), margin + 18, currentY + 6) // Limit to 2 lines
      
      currentY += 25
    })
  }

  // Add page numbers to all pages
  const pageCount = (pdf as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i)
    
    // Footer background
    pdf.setFillColor(248, 250, 252)
    pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F')
    
    // Disclaimer
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(107, 114, 128)
    pdf.text('This report is generated by CrackSense AI for reference only. Consult a professional structural engineer for critical issues.', 
             pageWidth / 2, pageHeight - 12, { align: 'center' })
    
    // Page number
    pdf.setTextColor(156, 163, 175)
    pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 5, { align: 'right' })
    
    // Company logo text
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'bold')
    pdf.text('CrackSense', margin, pageHeight - 5)
  }

  // Generate filename with proper naming
  const timestamp = data.timestamp.toISOString().slice(0, 10)
  const filename = `CrackSense-Analysis-Report-${timestamp}-${data.timestamp.getTime().toString().slice(-6)}.pdf`
  
  // Download the PDF
  pdf.save(filename)
}