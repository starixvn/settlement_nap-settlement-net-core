export class Notification {
    public matchCode: string;
    public homeName: string;
    public awayName: string;
    public startDate: string;
    public message: string;
}

export class ShowNotificationModel{
    public numberError: number;
    public notifications: Notification[];
}