// File upload service for FastAPI backend integration
const API_BASE_URL = 'http://localhost:8000'

class FileUploadService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  /**
   * Upload multiple files to the backend
   * @param {FileList|File[]} files - Files to upload
   * @returns {Promise<Object>} Upload results
   */
  async uploadFiles(files) {
    try {
      const formData = new FormData()
      
      // Add all files to FormData
      Array.from(files).forEach((file) => {
        formData.append('files', file)
      })

      const response = await fetch(`${this.baseURL}/upload-files/`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('File upload error:', error)
      throw new Error(`Failed to upload files: ${error.message}`)
    }
  }

  /**
   * Upload a single file to the backend
   * @param {File} file - File to upload
   * @returns {Promise<Object>} Upload result
   */
  async uploadSingleFile(file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${this.baseURL}/upload-single-file/`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Single file upload error:', error)
      throw new Error(`Failed to upload file: ${error.message}`)
    }
  }

  /**
   * Get supported file formats from the backend
   * @returns {Promise<Object>} Supported formats info
   */
  async getSupportedFormats() {
    try {
      const response = await fetch(`${this.baseURL}/supported-formats/`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error fetching supported formats:', error)
      throw new Error(`Failed to get supported formats: ${error.message}`)
    }
  }

  /**
   * Check if the API server is healthy
   * @returns {Promise<boolean>} Server health status
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`)
      return response.ok
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Get file type icon based on extension
   * @param {string} filename - File name
   * @returns {string} File type for icon selection
   */
  getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase()
    if (['xlsx', 'xls'].includes(ext)) return 'excel'
    if (ext === 'pdf') return 'pdf'
    if (['docx', 'doc'].includes(ext)) return 'word'
    if (ext === 'csv') return 'csv'
    return 'unknown'
  }

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   * @returns {Object} Validation result
   */
  validateFile(file) {
    const supportedExtensions = ['.pdf', '.csv', '.xlsx', '.xls', '.docx', '.doc']
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    
    if (!supportedExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: `Unsupported file type: ${fileExtension}. Supported types: ${supportedExtensions.join(', ')}`
      }
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large: ${this.formatFileSize(file.size)}. Maximum size: ${this.formatFileSize(maxSize)}`
      }
    }

    return { valid: true }
  }
}

// Create and export a singleton instance
const fileUploadService = new FileUploadService()
export default fileUploadService 