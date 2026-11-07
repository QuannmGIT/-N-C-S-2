export function buildQuery(params) {
  if (!params) return '';
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

export async function api(path, optionsOrBody, signal) {
  let method = 'GET';
  let bodyPayload = undefined;
  let headers = {};

  if (optionsOrBody) {
    if (
      typeof optionsOrBody === 'object' &&
      optionsOrBody !== null &&
      'method' in optionsOrBody &&
      ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(String(optionsOrBody.method).toUpperCase())
    ) {
      method = String(optionsOrBody.method).toUpperCase();
      const rawBody = optionsOrBody.data !== undefined ? optionsOrBody.data : optionsOrBody.body;
      if (rawBody !== undefined) {
        bodyPayload = JSON.stringify(rawBody);
        headers['Content-Type'] = 'application/json';
      }
    } else {
      method = 'POST';
      bodyPayload = JSON.stringify(optionsOrBody);
      headers['Content-Type'] = 'application/json';
    }
  }

  const res = await fetch(path, {
    method,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
    body: bodyPayload,
    signal,
  });

  let data = await res.json().catch(() => ({}));
  // Server errors arrive as { error: { code, message } } — flatten so pages
  // can keep treating `data.error` as a display string.
  if (data?.error && typeof data.error !== 'string') {
    data = { ...data, error: data.error.message ?? 'Yêu cầu thất bại' };
  }
  return { ok: res.ok, data };
}

// GET with query params: apiGet('/api/products', { q: 'esp', limit: 12 })
export async function apiGet(path, params, signal) {
  return api(path + buildQuery(params), undefined, signal);
}
