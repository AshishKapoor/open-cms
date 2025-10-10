# CAPTCHA Integration Setup

This project uses Google reCAPTCHA v2 to prevent automated registrations and ensure users are human.

## Overview

- **Frontend**: React component using `react-google-recaptcha`
- **Backend**: Server-side verification using Google's API
- **Fallback**: If no reCAPTCHA keys are configured, verification is skipped (development mode)

## Setup Instructions

### 1. Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "Create" to add a new site
3. Choose reCAPTCHA type: **v2 "I'm not a robot" Checkbox**
4. Add your domains (e.g., `localhost`, `yourdomain.com`)
5. Copy the **Site Key** and **Secret Key**

### 2. Configure Environment Variables

#### Backend (.env)

```bash
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

#### Frontend (.env)

```bash
VITE_RECAPTCHA_SITE_KEY=your_site_key_here
```

### 3. Test Keys (Development Only)

For testing purposes, you can use Google's test keys:

- **Site Key**: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- **Secret Key**: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

**Note**: Test keys always return success and should only be used in development.

## How It Works

### Registration Flow

1. User fills out the registration form
2. User completes the reCAPTCHA challenge
3. Frontend sends registration data + reCAPTCHA token to backend
4. Backend verifies the token with Google's API
5. If verification passes, user account is created
6. If verification fails, registration is rejected with error message

### Error Handling

- **Frontend**: Form submission is disabled until reCAPTCHA is completed
- **Backend**: Returns `400` error with `CAPTCHA_FAILED` code if verification fails
- **Auto-reset**: reCAPTCHA resets on registration errors for retry

### Security Features

- Token-based verification (single-use tokens)
- IP address validation (optional)
- Rate limiting through reCAPTCHA's built-in protection
- Graceful fallback when keys are not configured

## Development Mode

When `RECAPTCHA_SECRET_KEY` is not set:

- Backend skips reCAPTCHA verification
- Console warning is displayed
- Registration proceeds normally
- Useful for local development and testing

## Production Deployment

1. **Set environment variables** in your hosting platform
2. **Add production domains** to your reCAPTCHA site configuration
3. **Test registration flow** to ensure keys are working
4. **Monitor failed attempts** in Google reCAPTCHA Admin Console

## Troubleshooting

### Common Issues

1. **"CAPTCHA verification failed"**
   - Check that Site Key matches the frontend configuration
   - Verify Secret Key is correct in backend
   - Ensure domains are registered in reCAPTCHA admin

2. **reCAPTCHA not loading**
   - Check network connectivity
   - Verify Site Key is valid
   - Check browser console for JavaScript errors

3. **Always fails in production**
   - Confirm production domain is added to reCAPTCHA site
   - Check environment variables are properly set
   - Verify CORS settings allow your frontend domain

### Testing

To test the integration:

1. **Valid registration**: Complete reCAPTCHA and submit form
2. **Invalid token**: Modify network request to send invalid token
3. **Missing token**: Submit form without completing reCAPTCHA
4. **Network failure**: Simulate offline mode during submission

## Security Considerations

- reCAPTCHA provides protection against automated attacks
- Keys should be kept secure (use environment variables)
- Monitor reCAPTCHA analytics for suspicious activity
- Consider additional rate limiting for extra protection
- Test keys should never be used in production

## Files Modified

- `backend/src/utils/config.ts` - Added reCAPTCHA configuration
- `backend/src/utils/recaptcha.ts` - Verification utility (new)
- `backend/src/controllers/auth.ts` - Added reCAPTCHA to registration
- `frontend/src/pages/Register.tsx` - Added reCAPTCHA component
- `frontend/src/types/index.ts` - Updated RegisterData interface
- Environment files - Added reCAPTCHA key examples
