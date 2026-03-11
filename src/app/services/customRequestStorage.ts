import {
  CustomRequest,
  ImageFile,
  StaffNotes,
  CustomerFeedback,
  RequestHistory,
} from "../types/customRequest";

// UUID generation with fallback
function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

/**
 * Custom Request Storage Service
 * Manages custom requests in localStorage
 */

const STORAGE_KEY = "customRequests";

/**
 * Get all custom requests from localStorage
 */
export function getAllRequests(): CustomRequest[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    console.log(
      "[CustomRequestStorage] getAllRequests - raw data length:",
      data?.length ?? "null",
    );
    if (!data) {
      return [];
    }
    const parsed = JSON.parse(data) as CustomRequest[];
    console.log(
      "[CustomRequestStorage] getAllRequests - count:",
      parsed.length,
    );
    return parsed;
  } catch (error) {
    console.error("Error reading custom requests from localStorage:", error);
    return [];
  }
}

/**
 * Get a single custom request by ID
 */
export function getRequest(id: string): CustomRequest | null {
  const requests = getAllRequests();
  return requests.find((req) => req.id === id) || null;
}

/**
 * Save a new custom request
 */
export function saveRequest(
  request: Omit<
    CustomRequest,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "status"
    | "resultImages"
    | "staffNotes"
    | "customerFeedback"
    | "revisionCount"
    | "history"
  >,
): string {
  try {
    const requests = getAllRequests();

    const newRequest: CustomRequest = {
      ...request,
      id: generateId(),
      status: "Pending",
      resultImages: [],
      staffNotes: [],
      customerFeedback: [],
      revisionCount: 0,
      history: [
        {
          id: generateId(),
          timestamp: new Date().toISOString(),
          action: "created",
          actor: "customer",
          details: "Request created",
          newStatus: "Pending",
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    requests.push(newRequest);

    // Check localStorage quota
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
      console.log(
        "[CustomRequestStorage] Saved request:",
        newRequest.id,
        "| Total requests:",
        requests.length,
      );
      console.log(
        "[CustomRequestStorage] Verify localStorage:",
        localStorage.getItem(STORAGE_KEY)?.substring(0, 100),
      );
    } catch (storageError) {
      // Check if it's a quota exceeded error
      if (
        storageError instanceof DOMException &&
        (storageError.name === "QuotaExceededError" ||
          storageError.name === "NS_ERROR_DOM_QUOTA_REACHED")
      ) {
        throw new Error(
          "Storage limit reached. Please remove some old requests or reduce image sizes.",
        );
      }
      throw storageError;
    }

    // Notify listeners about the new request
    window.dispatchEvent(new CustomEvent("custom-request-updated"));

    return newRequest.id;
  } catch (error) {
    console.error("Error saving custom request:", error);
    throw error;
  }
}

/**
 * Update request status
 */
export function updateRequestStatus(
  id: string,
  status: CustomRequest["status"],
): void {
  try {
    const requests = getAllRequests();
    const index = requests.findIndex((req) => req.id === id);

    if (index === -1) {
      throw new Error(`Custom request with ID ${id} not found`);
    }

    requests[index].status = status;
    requests[index].updatedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));

    // Notify listeners about the update
    window.dispatchEvent(new CustomEvent("custom-request-updated"));
  } catch (error) {
    console.error("Error updating request status:", error);
    throw error;
  }
}

/**
 * Delete a custom request and its associated images
 */
export function deleteRequest(id: string): void {
  try {
    const requests = getAllRequests();
    const filteredRequests = requests.filter((req) => req.id !== id);

    if (filteredRequests.length === requests.length) {
      throw new Error(`Custom request with ID ${id} not found`);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRequests));
  } catch (error) {
    console.error("Error deleting custom request:", error);
    throw error;
  }
}

/**
 * Get storage usage information
 */
export function getStorageInfo(): {
  used: number;
  total: number;
  percentage: number;
  requestCount: number;
  imageCount: number;
} {
  const requests = getAllRequests();
  const data = localStorage.getItem(STORAGE_KEY) || "";
  const used = new Blob([data]).size;

  // Most browsers have 5-10MB limit, we'll assume 5MB
  const total = 5 * 1024 * 1024;
  const percentage = (used / total) * 100;

  const imageCount = requests.reduce(
    (count, req) => count + req.images.length,
    0,
  );

  return {
    used,
    total,
    percentage,
    requestCount: requests.length,
    imageCount,
  };
}

/**
 * Clear all custom requests (use with caution)
 */
export function clearAllRequests(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing custom requests:", error);
    throw error;
  }
}

/**
 * Export requests as JSON (for backup)
 */
export function exportRequests(): string {
  const requests = getAllRequests();
  return JSON.stringify(requests, null, 2);
}

/**
 * Import requests from JSON (for restore)
 */
