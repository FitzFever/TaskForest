/**
 * API请求状态枚举
 */
export enum ApiStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

/**
 * API错误类型
 */
export interface ApiError {
  message: string;
  code: number;
  type: string;
  details?: any;
}

/**
 * API响应基础接口
 */
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
  timestamp: number;
  error?: ApiError;
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T = any> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * API请求参数接口
 */
export interface ApiRequestParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * API状态接口
 */
export interface ApiState {
  status: ApiStatus;
  data: any | null;
  error: ApiError | null | undefined;
  timestamp: number;
} 