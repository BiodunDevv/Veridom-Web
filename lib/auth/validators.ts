export function validateRequired(value: string, label: string) {
  if (!value.trim()) {
    return `${label} is required.`
  }

  return undefined
}

export function validateEmail(value: string) {
  if (!value.trim()) {
    return "Email address is required."
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(value)) {
    return "Enter a valid email address."
  }

  return undefined
}

export function validatePasswordStrength(value: string) {
  if (!value.trim()) {
    return "Password is required."
  }

  if (value.length < 8) {
    return "Use at least 8 characters."
  }

  return undefined
}
