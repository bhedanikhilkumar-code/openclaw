import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
import { normalizeLowercaseStringOrEmpty } from "openclaw/plugin-sdk/string-coerce-runtime";

export function formatMatrixErrorReason(err: unknown): string {
  return normalizeLowercaseStringOrEmpty(formatErrorMessage(err));
}

export function isMatrixNotFoundError(err: unknown): boolean {
  const errObj = err as { statusCode?: number; body?: { errcode?: string } };
  if (errObj?.statusCode === 404 || errObj?.body?.errcode === "M_NOT_FOUND") {
    return true;
  }
  const message = formatMatrixErrorReason(err);
  return (
    message.includes("m_not_found") || message.includes("[404]") || message.includes("not found")
  );
}

export function isMatrixInvalidPaginationTokenError(err: unknown, token?: string): boolean {
  if (!token) {
    return false;
  }
  // SAFETY: Safely probe optional HTTP status and homeserver error payload properties.
  const errObj = err as {
    statusCode?: number;
    httpStatus?: number;
    body?: { errcode?: string; error?: string };
    data?: { errcode?: string; error?: string };
  };
  const statusCode = errObj?.statusCode ?? errObj?.httpStatus;
  const errcode = errObj?.body?.errcode ?? errObj?.data?.errcode;
  const message = formatMatrixErrorReason(err);
  if (
    (statusCode === 400 || message.includes("[400]")) &&
    (errcode === "M_INVALID_PARAM" ||
      errcode === "M_UNKNOWN" ||
      message.includes("from") ||
      message.includes("param") ||
      message.includes("token") ||
      token.startsWith("$"))
  ) {
    return true;
  }
  return (
    message.includes("from") &&
    (message.includes("invalid") || message.includes("[400]") || message.includes("unknown"))
  );
}
