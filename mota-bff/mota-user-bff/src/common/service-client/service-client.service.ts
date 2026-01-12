import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError, timeout } from 'rxjs';
import { AxiosError, AxiosRequestConfig } from 'axios';

export interface ServiceResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
}

@Injectable()
export class ServiceClientService {
  private readonly logger = new Logger(ServiceClientService.name);
  private readonly serviceUrls: Record<string, string>;
  private readonly defaultTimeout: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.serviceUrls = this.configService.get('services');
    this.defaultTimeout = this.configService.get('http.timeout') || 30000;
  }

  /**
   * 获取服务URL
   */
  private getServiceUrl(service: string): string {
    const url = this.serviceUrls[service];
    if (!url) {
      throw new HttpException(
        `Unknown service: ${service}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return url;
  }

  /**
   * 构建请求配置
   */
  private buildConfig(
    options?: RequestOptions,
    userContext?: { userId?: string; tenantId?: string; token?: string },
  ): AxiosRequestConfig {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      params: options?.params,
    };

    // 添加用户上下文头
    if (userContext?.userId) {
      config.headers['X-User-Id'] = userContext.userId;
    }
    if (userContext?.tenantId) {
      config.headers['X-Tenant-Id'] = userContext.tenantId;
    }
    if (userContext?.token) {
      config.headers['Authorization'] = `Bearer ${userContext.token}`;
    }

    return config;
  }

  /**
   * GET请求
   */
  async get<T>(
    service: string,
    path: string,
    options?: RequestOptions,
    userContext?: { userId?: string; tenantId?: string; token?: string },
  ): Promise<ServiceResponse<T>> {
    const url = `${this.getServiceUrl(service)}${path}`;
    const config = this.buildConfig(options, userContext);
    const requestTimeout = options?.timeout || this.defaultTimeout;

    this.logger.debug(`GET ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get<ServiceResponse<T>>(url, config).pipe(
          timeout(requestTimeout),
          catchError((error: AxiosError) => {
            this.handleError(error, service, path);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, service, path);
    }
  }

  /**
   * POST请求
   */
  async post<T>(
    service: string,
    path: string,
    data?: any,
    options?: RequestOptions,
    userContext?: { userId?: string; tenantId?: string; token?: string },
  ): Promise<ServiceResponse<T>> {
    const url = `${this.getServiceUrl(service)}${path}`;
    const config = this.buildConfig(options, userContext);
    const requestTimeout = options?.timeout || this.defaultTimeout;

    this.logger.debug(`POST ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post<ServiceResponse<T>>(url, data, config).pipe(
          timeout(requestTimeout),
          catchError((error: AxiosError) => {
            this.handleError(error, service, path);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, service, path);
    }
  }

  /**
   * PUT请求
   */
  async put<T>(
    service: string,
    path: string,
    data?: any,
    options?: RequestOptions,
    userContext?: { userId?: string; tenantId?: string; token?: string },
  ): Promise<ServiceResponse<T>> {
    const url = `${this.getServiceUrl(service)}${path}`;
    const config = this.buildConfig(options, userContext);
    const requestTimeout = options?.timeout || this.defaultTimeout;

    this.logger.debug(`PUT ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.put<ServiceResponse<T>>(url, data, config).pipe(
          timeout(requestTimeout),
          catchError((error: AxiosError) => {
            this.handleError(error, service, path);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, service, path);
    }
  }

  /**
   * DELETE请求
   */
  async delete<T>(
    service: string,
    path: string,
    options?: RequestOptions,
    userContext?: { userId?: string; tenantId?: string; token?: string },
  ): Promise<ServiceResponse<T>> {
    const url = `${this.getServiceUrl(service)}${path}`;
    const config = this.buildConfig(options, userContext);
    const requestTimeout = options?.timeout || this.defaultTimeout;

    this.logger.debug(`DELETE ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.delete<ServiceResponse<T>>(url, config).pipe(
          timeout(requestTimeout),
          catchError((error: AxiosError) => {
            this.handleError(error, service, path);
            throw error;
          }),
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error, service, path);
    }
  }

  /**
   * 错误处理
   */
  private handleError(error: any, service: string, path: string): never {
    this.logger.error(
      `Service call failed: ${service}${path}`,
      error.stack || error.message,
    );

    if (error instanceof HttpException) {
      throw error;
    }

    if (error.response) {
      // 服务返回了错误响应
      const status = error.response.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error.response.data?.message ||
        error.response.statusText ||
        'Service error';
      throw new HttpException(
        {
          code: status,
          message: `[${service}] ${message}`,
          service,
          path,
        },
        status,
      );
    } else if (error.code === 'ECONNREFUSED') {
      // 服务不可用
      throw new HttpException(
        {
          code: HttpStatus.SERVICE_UNAVAILABLE,
          message: `Service ${service} is unavailable`,
          service,
          path,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else if (error.name === 'TimeoutError') {
      // 请求超时
      throw new HttpException(
        {
          code: HttpStatus.GATEWAY_TIMEOUT,
          message: `Service ${service} request timeout`,
          service,
          path,
        },
        HttpStatus.GATEWAY_TIMEOUT,
      );
    } else {
      // 其他错误
      throw new HttpException(
        {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Unknown error',
          service,
          path,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}