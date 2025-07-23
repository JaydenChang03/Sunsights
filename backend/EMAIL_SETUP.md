# Email Service Setup for Sunsights

## Quick Setup Guide

### Option 1: Development Mode (Current)
- ✅ **Already working!** - Shows reset tokens in console
- No configuration needed for testing
- Perfect for development and testing

### Option 2: Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Create App Password:**
   - Go to Google Account → Security → App passwords
   - Generate password for "Mail"
3. **Set Environment Variables:**
   ```bash
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   FROM_EMAIL=your-email@gmail.com
   FROM_NAME=Sunsights
   ```

### Option 3: Other Email Providers

#### Outlook/Hotmail:
```bash
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USERNAME=your-email@outlook.com
SMTP_PASSWORD=your-password
```

#### Custom SMTP:
```bash
SMTP_SERVER=mail.yourdomain.com
SMTP_PORT=587
SMTP_USERNAME=noreply@yourdomain.com
SMTP_PASSWORD=your-password
```

## How to Set Environment Variables

### Windows (PowerShell):
```powershell
$env:SMTP_USERNAME="your-email@gmail.com"
$env:SMTP_PASSWORD="your-app-password"
```

### Windows (Command Prompt):
```cmd
set SMTP_USERNAME=your-email@gmail.com
set SMTP_PASSWORD=your-app-password
```

### Mac/Linux:
```bash
export SMTP_USERNAME="your-email@gmail.com"
export SMTP_PASSWORD="your-app-password"
```

## Test Email Sending

Once configured, the forgot password feature will:
1. ✅ Generate secure reset tokens
2. ✅ Send beautiful HTML emails
3. ✅ Include reset links that expire in 1 hour
4. ✅ Handle errors gracefully

## Email Template Preview

The emails include:
- 🌅 Sunsights branding
- 🔘 Clear "Reset Password" button
- ⏰ Expiration warning
- 🔗 Fallback text link
- 📱 Mobile-responsive design

## Current Status

- **Token Generation**: ✅ Working
- **Database Storage**: ✅ Working  
- **Security**: ✅ Working (1-hour expiry)
- **Email Sending**: 🔧 Ready (needs SMTP config)
- **Frontend UI**: ✅ Working 