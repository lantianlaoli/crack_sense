'use server'

import { supabase, UserCredits, CreditTransaction, PDFExport } from '@/lib/supabase'

// Get user's current credits
export async function getUserCredits(userId: string): Promise<{
  success: boolean
  credits?: UserCredits
  error?: string
}> {
  try {
    const { data: credits, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to fetch user credits:', error)
      return {
        success: false,
        error: 'Failed to fetch credits'
      }
    }

    if (!credits) {
      return {
        success: true,
        credits: undefined
      }
    }

    return {
      success: true,
      credits
    }
  } catch (error) {
    console.error('Get user credits error:', error)
    return {
      success: false,
      error: 'Something went wrong'
    }
  }
}

// Initialize credits for new user with free starter credits
export async function initializeUserCredits(userId: string, initialCredits: number = 20): Promise<{
  success: boolean
  credits?: UserCredits
  error?: string
}> {
  try {
    const { data: credits, error } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        credits_remaining: initialCredits
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to initialize user credits:', error)
      return {
        success: false,
        error: 'Failed to initialize credits'
      }
    }

    console.log(`✅ Initialized ${initialCredits} credits for new user:`, userId)
    
    return {
      success: true,
      credits
    }
  } catch (error) {
    console.error('Initialize user credits error:', error)
    return {
      success: false,
      error: 'Something went wrong'
    }
  }
}

// Check if user has enough credits for an operation
export async function checkCredits(userId: string, requiredCredits: number): Promise<{
  success: boolean
  hasEnoughCredits?: boolean
  currentCredits?: number
  error?: string
}> {
  try {
    const result = await getUserCredits(userId)
    
    if (!result.success) {
      return {
        success: false,
        error: result.error
      }
    }

    if (!result.credits) {
      // This should not happen with UserInitializer, but handle gracefully
      console.warn('User credits not found, this suggests initialization failed:', userId)
      return {
        success: false,
        error: 'User credits not initialized. Please refresh the page and try again.'
      }
    }

    const currentCredits = result.credits.credits_remaining
    const hasEnoughCredits = currentCredits >= requiredCredits

    return {
      success: true,
      hasEnoughCredits,
      currentCredits
    }
  } catch (error) {
    console.error('Check credits error:', error)
    return {
      success: false,
      error: 'Something went wrong'
    }
  }
}

