import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { ArrowLeft, Download, Camera } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import PDFExportButton from '@/components/PDFExportButton'

async function getCrackById(id: string) {
  const { data: crack, error } = await supabase
    .from('cracks')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !crack) {
    return null
  }

  return crack
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CrackAnalysisPage({ params }: PageProps) {
  const { id } = await params
  const crack = await getCrackById(id)

  if (!crack) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/examples"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回案例展示
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                裂痕分析报告
              </h1>
              <p className="text-gray-600">
                分析时间: {new Date(crack.created_at).toLocaleString('zh-CN')}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Risk Level Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm ${
                crack.risk_level === 'high' ? 'bg-red-50 border-red-200 text-red-700' : 
                crack.risk_level === 'moderate' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 
                'bg-green-50 border-green-200 text-green-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  crack.risk_level === 'high' ? 'bg-red-500' : 
                  crack.risk_level === 'moderate' ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}></div>
                <span className="font-medium">
                  {crack.risk_level === 'high' ? '高风险' :
                   crack.risk_level === 'moderate' ? '中风险' : '低风险'}
                </span>
              </div>

              <PDFExportButton crack={crack} />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">分析图片</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crack.image_urls.map((imageUrl: string, index: number) => (
              <div key={index} className="relative h-64 bg-gray-100 rounded-xl overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={`裂痕图片 ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>

        {/* User Input */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">用户描述</h2>
          
          {crack.user_question && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">问题描述：</h3>
              <p className="text-gray-600">{crack.user_question}</p>
            </div>
          )}
          
          {!crack.user_question && crack.description && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">描述：</h3>
              <p className="text-gray-600">{crack.description}</p>
            </div>
          )}
          
          {crack.additional_info && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">补充信息：</h3>
              <p className="text-gray-600">{crack.additional_info}</p>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Camera className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">结构工程师分析报告</h2>
          </div>

          {crack.detailed_analysis ? (
            <div className="space-y-6">
              {/* Analysis Summary */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm font-medium text-gray-700">置信度:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {crack.detailed_analysis.confidence}%
                  </span>
                  <span className="text-sm font-medium text-gray-700">发现裂痕:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {crack.detailed_analysis.crackCount} 处
                  </span>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-2">分析摘要</h3>
                <p className="text-gray-700 leading-relaxed">{crack.detailed_analysis.aiNotes}</p>
              </div>

              {/* Detailed Findings */}
              {crack.detailed_analysis.findings && crack.detailed_analysis.findings.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">详细发现</h3>
                  <div className="space-y-4">
                    {crack.detailed_analysis.findings.map((finding: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-medium text-gray-900">{finding.type}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            finding.severity === 'High' ? 'bg-red-100 text-red-700' :
                            finding.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {finding.severity}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">长度:</span> {finding.length}
                          </div>
                          <div>
                            <span className="font-medium">宽度:</span> {finding.width}
                          </div>
                        </div>
                        
                        <p className="text-gray-700">{finding.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {crack.detailed_analysis.recommendations && crack.detailed_analysis.recommendations.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">建议行动</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {crack.detailed_analysis.recommendations.map((recommendation: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Fallback for old records without detailed analysis
            <div>
              <h3 className="font-medium text-gray-900 mb-2">AI 分析结果</h3>
              <p className="text-gray-700 leading-relaxed">{crack.ai_notes}</p>
            </div>
          )}

          {/* Expert Notes */}
          {crack.expert_notes && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">专家补充意见</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800">{crack.expert_notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            <strong>免责声明：</strong>本报告由 AI 技术生成，仅供参考。如发现严重结构问题，请及时咨询专业结构工程师进行现场评估。
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}