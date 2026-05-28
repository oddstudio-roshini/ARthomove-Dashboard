export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getUserType(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userType");
}

export function getUserName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userName");
}

export function getUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userEmail");
}

export function setAuth(token: string, userType: string, name: string, email: string) {
  localStorage.setItem("token", token);
  localStorage.setItem("userType", userType);
  localStorage.setItem("userName", name);
  localStorage.setItem("userEmail", email);
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("userType");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
