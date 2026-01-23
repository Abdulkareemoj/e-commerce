export function isValidEmail(email: string): boolean {
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  // Password must be at least 8 characters long
  return password.length >= 8;
}

export function isNumeric(value: string): boolean {
  return /^\d+$/.test(value);
}
