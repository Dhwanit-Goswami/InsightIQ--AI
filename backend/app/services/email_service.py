"""
Email service for password reset.
Sends SMTP email when SMTP credentials are configured.
Falls back to console logging for local dev/evaluation.
"""
import logging
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_password_reset_email(to_email: str, reset_link: str, user_name: str = "User") -> bool:
    """
    Send a password reset email.
    If SMTP is not configured, logs the reset link to console (dev mode).
    Returns True if the email was sent (or logged), False on error.
    """
    subject = "InsightIQ — Password Reset Request"
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px;">
      <div style="max-width: 480px; margin: auto; background: #1e293b; border-radius: 12px; padding: 32px;">
        <h2 style="color: #818cf8; margin-bottom: 8px;">InsightIQ</h2>
        <h3 style="color: #f1f5f9;">Password Reset</h3>
        <p>Hi {user_name},</p>
        <p>We received a request to reset your InsightIQ password. Click the button below to set a new password.</p>
        <a href="{reset_link}" style="display:inline-block; margin: 16px 0; padding: 12px 28px;
           background: #818cf8; color: #fff; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Reset Password
        </a>
        <p style="color:#94a3b8; font-size:13px;">This link expires in <strong>1 hour</strong>. If you didn't request a reset, please ignore this email.</p>
        <hr style="border-color:#334155; margin: 24px 0;">
        <p style="color:#64748b; font-size:12px;">InsightIQ — AI-Powered Decision Intelligence Platform</p>
      </div>
    </body>
    </html>
    """
    plain_body = f"Hi {user_name},\n\nReset your InsightIQ password:\n{reset_link}\n\nThis link expires in 1 hour."

    smtp_host = getattr(settings, "SMTP_HOST", None)
    smtp_user = getattr(settings, "SMTP_USER", None)
    smtp_password = getattr(settings, "SMTP_PASSWORD", None)

    if not smtp_host or not smtp_user or not smtp_password:
        # Dev / evaluation mode: print reset link to backend console
        logger.info("=" * 60)
        logger.info("[DEV MODE] Password Reset Link (no SMTP configured):")
        logger.info(f"  To:    {to_email}")
        logger.info(f"  Link:  {reset_link}")
        logger.info("=" * 60)
        return True

    try:
        smtp_port = getattr(settings, "SMTP_PORT", 587)
        from_email = getattr(settings, "SMTP_FROM_EMAIL", smtp_user)

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = from_email
        msg["To"] = to_email
        msg.attach(MIMEText(plain_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        context = ssl.create_default_context()
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.ehlo()
            server.starttls(context=context)
            server.login(smtp_user, smtp_password)
            server.sendmail(from_email, to_email, msg.as_string())

        logger.info(f"Password reset email sent to {to_email}")
        return True

    except Exception as exc:
        logger.error(f"Failed to send password reset email to {to_email}: {exc}")
        return False
