import smtplib
import os
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        # Email configuration - can be set via environment variables
        self.smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        self.smtp_username = os.environ.get('SMTP_USERNAME', '')
        self.smtp_password = os.environ.get('SMTP_PASSWORD', '')
        self.from_email = os.environ.get('FROM_EMAIL', self.smtp_username)
        self.from_name = os.environ.get('FROM_NAME', 'Sunsights')
        
        # DETAILED DEBUGGING LOG
        logger.info(f"🔧 INITIALIZING EMAIL SERVICE:")
        logger.info(f"   📍 Current Working Directory: {os.getcwd()}")
        logger.info(f"   🌍 Environment Variables Check:")
        for key in ['SMTP_SERVER', 'SMTP_PORT', 'SMTP_USERNAME', 'SMTP_PASSWORD', 'FROM_EMAIL', 'FROM_NAME']:
            value = os.environ.get(key, 'NOT_SET')
            if 'PASSWORD' in key:
                display_value = f"{'*' * len(value) if value != 'NOT_SET' else 'NOT_SET'}"
            else:
                display_value = value
            logger.info(f"      {key}: {display_value}")
        
        # Log final configuration (without sensitive data)
        logger.info(f"📧 Final Email Service Configuration:")
        logger.info(f"   SMTP Server: {self.smtp_server}:{self.smtp_port}")
        logger.info(f"   From Email: {self.from_email}")
        logger.info(f"   From Name: {self.from_name}")
        logger.info(f"   Username Set: {'✓' if self.smtp_username else '✗'}")
        logger.info(f"   Password Set: {'✓' if self.smtp_password else '✗'}")
        logger.info(f"   🎯 Service Mode: {'PRODUCTION (will send emails)' if self.is_configured() else 'DEVELOPMENT (console only)'}")
        

        
    def is_configured(self):
        """Check if email service is properly configured"""
        return bool(self.smtp_username and self.smtp_password)
    
    def send_password_reset_email(self, to_email, reset_token, user_name=None):
        """Send password reset email with token"""
        logger.info(f"🚀 SEND_PASSWORD_RESET_EMAIL CALLED:")
        logger.info(f"   📧 To Email: {to_email}")
        logger.info(f"   👤 User Name: {user_name}")
        logger.info(f"   🔑 Token Length: {len(reset_token) if reset_token else 0}")
        logger.info(f"   ⚙️ Service Configured: {self.is_configured()}")
        

        logger.info(f"   FROM_NAME: '{self.from_name}'")
        logger.info(f"   is_configured(): {self.is_configured()}")
        
        try:
            if not self.is_configured():
                logger.warning("🚫 EMAIL SERVICE NOT CONFIGURED - Running in development mode")
                logger.info(f"💡 To enable real emails, set environment variables:")
                logger.info(f"   $env:SMTP_USERNAME='your-email@gmail.com'")
                logger.info(f"   $env:SMTP_PASSWORD='your-app-password'")
                logger.info(f"📧 DEV MODE: Would send password reset email to {to_email}")
                logger.info(f"📧 DEV MODE: Reset token: {reset_token}")
                logger.info(f"📧 DEV MODE: Reset link would be: http://localhost:3000/reset-password?token={reset_token}")
                logger.info(f"🔄 DEV MODE: Returning SUCCESS (True) for development testing")
                return True
            
            # Create reset link (in production, this would be your domain)
            reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = "Reset Your Sunsights Password"
            msg['From'] = formataddr((self.from_name, self.from_email))
            msg['To'] = to_email
            
            # Create HTML email content
            html_content = self.create_password_reset_html(user_name or to_email, reset_link)
            
            # Create plain text version
            text_content = f"""
Hi {user_name or 'there'},

You requested a password reset for your Sunsights account.

Click the link below to reset your password:
{reset_link}

This link will expire in 1 hour for security reasons.

If you didn't request this reset, please ignore this email.

Best regards,
The Sunsights Team
            """.strip()
            
            # Attach parts
            part1 = MIMEText(text_content, 'plain')
            part2 = MIMEText(html_content, 'html')
            
            msg.attach(part1)
            msg.attach(part2)
            
            # Send email via SMTP
            logger.info(f"📤 ATTEMPTING TO SEND EMAIL VIA SMTP:")
            logger.info(f"   🌐 SMTP Server: {self.smtp_server}:{self.smtp_port}")
            logger.info(f"   📧 From: {self.from_email}")
            logger.info(f"   📧 To: {to_email}")
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                logger.info(f"🔗 Connected to SMTP server")
                server.starttls()
                logger.info(f"🔒 TLS encryption enabled")
                server.login(self.smtp_username, self.smtp_password)
                logger.info(f"✅ SMTP authentication successful")
                server.send_message(msg)
                logger.info(f"📧 Email message sent to SMTP server")
            
            logger.info(f"🎉 Password reset email sent successfully to {to_email}")
            return True
            
        except smtplib.SMTPAuthenticationError as e:
            logger.error(f"🚫 SMTP Authentication Failed: {str(e)}")
            logger.error(f"💡 Check your email credentials and app password")
            return False
        except smtplib.SMTPConnectError as e:
            logger.error(f"🌐 SMTP Connection Failed: {str(e)}")
            logger.error(f"💡 Check your internet connection and SMTP server settings")
            return False
        except Exception as e:
            logger.error(f"❌ Unexpected error sending email to {to_email}: {str(e)}")
            logger.error(f"🔍 Error type: {type(e).__name__}")
            
            # In development mode, always return True even if there are errors
            if not self.is_configured():
                logger.warning(f"🛠️ DEV MODE: Error occurred but returning SUCCESS for development")
                return True
            
            return False
    
    def create_password_reset_html(self, user_name, reset_link):
        """Create HTML email template for password reset"""
        return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🌅 Sunsights</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
    </div>
    
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #495057; margin-top: 0;">Hi {user_name}!</h2>
        
        <p>You requested a password reset for your Sunsights account. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_link}" 
               style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                Reset My Password
            </a>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;"><strong>⏰ Important:</strong> This link will expire in 1 hour for security reasons.</p>
        </div>
        
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="background: #e9ecef; padding: 10px; border-radius: 3px; word-break: break-all; font-family: monospace; font-size: 14px;">
            {reset_link}
        </p>
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #6c757d;">
            If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
        </p>
        
        <p style="font-size: 14px; color: #6c757d;">
            Best regards,<br>
            The Sunsights Team
        </p>
    </div>
</body>
</html>
        """.strip()

# Global email service instance
email_service = EmailService() 