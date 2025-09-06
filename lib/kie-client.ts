interface KIETask {
  taskId: string
  model: string
  state: 'pending' | 'processing' | 'success' | 'failed'
  resultJson?: string
  failMsg?: string
}

interface KIETaskResult {
  resultUrls: string[]
}

interface AnalysisData {
  crack_width: string
  crack_length: string
  crack_type: string
  risk_level: 'low' | 'moderate' | 'high'
}

export class KIEClient {
  private apiKey: string
  private baseUrl = 'https://api.kie.ai/api/v1'

  constructor() {
    this.apiKey = process.env.KIE_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('KIE_API_KEY is required')
    }
  }

  async processImage(imageUrls: string[], analysisData?: AnalysisData): Promise<string[]> {
    try {
      // Create task
      const taskId = await this.createTask(imageUrls, analysisData)
      
      // Poll for completion
      const result = await this.pollTaskResult(taskId)
      
      return result
    } catch (error) {
      console.error('KIE image processing failed:', error)
      throw error
    }
  }

  private async createTask(imageUrls: string[], analysisData?: AnalysisData): Promise<string> {
    const response = await fetch(`${this.baseUrl}/jobs/createTask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'google/nano-banana-edit',
        callBackUrl: '', // Optional callback URL
        input: {
          prompt: analysisData ? 
            `Add minimal AR-style floating indicators around the crack. Show these exact measurements with clean, simple floating labels:
- Width: ${analysisData.crack_width}
- Length: ${analysisData.crack_length}
- Type: ${analysisData.crack_type}
- Risk Level: ${analysisData.risk_level.toUpperCase()}

Use thin connecting lines pointing to the crack. Keep it minimal and professional like iPhone measuring app style. Use white/semi-transparent backgrounds for labels with clear, readable text.` :
            'Add minimal AR-style floating indicators around the crack. Show clean, simple measurements with thin connecting lines. Keep it minimal like iPhone measuring app style.',
          image_urls: imageUrls,
          output_format: 'png',
          image_size: '16:9',
          enable_translation: false
        }
      })
    })

    if (!response.ok) {
      throw new Error(`KIE API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.code !== 200 || !data.data?.taskId) {
      throw new Error(`KIE task creation failed: ${data.message || 'Unknown error'}`)
    }

    return data.data.taskId
  }

  private async pollTaskResult(taskId: string, maxAttempts = 30, intervalMs = 2000): Promise<string[]> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(
          `${this.baseUrl}/jobs/recordInfo?taskId=${taskId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`
            }
          }
        )

        if (!response.ok) {
          throw new Error(`KIE polling error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        
        if (data.code !== 200) {
          throw new Error(`KIE polling failed: ${data.message || 'Unknown error'}`)
        }

        const task = data.data as KIETask

        if (task.state === 'success' && task.resultJson) {
          const result = JSON.parse(task.resultJson) as KIETaskResult
          return result.resultUrls || []
        }

        if (task.state === 'failed') {
          throw new Error(`KIE task failed: ${task.failMsg || 'Unknown error'}`)
        }

        // Task is still processing, wait before next poll
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, intervalMs))
        }

      } catch (error) {
        console.error(`KIE polling attempt ${attempt + 1} failed:`, error)
        
        if (attempt === maxAttempts - 1) {
          throw error
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, intervalMs))
      }
    }

    throw new Error(`KIE task polling timeout after ${maxAttempts} attempts`)
  }
}

export const kieClient = new KIEClient()