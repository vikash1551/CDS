import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config

def send_email(to_email, subject, text_body, html_body=None):
    """
    Sends an email using SMTP. This is the Python equivalent to Nodemailer.
    """
    msg = MIMEMultipart("alternative")
    msg['Subject'] = subject
    msg['From'] = Config.MAIL_USERNAME
    msg['To'] = to_email

    # Attach plain text
    part1 = MIMEText(text_body, 'plain')
    msg.attach(part1)

    # Attach HTML if provided
    if html_body:
        part2 = MIMEText(html_body, 'html')
        msg.attach(part2)

    try:
        # Create secure connection with server and send email
        server = smtplib.SMTP(Config.MAIL_SERVER, Config.MAIL_PORT)
        
        if Config.MAIL_USE_TLS:
            server.starttls()
            
        server.login(Config.MAIL_USERNAME, Config.MAIL_PASSWORD)
        server.sendmail(Config.MAIL_USERNAME, to_email, msg.as_string())
        server.quit()
        return True, "Email sent successfully"
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False, str(e)
