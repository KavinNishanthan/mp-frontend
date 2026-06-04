export function getInitials(name: string | undefined | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function safeNum(value: number | undefined | null): number {
  return Number(value) || 0;
}

export function toArray<T = unknown>(data: unknown, ...keys: string[]): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data || typeof data !== 'object') return [];
  for (const key of keys) {
    const val = (data as Record<string, unknown>)[key];
    if (Array.isArray(val)) return val as T[];
  }
  return [];
}
