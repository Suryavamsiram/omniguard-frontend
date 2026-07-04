import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosProgressEvent } from 'axios'
import { tokenStorage } from './tokenStorage'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1'

let organizationId: string | null = null

export function setOrganizationContext(orgId: string): void {
  organizationId = orgId
}

export function getOrganizationContext(): string | null {
  return organizationId
}

function generateRequestId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

interface FastAPIError {
  detail?: string
  message?: string
  error?: string
  errors?: Array<{ loc?: string[]; msg?: string; type?: string }>
  code?: string
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: unknown,
    public requestId?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static fromAxiosError(error: AxiosError, requestId?: string): ApiError {
    const status = error.response?.status ?? 0
    const data = error.response?.data as FastAPIError | undefined

    const message = ApiError.extractMessage(data, error.message)
    const code = data?.code
    const details = data?.errors ?? data

    return new ApiError(status, message, code, details, requestId)
  }

  private static extractMessage(data: FastAPIError | undefined, fallback: string): string {
    if (data?.detail) return data.detail
    if (data?.message) return data.message
    if (data?.error) return data.error
    if (data?.errors && data.errors.length > 0) {
      return data.errors.map((e) => e.msg ?? `${e.loc?.join('.')} invalid`).join(', ')
    }
    return fallback
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

  get isValidationError(): boolean {
    return this.status === 422
  }
}

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(cb: (token: string) => void): void {
  refreshSubscribers.push(cb)
}

function onTokenRefreshed(token: string): void {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken()

  if (!refreshToken) {
    return null
  }

  const endpoint = import.meta.env.VITE_REFRESH_TOKEN_ENDPOINT ?? `${API_BASE_URL}/auth/refresh`

  try {
    const response = await axios.post(endpoint, { refresh_token: refreshToken })
    const { access_token, refresh_token } = response.data

    if (access_token) {
      tokenStorage.setAccessToken(access_token)
      if (refresh_token) {
        tokenStorage.setRefreshToken(refresh_token)
      }
      return access_token
    }
    return null
  } catch {
    return null
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

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        const token = tokenStorage.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        const requestId = generateRequestId()
        config.headers['X-Request-ID'] = requestId
        ;(config as any)._requestId = requestId

        if (organizationId) {
          config.headers['X-Organization-ID'] = organizationId
        }

        if (import.meta.env.DEV) {
          const startTime = Date.now()
          ;(config as any)._startTime = startTime
          ;(config as any)._method = config.method?.toUpperCase()
          ;(config as any)._url = config.url
        }

        return config
      },
      (error) => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      (response) => {
        if (import.meta.env.DEV) {
          const config = response.config as any
          const duration = Date.now() - (config._startTime ?? 0)
          console.log(`${config._method} ${config._url} ${response.status} ${duration}ms`)
        }
        return response
      },
      async (error: AxiosError) => {
        const config = error.config as any
        const requestId = config?._requestId

        if (import.meta.env.DEV && config) {
          const duration = Date.now() - (config._startTime ?? 0)
          console.log(
            `${config._method} ${config._url} ${error.response?.status ?? 'ERR'} ${duration}ms`
          )
        }

        const apiError = ApiError.fromAxiosError(error, requestId)

        if (apiError.isUnauthorized) {
          if (isRefreshing) {
            return new Promise((resolve) => {
              subscribeTokenRefresh((token) => {
                config.headers.Authorization = `Bearer ${token}`
                resolve(this.client.request(config))
              })
            })
          }

          isRefreshing = true

          try {
            const newToken = await refreshAccessToken()

            if (newToken) {
              isRefreshing = false
              onTokenRefreshed(newToken)
              config.headers.Authorization = `Bearer ${newToken}`
              return this.client.request(config)
            } else {
              tokenStorage.clear()
              window.dispatchEvent(new CustomEvent('auth:unauthorized'))
            }
          } catch {
            tokenStorage.clear()
            window.dispatchEvent(new CustomEvent('auth:unauthorized'))
          } finally {
            isRefreshing = false
          }
        }

        return Promise.reject(apiError)
      }
    )
  }

  async get<T>(
    url: string,
    config?: AxiosRequestConfig & { signal?: AbortSignal }
  ): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig & { signal?: AbortSignal }
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig & { signal?: AbortSignal }
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig & { signal?: AbortSignal }
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig & { signal?: AbortSignal }
  ): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  async upload<T>(
    url: string,
    file: File | FormData,
    options?: {
      onUploadProgress?: (progress: number) => void
      signal?: AbortSignal
      headers?: Record<string, string>
    }
  ): Promise<T> {
    const formData = file instanceof FormData ? file : new FormData()
    if (file instanceof File) {
      formData.append('file', file)
    }

    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...options?.headers,
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (options?.onUploadProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          options.onUploadProgress(percent)
        }
      },
      signal: options?.signal,
    })

    return response.data
  }

  async download(
    url: string,
    options?: {
      filename?: string
      signal?: AbortSignal
    }
  ): Promise<Blob> {
    const response = await this.client.get<Blob>(url, {
      responseType: 'blob',
      signal: options?.signal,
    })

    if (options?.filename) {
      const blobUrl = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = options.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    }

    return response.data
  }

  async downloadCSV(url: string, filename: string, signal?: AbortSignal): Promise<void> {
    await this.download(url, { filename: `${filename}.csv`, signal })
  }

  async downloadPDF(url: string, filename: string, signal?: AbortSignal): Promise<void> {
    await this.download(url, { filename: `${filename}.pdf`, signal })
  }

  async downloadZIP(url: string, filename: string, signal?: AbortSignal): Promise<void> {
    await this.download(url, { filename: `${filename}.zip`, signal })
  }
}

export const api = new ApiService()
