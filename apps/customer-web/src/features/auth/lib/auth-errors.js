import { getApiError } from "@/lib/api";

export function getAuthErrorMessage(error) {
  const status = error?.response?.status;
  const message = getApiError(error);

  if (status === 404 && /registered/i.test(message)) {
    return "No account found for this phone number. Create an account first.";
  }

  if (status === 403 && /admin portal/i.test(message)) {
    return "This account must sign in through the admin portal at /admin/login.";
  }

  if (status === 403 && /admin dashboard/i.test(message)) {
    return "This account cannot access the admin portal. Use the customer sign-in page instead.";
  }

  if (status === 403 && /verification/i.test(message)) {
    return "Phone verification is required. Complete signup or verify your OTP before signing in.";
  }

  if (status === 409 && /pending verification/i.test(message)) {
    return message;
  }

  if (status === 409 && /already registered|already exists/i.test(message)) {
    return "You already have an account with this email or phone. Sign in instead.";
  }

  if (status === 409 && /awaiting verification/i.test(message)) {
    return message;
  }

  return message;
}

export function isAlreadyRegisteredConflict(error) {
  const message = getApiError(error);
  return error?.response?.status === 409 && /already registered|already exists/i.test(message);
}
