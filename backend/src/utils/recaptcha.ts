import fetch from 'node-fetch';
import { config } from './config';

export interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export const verifyRecaptcha = async (
  token: string,
  remoteip?: string
): Promise<boolean> => {
  // If no secret key is configured, skip verification (useful for development)
  if (!config.RECAPTCHA_SECRET_KEY) {
    console.warn(
      'reCAPTCHA verification skipped: RECAPTCHA_SECRET_KEY not configured'
    );
    return true;
  }

  try {
    const url = 'https://www.google.com/recaptcha/api/siteverify';
    const params = new URLSearchParams({
      secret: config.RECAPTCHA_SECRET_KEY,
      response: token,
    });

    if (remoteip) {
      params.append('remoteip', remoteip);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = (await response.json()) as RecaptchaResponse;

    if (!data.success && data['error-codes']) {
      console.error('reCAPTCHA verification failed:', data['error-codes']);
    }

    return data.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
};
