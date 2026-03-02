import { fc } from 'fast-check'

/**
 * Test utilities for generating test data
 */

// Generate a random base64 image string
export function generateBase64Image(format: 'png' | 'jpg' | 'jpeg' | 'webp' = 'png'): string {
  // Simple 1x1 pixel images in different formats
  const images = {
    png: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    jpg: '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
    jpeg: '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
    webp: 'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA='
  }
  
  return `data:image/${format};base64,${images[format] || images.png}`
}

// Arbitrary for generating valid image files
export const arbValidImageFile = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }).map(s => `${s}.jpg`),
  size: fc.integer({ min: 100, max: 5 * 1024 * 1024 }), // 100 bytes to 5MB
  type: fc.constantFrom('image/png', 'image/jpeg', 'image/jpg', 'image/webp'),
})

// Arbitrary for generating ImageFile objects
export const arbImageFile = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }).map(s => `${s}.jpg`),
  size: fc.integer({ min: 100, max: 5 * 1024 * 1024 }),
  type: fc.constantFrom('image/png', 'image/jpeg', 'image/jpg', 'image/webp'),
  base64: fc.constant(generateBase64Image()),
  preview: fc.constant(generateBase64Image()),
  uploadedAt: fc.date().map(d => d.toISOString()),
})

// Arbitrary for generating arrays of ImageFiles (1-5 images)
export const arbImageFileArray = fc.array(arbImageFile, { minLength: 1, maxLength: 5 })

// Arbitrary for generating custom request data
export const arbCustomRequest = fc.record({
  id: fc.uuid(),
  customerName: fc.string({ minLength: 1, maxLength: 100 }),
  email: fc.emailAddress(),
  phone: fc.string({ minLength: 10, maxLength: 15 }),
  layout: fc.constantFrom('60%', '65%', '75%', 'TKL', 'FULL', 'ISO', 'ANSI', 'Custom'),
  profile: fc.constantFrom('Cherry', 'OEM', 'SA', 'DSA', 'XDA', 'MT3'),
  theme: fc.string({ minLength: 1, maxLength: 100 }),
  budget: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ minLength: 10, maxLength: 500 }),
  images: arbImageFileArray,
  status: fc.constantFrom('Pending', 'In Progress', 'Completed', 'Cancelled'),
  createdAt: fc.date().map(d => d.toISOString()),
  updatedAt: fc.date().map(d => d.toISOString()),
})

// Helper to create a mock File object
export function createMockFile(
  name: string,
  size: number,
  type: string,
  content: string = 'mock file content'
): File {
  const blob = new Blob([content], { type })
  const file = new File([blob], name, { type })
  
  // Mock the size property
  Object.defineProperty(file, 'size', {
    value: size,
    writable: false,
  })
  
  return file
}

// Helper to create multiple mock files
export function createMockFiles(count: number): File[] {
  return Array.from({ length: count }, (_, i) => 
    createMockFile(`test-image-${i + 1}.jpg`, 1024 * 100, 'image/jpeg')
  )
}

// Helper to convert base64 to Blob
export function base64ToBlob(base64: string): Blob {
  const parts = base64.split(';base64,')
  const contentType = parts[0].split(':')[1]
  const raw = window.atob(parts[1])
  const rawLength = raw.length
  const uInt8Array = new Uint8Array(rawLength)
  
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i)
  }
  
  return new Blob([uInt8Array], { type: contentType })
}
