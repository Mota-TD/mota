import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import NProgress from 'nprogress';

// API响应类型
interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// 错误响应类型
interface ApiError {
  code: number;
  message: string;
  details?: Record<string, string[]>;
}

// 创建axios实例
const createApiClient = (): AxiosInstance => {
  // 使用相对路径，让Next.js代理处理跨域
  // Next.js rewrites 会将 /api/* 代理到后端服务
  const instance = axios.create({
    baseURL: '', // 使用相对路径，通过Next.js代理
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 显示进度条
      if (typeof window !== 'undefined') {
        NProgress.start();
      }

      // 添加认证token
      const token = Cookies.get('mota_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 添加租户ID
      const tenantId = Cookies.get('mota_tenant_id');
      if (tenantId) {
        config.headers['X-Tenant-Id'] = tenantId;
      }

      return config;
    },
    (error) => {
      NProgress.done();
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response) => {
      NProgress.done();

      // 调试日志：打印响应信息
      console.log('[API Response]', {
        url: response.config.url,
        status: response.status,
        data: response.data,
        headers: response.headers,
      });

      // 处理业务错误
      const data = response.data as ApiResponse;
      if (data.code !== 0 && data.code !== 200) {
        console.error('[API Business Error]', { code: data.code, message: data.message });
        return Promise.reject(new Error(data.message || '请求失败'));
      }

      return response;
    },
    async (error: AxiosError<ApiError>) => {
      NProgress.done();

      // 调试日志：打印错误详情
      console.error('[API Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        code: error.code,
      });

      // 处理401错误（未授权）
      if (error.response?.status === 401) {
        // 尝试刷新token
        const refreshToken = Cookies.get('mota_refresh_token');
        if (refreshToken && error.config) {
          try {
            const response = await axios.post<ApiResponse<{ accessToken: string }>>(
              `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
              { refreshToken }
            );

            const { accessToken } = response.data.data;
            Cookies.set('mota_token', accessToken);

            // 重试原请求
            error.config.headers.Authorization = `Bearer ${accessToken}`;
            return instance.request(error.config);
          } catch {
            // 刷新失败，清除token并跳转登录页
            Cookies.remove('mota_token');
            Cookies.remove('mota_refresh_token');
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        } else {
          // 没有refresh token，跳转登录页
          Cookies.remove('mota_token');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }

      // 处理403错误（禁止访问）
      if (error.response?.status === 403) {
        if (typeof window !== 'undefined') {
          window.location.href = '/403';
        }
      }

      // 处理404错误
      if (error.response?.status === 404) {
        return Promise.reject(new Error('请求的资源不存在'));
      }

      // 处理500错误
      if (error.response?.status === 500) {
        return Promise.reject(new Error('服务器内部错误，请稍后重试'));
      }

      // 处理网络错误
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new Error('请求超时，请检查网络连接'));
      }

      if (!error.response) {
        return Promise.reject(new Error('网络连接失败，请检查网络'));
      }

      // 返回服务器错误信息
      const errorMessage = error.response.data?.message || '请求失败';
      return Promise.reject(new Error(errorMessage));
    }
  );

  return instance;
};

// 导出API客户端实例
export const apiClient = createApiClient();

// 封装常用请求方法
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<ApiResponse<T>>(url, config).then((res) => res.data),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<ApiResponse<T>>(url, data, config).then((res) => res.data),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<ApiResponse<T>>(url, data, config).then((res) => res.data),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<ApiResponse<T>>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<ApiResponse<T>>(url, config).then((res) => res.data),
};

// 文件上传
export const uploadFile = async (
  url: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<ApiResponse<{ url: string; filename: string }>> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<{ url: string; filename: string }>>(
    url,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    }
  );

  return response.data;
};

// 分片上传
export const uploadChunk = async (
  url: string,
  chunk: Blob,
  chunkIndex: number,
  totalChunks: number,
  fileId: string,
  filename: string
): Promise<ApiResponse<{ uploaded: boolean; url?: string }>> => {
  const formData = new FormData();
  formData.append('chunk', chunk);
  formData.append('chunkIndex', String(chunkIndex));
  formData.append('totalChunks', String(totalChunks));
  formData.append('fileId', fileId);
  formData.append('filename', filename);

  const response = await apiClient.post<ApiResponse<{ uploaded: boolean; url?: string }>>(
    url,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

export default apiClient;