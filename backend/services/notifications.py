from services.notification_service import send_notification, create_notification

# Re-export for backwards compatibility - all existing code that imports
# from services.notifications will continue to work seamlessly.
__all__ = ['send_notification', 'create_notification']
