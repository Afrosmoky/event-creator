import { createSignal } from 'solid-js';
import { API_ENDPOINTS } from './apiEndpoints';
import type { ApiKeysType } from './apiEndpoints';

const BASE_URL = 'https://afrosmoky.vps.webdock.cloud/api';

type Method = 'POST' | 'PUT' | 'DELETE';

interface MutationOptions {
  route: ApiKeysType;
  method: Method;
  id?: string;
}

export function useApiMutation<T = unknown>() {
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<Error | null>(null);
  const [data, setData] = createSignal<T | null>(null);

  const mutate = async (
    options: MutationOptions,
    body?: Record<string, any>
  ) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const endpointTemplate = API_ENDPOINTS[options.route].endpoint;
      const endpoint = options.id
        ? endpointTemplate.replace(':id', options.id)
        : endpointTemplate.replace('/:id', '');

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: options.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      // Obsłuż pustą odpowiedź (np. 204 No Content)
      const text = await res.text();
      const responseData = text ? (JSON.parse(text) as T) : null;
// @ts-ignore
      setData(responseData);
      return responseData;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    loading,
    error,
    data,
  };
}
