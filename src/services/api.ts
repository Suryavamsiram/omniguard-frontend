import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'

const API_BASE_URL = '/api/v1'

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static fromAxiosError(error: AxiosError): ApiError {
    const status = error.response?.status ?? 0
    const message = (error.response?.data as any)?.message ?? error.message
    const code = (error.response?.data as any)?.code
    const details = (error.response?.data as any)?.details

    return new ApiError(status, message, code, details)
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  get isServerError(): boolean {
    return this.status >= 500
  }

  get isNetworkError(): boolean {
    return this.status === 0
  }
}

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError = ApiError.fromAxiosError(error)

        if (apiError.isUnauthorized) {
          localStorage.removeItem('auth_token')
          window.dispatchEvent(new CustomEvent('auth:unauthorized'))
        }

        return Promise.reject(apiError)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }
}

export const api = new ApiService()
