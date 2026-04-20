const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "https://ml.armazemautopecas.com.br/api";

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}${p}`;
}

export const IS_MOCK = BASE === "";
