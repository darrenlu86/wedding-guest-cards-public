export interface VerifyGuestRequest {
  guestName: string;
  phone?: string;
}

export interface VerifyGuestSuccessResponse {
  success: true;
  guestId: string;
  redirectUrl: string;
}

export interface VerifyGuestErrorResponse {
  success: false;
  error: {
    code: 'NOT_FOUND' | 'RATE_LIMIT' | 'INVALID_INPUT' | 'HONEYPOT_DETECTED';
    message: string;
  };
}

export type VerifyGuestResponse =
  | VerifyGuestSuccessResponse
  | VerifyGuestErrorResponse;

export interface SendEmailRequest {
  guestId: string;
  guestName?: string;
  recipientEmail: string;
  cardImageBase64?: string;
}

export interface SendEmailResponse {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
}
