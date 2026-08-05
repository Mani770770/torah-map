const KEY = "yeshivot:accounts";

export interface KnownAccount {
  email: string;
  name?: string;
  lastUsed: number;
}

export function getAccounts(): KnownAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as KnownAccount[]) : [];
    return Array.isArray(list) ? list.sort((a, b) => b.lastUsed - a.lastUsed) : [];
  } catch {
    return [];
  }
}

export function rememberAccount(email: string, name?: string) {
  if (typeof window === "undefined" || !email) return;
  const list = getAccounts().filter(a => a.email.toLowerCase() !== email.toLowerCase());
  list.unshift({ email, name, lastUsed: Date.now() });
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 6))); } catch {}
}

export function forgetAccount(email: string) {
  if (typeof window === "undefined") return;
  const list = getAccounts().filter(a => a.email.toLowerCase() !== email.toLowerCase());
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
}
