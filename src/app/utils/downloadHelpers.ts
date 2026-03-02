import JSZip from 'jszip'
import { ImageFile } from '../types/customRequest'

/**
 * Download a single image
 */
export function downloadImage(image: ImageFile): void {
  try {
    // Create a temporary anchor element
    const link = document.createElement('a')
    link.href = image.base64
    link.download = image.name
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error downloading image:', error)
    throw new Error(`Failed to download ${image.name}`)
  }
}

/**
 * Download multiple images as a ZIP file
 */
export async function downloadImagesAsZip(
  images: ImageFile[],
  zipFileName: string = 'images.zip'
): Promise<void> {
  try {
    if (images.length === 0) {
      throw new Error('No images to download')
    }

    const zip = new JSZip()
    
    // Add each image to the ZIP
    for (const image of images) {
      // Extract base64 data (remove data URI prefix)
      const base64Data = image.base64.split(',')[1]
      
      if (!base64Data) {
        console.warn(`Skipping ${image.name}: invalid base64 data`)
        continue
      }
      
      // Add file to ZIP
      zip.file(image.name, base64Data, { base64: true })
    }
    
    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    
    // Create download link
    const link = document.createElement('a')
    link.href = URL.createObjectURL(zipBlob)
    link.download = zipFileName
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up object URL
    URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('Error creating ZIP file:', error)
    throw new Error('Failed to create ZIP file. Please try downloading images individually.')
  }
}

/**
 * Get a safe filename for ZIP based on request ID
 */
export function getZipFileName(requestId: string): string {
  const shortId = requestId.substring(0, 8)
  const timestamp = new Date().toISOString().split('T')[0]
  return `custom-request-${shortId}-${timestamp}.zip`
}
