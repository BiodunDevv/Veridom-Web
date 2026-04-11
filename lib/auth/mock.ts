type LoginPayload = {
  email: string
  password: string
  remember: boolean
}

type RegisterPayload = {
  accountType: string
  firstName: string
  lastName: string
  email: string
  password: string
}

const wait = (duration = 900) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, duration)
  })

export async function mockLogin({
  email,
  password,
}: LoginPayload): Promise<void> {
  await wait()

  if (email.toLowerCase().includes("locked")) {
    throw new Error("This account is unavailable in the demo flow.")
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long.")
  }
}

export async function mockRegister({
  accountType,
  firstName,
  lastName,
  email,
  password,
}: RegisterPayload): Promise<void> {
  await wait()

  if (!accountType || !firstName || !lastName || !email || !password) {
    throw new Error("Please complete all required fields.")
  }
}
