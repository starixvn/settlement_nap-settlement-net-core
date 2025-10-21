namespace Settlement.Setting.Criteria.Notification;

public class NotificationOutrightCriteria : CriteriaBase
{
    public override string GetSettingKey()
    {
        return "Nap_Set_MatchOutrightStatusSel";
    }

    public override bool IsValid()
    {
        return true;
    }
}