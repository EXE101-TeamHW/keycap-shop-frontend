/**
 * Type definitions for Custom Service Image Upload feature
 */

export interface ImageFile {
  id: string              // Unique identifier (UUID)
  name: string            // Original filename
  size: number            // File size in bytes
  type: string            // MIME type (image/png, image/jpeg, etc.)
  base64: string          // Base64 encoded image data with data URI prefix
  preview: string         // Data URL for preview (same as base64)
  uploadedAt: string      // ISO timestamp
  uploadedBy?: 'customer' | 'staff'  // Who uploaded this image
}

export interface StaffNotes {
  text: string
  createdAt: string
  createdBy: string       // Staff member name or ID
}

export interface CustomerFeedback {
  text: string
  createdAt: string
  requestChanges: boolean // true if requesting changes, false if just a comment
}

export interface RequestHistory {
  id: string
  timestamp: string
  action: 'created' | 'status_changed' | 'images_uploaded' | 'feedback_added' | 'notes_added'
  actor: 'customer' | 'staff'
  details: string
  oldStatus?: CustomRequest['status']
  newStatus?: CustomRequest['status']
}

export interface CustomRequest {
  id: string              // Unique identifier (UUID)
  customerName: string    // Customer full name
  email: string           // Customer email
  phone: string           // Customer phone (optional)
  layout: string          // Keyboard layout (60%, 65%, etc.)
  profile: string         // Keycap profile (Cherry, OEM, etc.)
  theme: string           // Color theme/style
  budget: string          // Budget range
  description: string     // Detailed description
  images: ImageFile[]     // Reference images uploaded by customer
  resultImages: ImageFile[]  // Result images uploaded by staff
  staffNotes: StaffNotes[]   // Notes from staff about the custom work
  customerFeedback: CustomerFeedback[]  // Feedback from customer
  status: 'Pending' | 'In Progress' | 'Awaiting Approval' | 'Approved' | 'Completed' | 'Cancelled'
  revisionCount: number   // Number of times changes were requested
  history: RequestHistory[]  // Complete history of the request
  createdAt: string       // ISO timestamp
  updatedAt: string       // ISO timestamp
  completedAt?: string    // ISO timestamp when marked as completed
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface ValidationError {
  fileName: string
  reason: string
}