export function importRequests(jsonData: string): void {
  try {
    const requests = JSON.parse(jsonData) as CustomRequest[];

    // Validate the data structure
    if (!Array.isArray(requests)) {
      throw new Error("Invalid data format: expected an array");
    }

    // Basic validation of each request
    for (const req of requests) {
      if (!req.id || !req.customerName || !req.email) {
        throw new Error("Invalid request data: missing required fields");
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (error) {
    console.error("Error importing custom requests:", error);
    throw error;
  }
}

/**
 * Get requests by status
 */
export function getRequestsByStatus(
  status: CustomRequest["status"],
): CustomRequest[] {
  const requests = getAllRequests();
  return requests.filter((req) => req.status === status);
}

/**
 * Search requests by customer name or email
 */
export function searchRequests(query: string): CustomRequest[] {
  const requests = getAllRequests();
  const lowerQuery = query.toLowerCase();

  return requests.filter(
    (req) =>
      req.customerName.toLowerCase().includes(lowerQuery) ||
      req.email.toLowerCase().includes(lowerQuery) ||
      req.id.toLowerCase().includes(lowerQuery),
  );
}

/**
 * Upload result images to a request (staff only)
 */
export function uploadResultImages(
  requestId: string,
  images: ImageFile[],
  staffNotes?: string,
): void {
  try {
    const requests = getAllRequests();
    const index = requests.findIndex((req) => req.id === requestId);

    if (index === -1) {
      throw new Error(`Custom request with ID ${requestId} not found`);
    }

    const request = requests[index];

    // Add uploaded by marker
    const markedImages = images.map((img) => ({
      ...img,
      uploadedBy: "staff" as const,
    }));

    // Add result images
    request.resultImages = [...(request.resultImages || []), ...markedImages];

    // Add staff notes if provided
    if (staffNotes) {
      const note: StaffNotes = {
        text: staffNotes,
        createdAt: new Date().toISOString(),
        createdBy: "Staff", // In real app, this would be the logged-in staff member
      };
      request.staffNotes = [...(request.staffNotes || []), note];
    }

    // Change status to Awaiting Approval
    request.status = "Awaiting Approval";
    request.updatedAt = new Date().toISOString();

    // Add to history
    const historyEntry: RequestHistory = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      action: "images_uploaded",
      actor: "staff",
      details: `Uploaded ${images.length} result image(s)`,
      oldStatus: "In Progress",
      newStatus: "Awaiting Approval",
    };
    request.history = [...(request.history || []), historyEntry];

    requests[index] = request;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (error) {
    console.error("Error uploading result images:", error);
    throw error;
  }
}

/**
 * Add customer feedback to a request
 */
export function addCustomerFeedback(
  requestId: string,
  feedbackText: string,
  requestChanges: boolean,
): void {
  try {
    const requests = getAllRequests();
    const index = requests.findIndex((req) => req.id === requestId);

    if (index === -1) {
      throw new Error(`Custom request with ID ${requestId} not found`);
    }

    const request = requests[index];

    const feedback: CustomerFeedback = {
      text: feedbackText,
      createdAt: new Date().toISOString(),
      requestChanges,
    };

    request.customerFeedback = [...(request.customerFeedback || []), feedback];

    // Update status based on feedback
    const oldStatus = request.status;
    if (requestChanges) {
      request.status = "In Progress";
      request.revisionCount = (request.revisionCount || 0) + 1;
    } else {
      request.status = "Approved";
    }

    request.updatedAt = new Date().toISOString();

    // Add to history
    const historyEntry: RequestHistory = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      action: "feedback_added",
      actor: "customer",
      details: requestChanges ? "Requested changes" : "Approved result",
      oldStatus,
      newStatus: request.status,
    };
    request.history = [...(request.history || []), historyEntry];

    requests[index] = request;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (error) {
    console.error("Error adding customer feedback:", error);
    throw error;
  }
}

/**
 * Mark request as completed (staff only)
 */
export function markAsCompleted(requestId: string, finalNotes?: string): void {
  try {
    const requests = getAllRequests();
    const index = requests.findIndex((req) => req.id === requestId);

    if (index === -1) {
      throw new Error(`Custom request with ID ${requestId} not found`);
    }

    const request = requests[index];

    if (request.status !== "Approved") {
      throw new Error("Request must be approved before marking as completed");
    }

    const oldStatus = request.status;
    request.status = "Completed";
    request.completedAt = new Date().toISOString();
    request.updatedAt = new Date().toISOString();

    if (finalNotes) {
      const note: StaffNotes = {
        text: finalNotes,
        createdAt: new Date().toISOString(),
        createdBy: "Staff",
      };
      request.staffNotes = [...(request.staffNotes || []), note];
    }

    // Add to history
    const historyEntry: RequestHistory = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      action: "status_changed",
      actor: "staff",
      details: "Marked as completed",
      oldStatus,
      newStatus: "Completed",
    };
    request.history = [...(request.history || []), historyEntry];

    requests[index] = request;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch (error) {
    console.error("Error marking request as completed:", error);
    throw error;
  }
}

/**
 * Get requests awaiting customer approval
 */
export function getRequestsAwaitingApproval(
  customerEmail: string,
): CustomRequest[] {
  const requests = getAllRequests();
  return requests.filter(
    (req) =>
      req.email.toLowerCase() === customerEmail.toLowerCase() &&
      req.status === "Awaiting Approval",
  );
}

/**
 * Get requests by customer email
 */
export function getRequestsByCustomer(customerEmail: string): CustomRequest[] {
  const requests = getAllRequests();
  return requests.filter(
    (req) => req.email.toLowerCase() === customerEmail.toLowerCase(),
  );
}

// Update exports
export const customRequestStorage = {
  getAllRequests,
  getRequest,
  saveRequest,
  updateRequestStatus,
  deleteRequest,
  getStorageInfo,
  clearAllRequests,
  exportRequests,
  importRequests,
  getRequestsByStatus,
  searchRequests,
  uploadResultImages,
  addCustomerFeedback,
  markAsCompleted,
  getRequestsAwaitingApproval,
  getRequestsByCustomer,
};