// Deduct credits from user account
export async function deductCredits(userId: string, creditsToDeduct: number): Promise<{
  success: boolean
  remainingCredits?: number
  error?: string
}> {
  try {
    // First check if user has enough credits
    const checkResult = await checkCredits(userId, creditsToDeduct)
    
    if (!checkResult.success) {
      return {
        success: false,
        error: checkResult.error
      }
    }

    if (!checkResult.hasEnoughCredits) {
      return {
        success: false,
        error: 'Insufficient credits'
      }
    }

    // Deduct credits
    const { data: updatedCredits, error } = await supabase
      .from('user_credits')
      .update({
        credits_remaining: (checkResult.currentCredits || 0) - creditsToDeduct
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Failed to deduct credits:', error)
      return {
        success: false,
        error: 'Failed to deduct credits'
      }
    }

    return {
      success: true,
      remainingCredits: updatedCredits.credits_remaining
    }
  } catch (error) {
    console.error('Deduct credits error:', error)
    return {
      success: false,
      error: 'Something went wrong'
    }
  }
}

// Add credits to user account (for purchases)
export async function addCredits(userId: string, creditsToAdd: number, creemId?: string): Promise<{
  success: boolean
  newBalance?: number
  error?: string
}> {
  try {
    // Get current credits or initialize if needed
    const currentResult = await getUserCredits(userId)
    
    if (!currentResult.success) {
      return {
        success: false,
        error: currentResult.error
      }
    }

    let currentCredits = 0
    let shouldUpdate = false

    if (currentResult.credits) {
      currentCredits = currentResult.credits.credits_remaining
      shouldUpdate = true
    }

    const newBalance = currentCredits + creditsToAdd

    if (shouldUpdate) {
      // Update existing record
      const { data: updatedCredits, error } = await supabase
        .from('user_credits')
        .update({
          credits_remaining: newBalance,
          creem_id: creemId || null
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Failed to update credits:', error)
        return {
          success: false,
          error: 'Failed to update credits'
        }
      }

      return {
        success: true,
        newBalance: updatedCredits.credits_remaining
      }
    } else {
      // Create new record
      const { data: newCredits, error } = await supabase
        .from('user_credits')
        .insert({
          user_id: userId,
          credits_remaining: newBalance,
          creem_id: creemId || null
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create credits record:', error)
        return {
          success: false,
          error: 'Failed to create credits record'
        }
      }

      return {
        success: true,
        newBalance: newCredits.credits_remaining
      }
    }
  } catch (error) {
    console.error('Add credits error:', error)
    return {
      success: false,
      error: 'Something went wrong'
    }
  }
}

// Record a credit transaction for history tracking
export async function recordCreditTransaction(
  userId: string,
  transactionType: 'deduct' | 'add' | 'refund' | 'initial',
  amount: number,
  description: string,
  relatedAnalysisId?: string,
  pdfExportId?: string,
  modelUsed?: string
): Promise<{
  success: boolean
  transaction?: CreditTransaction
  error?: string
}> {
  try {
    const { data: transaction, error } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        transaction_type: transactionType,
        amount,
        description,
        related_analysis_id: relatedAnalysisId,
        pdf_export_id: pdfExportId,
        model_used: modelUsed
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to record credit transaction:', error)
      return {
        success: false,
        error: 'Failed to record transaction'
      }
    }

    return {
      success: true,
      transaction
    }
  } catch (error) {
    console.error('Record credit transaction error:', error)
    return {
      success: false,
      error: 'Something went wrong'
    }
  }
}

// Get user's credit transaction history
export async function getCreditTransactionHistory(userId: string, limit: number = 50): Promise<{
  success: boolean
  transactions?: CreditTransaction[]
  error?: string
}> {
  try {
    const { data: transactions, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch credit transaction history:', error)
      return {
        success: false,
        error: 'Failed to fetch transaction history'
      }
    }

    return {
      success: true,
      transactions: transactions || []
    }
  } catch (error) {
    console.error('Get credit transaction history error:', error)
    return {
      success: false,
      error: 'Something went wrong'
    }
  }
}

// Check if PDF was already exported for this analysis (to prevent duplicate charges)
export async function checkPDFExportExists(userId: string, analysisId: string): Promise<{
  success: boolean
  exists?: boolean
  export?: PDFExport
  error?: string
}> {
  try {
    const { data: existingExport, error } = await supabase
      .from('pdf_exports')
      .select('*')
      .eq('user_id', userId)
      .eq('analysis_id', analysisId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to check PDF export:', error)
      return {
        success: false,
        error: 'Failed to check export status'
      }
    }

    return {
      success: true,
      exists: !!existingExport,
      export: existingExport || undefined
    }
  } catch (error) {
    console.error('Check PDF export error:', error)
    return {
      success: false,
      error: 'Something went wrong'
    }
  }
}

// Record PDF export and deduct credits (only if not already exported)
export async function exportPDFAndDeductCredits(
  userId: string,
  analysisId: string,
  modelUsed: string,
  creditsRequired: number
): Promise<{
  success: boolean
  export?: PDFExport
  alreadyExported?: boolean
  remainingCredits?: number
  error?: string
}> {
  try {
    // First check if already exported
    const exportCheck = await checkPDFExportExists(userId, analysisId)
    if (!exportCheck.success) {
      return {
        success: false,
        error: exportCheck.error
      }
    }

    if (exportCheck.exists) {
      return {
        success: true,
        alreadyExported: true,
        export: exportCheck.export
      }
    }

    // Check if user has enough credits
    const creditCheck = await checkCredits(userId, creditsRequired)
    if (!creditCheck.success) {
      return {
        success: false,
        error: creditCheck.error
      }
    }

    if (!creditCheck.hasEnoughCredits) {
      return {
        success: false,
        error: 'Insufficient credits'
      }
    }

    // Start a transaction-like operation
    // 1. Create PDF export record
    const { data: pdfExport, error: exportError } = await supabase
      .from('pdf_exports')
      .insert({
        user_id: userId,
        analysis_id: analysisId,
        model_used: modelUsed,
        credits_charged: creditsRequired
      })
      .select()
      .single()

    if (exportError) {
      console.error('Failed to create PDF export record:', exportError)
      return {
        success: false,
        error: 'Failed to record export'
      }
    }

    // 2. Deduct credits
    const deductResult = await deductCredits(userId, creditsRequired)
    if (!deductResult.success) {
      // If credit deduction fails, we should clean up the PDF export record
      await supabase
        .from('pdf_exports')
        .delete()
        .eq('id', pdfExport.id)
      
      return {
        success: false,
        error: deductResult.error
      }
    }

    // 3. Record the credit transaction
    await recordCreditTransaction(
      userId,
      'deduct',
      creditsRequired,
      `PDF export for analysis (${modelUsed})`,
      analysisId,
      pdfExport.id,
      modelUsed
    )

    return {
      success: true,
      export: pdfExport,
      alreadyExported: false,
      remainingCredits: deductResult.remainingCredits
    }
  } catch (error) {
    console.error('Export PDF and deduct credits error:', error)
    return {
      success: false,
      error: 'Something went wrong'
    }
  }
}

// Enhanced addCredits function with transaction recording
export async function addCreditsWithHistory(
  userId: string, 
  creditsToAdd: number, 
  description: string = 'Credits added',
  creemId?: string
): Promise<{
  success: boolean
  newBalance?: number
  error?: string
}> {
  try {
    const addResult = await addCredits(userId, creditsToAdd, creemId)
    
    if (addResult.success) {
      // Record the transaction
      await recordCreditTransaction(
        userId,
        'add',
        creditsToAdd,
        description
      )
    }
    
    return addResult
  } catch (error) {
    console.error('Add credits with history error:', error)
    return {
      success: false,
      error: 'Something went wrong'
    }
  }
}

