import { createResource } from 'solid-js';
import type { Accessor } from 'solid-js';
import { API_ENDPOINTS } from './apiEndpoints';
import type { ApiKeysType } from './apiEndpoints';

const BASE_URL = 'https://afrosmoky.vps.webdock.cloud/api';

export interface ApiQueryOptions {
  route: ApiKeysType;
  id?: string;
}

export function apiQuery<T = unknown>(
  options: ApiQueryOptions | Accessor<ApiQueryOptions>
) {
  const fetcher = async (opts: ApiQueryOptions): Promise<T> => {
    const endpointTemplate = API_ENDPOINTS[opts.route].endpoint;

    const endpoint = opts.id
      ? endpointTemplate.replace(':id', opts.id)
      : endpointTemplate.replace('/:id', '');

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const json = await res.json();
    if ('data' in json) {
      return json.data as T; // Zwraca tylko pole `data`
    }

    // fallback jeśli `data` nie istnieje
    return json as T;
  };

  const source: Accessor<ApiQueryOptions> =
    typeof options === 'function' ? options : () => options;

  // const [data, { refetch }] = createResource<ApiQueryOptions, T>(
  //   source,
  //   fetcher,
  //   {
  //     initialValue: null as unknown as T,
  //     deferStream: true,
  //   }
  // );
  const [data, { refetch }] = createResource(source, fetcher);

  return { data, refetch };
}
