'use client';

import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';

// 通用 API 请求状态
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// 通用 API Hook
export function useApi<T>(
  fetcher: () => Promise<T>,
  options?: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    showErrorMessage?: boolean;
  }
) {
  const { immediate = true, onSuccess, onError, showErrorMessage = true } = options || {};
  
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcher();
      setState({ data, loading: false, error: null });
      onSuccess?.(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState(prev => ({ ...prev, loading: false, error }));
      if (showErrorMessage) {
        message.error(error.message || '请求失败');
      }
      onError?.(error);
      throw error;
    }
  }, [fetcher, onSuccess, onError, showErrorMessage]);

  const refresh = useCallback(() => {
    return execute();
  }, [execute]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    refresh,
    setData: (data: T | null) => setState(prev => ({ ...prev, data })),
  };
}

// 带参数的 API Hook
export function useApiWithParams<T, P>(
  fetcher: (params: P) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    showErrorMessage?: boolean;
  }
) {
  const { onSuccess, onError, showErrorMessage = true } = options || {};
  
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcher(params);
      setState({ data, loading: false, error: null });
      onSuccess?.(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState(prev => ({ ...prev, loading: false, error }));
      if (showErrorMessage) {
        message.error(error.message || '请求失败');
      }
      onError?.(error);
      throw error;
    }
  }, [fetcher, onSuccess, onError, showErrorMessage]);

  return {
    ...state,
    execute,
    setData: (data: T | null) => setState(prev => ({ ...prev, data })),
  };
}

// 分页 API Hook
interface PaginationState<T> {
  records: T[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: Error | null;
}

interface PaginationParams {
  page?: number;
  pageSize?: number;
  [key: string]: unknown;
}

interface PaginationResponse<T> {
  records: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function usePaginatedApi<T>(
  fetcher: (params: PaginationParams) => Promise<PaginationResponse<T>>,
  options?: {
    defaultPageSize?: number;
    immediate?: boolean;
    onSuccess?: (data: PaginationResponse<T>) => void;
    onError?: (error: Error) => void;
    showErrorMessage?: boolean;
  }
) {
  const { 
    defaultPageSize = 10, 
    immediate = true, 
    onSuccess, 
    onError, 
    showErrorMessage = true 
  } = options || {};
  
  const [state, setState] = useState<PaginationState<T>>({
    records: [],
    total: 0,
    page: 1,
    pageSize: defaultPageSize,
    loading: immediate,
    error: null,
  });

  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    pageSize: defaultPageSize,
  });

  const execute = useCallback(async (newParams?: PaginationParams) => {
    const mergedParams = { ...params, ...newParams };
    setParams(mergedParams);
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcher(mergedParams);
      setState({
        records: data.records,
        total: data.total,
        page: data.page,
        pageSize: data.pageSize,
        loading: false,
        error: null,
      });
      onSuccess?.(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState(prev => ({ ...prev, loading: false, error }));
      if (showErrorMessage) {
        message.error(error.message || '请求失败');
      }
      onError?.(error);
      throw error;
    }
  }, [fetcher, params, onSuccess, onError, showErrorMessage]);

  const refresh = useCallback(() => {
    return execute(params);
  }, [execute, params]);

  const changePage = useCallback((page: number, pageSize?: number) => {
    return execute({ ...params, page, pageSize: pageSize || params.pageSize });
  }, [execute, params]);

  const changePageSize = useCallback((pageSize: number) => {
    return execute({ ...params, page: 1, pageSize });
  }, [execute, params]);

  const search = useCallback((searchParams: Omit<PaginationParams, 'page' | 'pageSize'>) => {
    return execute({ ...searchParams, page: 1, pageSize: params.pageSize });
  }, [execute, params.pageSize]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    params,
    execute,
    refresh,
    changePage,
    changePageSize,
    search,
    pagination: {
      current: state.page,
      pageSize: state.pageSize,
      total: state.total,
      onChange: changePage,
      onShowSizeChange: (current: number, size: number) => changePageSize(size),
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total: number) => `共 ${total} 条`,
    },
  };
}

// Mutation Hook (用于创建、更新、删除操作)
export function useMutation<T, P>(
  mutator: (params: P) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
  }
) {
  const { onSuccess, onError, successMessage, errorMessage } = options || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (params: P) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mutator(params);
      if (successMessage) {
        message.success(successMessage);
      }
      onSuccess?.(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      message.error(errorMessage || error.message || '操作失败');
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [mutator, onSuccess, onError, successMessage, errorMessage]);

  return {
    mutate,
    loading,
    error,
  };
}