/**
 * Utilitas untuk visual output dan testing helpers dengan detail respons transparan
 */

export const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  bgDark: '\x1b[40m',
};

export interface TestInfo {
  title: string;
  target?: string;
  status?: number | string;
  statusText?: string;
  duration?: number;
  response?: string;
  headers?: Record<string, string | null | undefined>;
  details?: Record<string, any>;
}

/**
 * Menampilkan detail eksekusi test secara lengkap dan transparan
 */
export function logTestDetail(info: TestInfo) {
  const durationStr = info.duration !== undefined ? `${info.duration.toFixed(1)}ms` : '';
  console.log(`\n  ${colors.green}✔ [PASS]${colors.reset} ${colors.bright}${info.title}${colors.reset} ${colors.dim}(${durationStr})${colors.reset}`);

  const items: [string, string][] = [];

  if (info.target) {
    items.push(['Target', `${colors.cyan}${info.target}${colors.reset}`]);
  }

  if (info.status !== undefined) {
    const statusColor =
      typeof info.status === 'number'
        ? info.status >= 200 && info.status < 300
          ? colors.green
          : info.status >= 300 && info.status < 400
          ? colors.yellow
          : colors.red
        : colors.yellow;
    const text = info.statusText ? ` ${info.statusText}` : '';
    items.push(['Status', `${statusColor}${info.status}${text}${colors.reset}`]);
  }

  if (info.headers && Object.keys(info.headers).length > 0) {
    const headerLines = Object.entries(info.headers)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${colors.gray}${k}:${colors.reset} ${v}`)
      .join(', ');
    items.push(['Headers', headerLines]);
  }

  if (info.response) {
    items.push(['Response', info.response]);
  }

  if (info.details) {
    for (const [k, v] of Object.entries(info.details)) {
      const valStr = typeof v === 'object' ? JSON.stringify(v) : String(v);
      items.push([k, valStr]);
    }
  }

  items.forEach(([label, val], idx) => {
    const isLast = idx === items.length - 1;
    const branch = isLast ? '└─' : '├─';
    const paddedLabel = label.padEnd(10, ' ');
    console.log(`     ${colors.gray}${branch}${colors.reset} ${colors.dim}${paddedLabel}:${colors.reset} ${val}`);
  });
}

/**
 * Helper untuk melakukan HTTP request dengan timeout (cocok untuk E2E & security test)
 */
export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Cek ketersediaan server HTTP (mendukung Next.js dev server cold start)
 */
export async function isServerReachable(url: string, timeoutMs = 5000): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(url, { method: 'GET' }, timeoutMs);
    return res.status < 500;
  } catch {
    try {
      await new Promise((r) => setTimeout(r, 1000));
      const retryRes = await fetchWithTimeout(url, { method: 'GET' }, timeoutMs);
      return retryRes.status < 500;
    } catch {
      return false;
    }
  }
}
