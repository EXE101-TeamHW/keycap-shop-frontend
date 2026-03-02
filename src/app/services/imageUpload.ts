import { ImageFile, ValidationResult, ValidationError } from '../types/customRequest'
import { v4 as uuidv4 } from 'uuid'

/**
 * Image Upload Service
 * Handles image validation, conversion, and processing
 */

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_FILES = 5
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp']

/**
 * Validate a single file
 */
function validateFile(file: File): ValidationError | null {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        fileName: file.name,
        reason: `Invalid file type. Only PNG, JPG, JPEG, and WEBP images are allowed.`
      }
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      fileName: file.name,
      reason: `File size exceeds 5MB limit. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    }
  }

  return null
}

/**
 * Validate multiple files
 */
export function validateFiles(files: File[]): ValidationResult {
  const errors: string[] = []

  // Check quantity
  if (files.length > MAX_FILES) {
    errors.push(`Maximum ${MAX_FILES} images allowed. You selected ${files.length} images.`)
    return { valid: false, errors }
  }

  if (files.length === 0) {
    errors.push('No files selected.')
    return { valid: false, errors }
  }

  // Validate each file
  for (const file of files) {
    const error = validateFile(file)
    if (error) {
      errors.push(`${error.fileName}: ${error.reason}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Convert a file to base64 string
 */
export function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert file to base64'))
      }
    }

    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Generate preview URL from base64 string
 * In this implementation, preview is the same as base64
 */
export function generatePreview(base64: string): string {
  return base64
}

/**
 * Process multiple files and convert to ImageFile objects
 */
export async function processImages(files: File[]): Promise<ImageFile[]> {
  const imageFiles: ImageFile[] = []
  const errors: string[] = []

  for (const file of files) {
    try {
      const base64 = await convertToBase64(file)
      const imageFile: ImageFile = {
        id: uuidv4(),
        name: file.name,
        size: file.size,
        type: file.type,
        base64: base64,
        preview: generatePreview(base64),
        uploadedAt: new Date().toISOString()
      }
      imageFiles.push(imageFile)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      errors.push(`Failed to process ${file.name}: ${errorMessage}`)
      console.error(`Error processing file ${file.name}:`, error)
    }
  }

  // If all files failed, throw an error
  if (imageFiles.length === 0 && files.length > 0) {
    throw new Error(`All images failed to upload: ${errors.join(', ')}`)
  }

  // If some files failed, log warnings but continue
  if (errors.length > 0) {
    console.warn('Some images failed to process:', errors)
  }

  return imageFiles
}

/**
 * Check if file type is valid
 */
export function isValidFileType(file: File): boolean {
  if (ALLOWED_TYPES.includes(file.type)) {
    return true
  }

  // Fallback to extension check
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  return ALLOWED_EXTENSIONS.includes(extension)
}

/**
 * Check if file size is valid
 */
export function isValidFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export const imageUploadService = {
  validateFiles,
  convertToBase64,
  generatePreview,
  processImages,
  isValidFileType,
  isValidFileSize,
  formatFileSize,
  MAX_FILE_SIZE,
  MAX_FILES,
  ALLOWED_TYPES,
  ALLOWED_EXTENSIONS
}
