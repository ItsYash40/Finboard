export const KYC_APPLICATION_STATUS = {
  PENDING_ADMIN_REVIEW: "pending_admin_review",
  APPROVED: "approved",
  REJECTED: "rejected",
  FAILED: "failed",
  REUPLOAD_REQUESTED: "reupload_requested"
};

const RESUBMITTABLE_STATUSES = new Set([
  KYC_APPLICATION_STATUS.REJECTED,
  KYC_APPLICATION_STATUS.FAILED,
  KYC_APPLICATION_STATUS.REUPLOAD_REQUESTED
]);

export function canSubmitKyc(application) {
  if (!application) {
    return true;
  }

  return RESUBMITTABLE_STATUSES.has(application.status);
}

export function isKycInProgress(status) {
  return status === KYC_APPLICATION_STATUS.PENDING_ADMIN_REVIEW;
}

export function getKycStatusPresentation(application) {
  if (!application) {
    return {
      label: "Not started",
      description: "Upload your PAN and Aadhaar to verify your identity and unlock investing.",
      tone: "default"
    };
  }

  const map = {
    [KYC_APPLICATION_STATUS.PENDING_ADMIN_REVIEW]: {
      label: "Under review",
      description: "Your documents look good. Our team is doing a final check — we'll notify you when you're verified.",
      tone: "warning"
    },
    [KYC_APPLICATION_STATUS.APPROVED]: {
      label: "Verified",
      description: "Your identity is confirmed. Link your bank account to start investing.",
      tone: "success"
    },
    [KYC_APPLICATION_STATUS.REJECTED]: {
      label: "Needs attention",
      description: application.adminRemarks
        ? `${application.adminRemarks} Please update your details and try again.`
        : "We couldn't verify your documents. Please check your details and submit again.",
      tone: "danger"
    },
    [KYC_APPLICATION_STATUS.FAILED]: {
      label: "Couldn't verify",
      description:
        application.failureReason ||
        "The name, PAN, or Aadhaar didn't match our records. Double-check your details and re-upload clear photos.",
      tone: "danger"
    },
    [KYC_APPLICATION_STATUS.REUPLOAD_REQUESTED]: {
      label: "Re-upload needed",
      description: "Please upload clearer photos of your PAN and Aadhaar, then submit again.",
      tone: "warning"
    }
  };

  return (
    map[application.status] || {
      label: "In progress",
      description: "We're processing your verification. Check back here for updates.",
      tone: "default"
    }
  );
}

const KYC_CHECK_LABELS = {
  identityExists: "Identity record found",
  nameMatchesDataset: "Name matches your documents",
  panMatchesDataset: "PAN number verified",
  aadhaarMatchesDataset: "Aadhaar number verified",
  panOcrMatches: "PAN card read successfully",
  aadhaarOcrMatches: "Aadhaar card read successfully"
};

export function getKycCheckItems(checks = {}) {
  return Object.entries(checks).map(([key, passed]) => ({
    key,
    label: KYC_CHECK_LABELS[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
    passed: Boolean(passed)
  }));
}

export function getKycProgressStep(application) {
  if (!application) return 1;
  if (application.status === KYC_APPLICATION_STATUS.APPROVED) return 3;
  if (application.status === KYC_APPLICATION_STATUS.PENDING_ADMIN_REVIEW) return 2;
  return 1;
}

export function maskPan(value) {
  const pan = String(value || "").toUpperCase();
  if (pan.length < 4) return pan;
  return `${pan.slice(0, 2)}••••${pan.slice(-2)}`;
}

export function maskAadhaar(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length < 4) return "•••• •••• ••••";
  return `•••• •••• ${digits.slice(-4)}`;
}
