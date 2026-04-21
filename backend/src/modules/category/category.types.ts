// Database model
export interface Category {
  name: string;
  description: string;
}

// Create request
export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

// Update request
export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

// Response
export interface CategoryResponse {
  id: string;
  name: string;
  description: string;
}
