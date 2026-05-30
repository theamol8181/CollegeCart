"use client";

function getAuthErrorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code?: unknown }).code ?? "");
  }
  return "";
}

export function shouldRetryGoogleWithRedirect(error: unknown) {
  const code = getAuthErrorCode(error);
  return code === "auth/popup-blocked" || code === "auth/cancelled-popup-request";
}

export function getGoogleAuthMessage(error: unknown) {
  const code = getAuthErrorCode(error);

  if (code === "auth/operation-not-allowed") {
    return "Firebase Console me Google sign-in provider enable karo, phir dobara try karo.";
  }

  if (code === "auth/unauthorized-domain") {
    return "Firebase Console ke Authorized domains me current domain add karo, phir Google login chalega.";
  }

  if (code === "auth/popup-blocked") {
    return "Browser ne Google popup block kiya. Redirect login try karo ya popup allow karo.";
  }

  if (code === "auth/popup-closed-by-user") {
    return "Google popup close ho gaya. Account select karke login complete karo.";
  }

  if (code === "auth/account-exists-with-different-credential") {
    return "Is email ka account kisi aur login method se bana hua hai. Pehle email/password se login karo.";
  }

  if (code === "auth/network-request-failed") {
    return "Network issue aa raha hai. Internet check karke dobara try karo.";
  }

  if (code) {
    return `Google login failed: ${code}`;
  }

  return "Google login failed. Please try again.";
}
