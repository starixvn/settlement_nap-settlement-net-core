namespace Settlement.Setting.Models.Notification;

public class ShowNotificationModel
{
    public int NumberError { get; set; }

    public List<NotificationModel> Notifications { get; set; }
}