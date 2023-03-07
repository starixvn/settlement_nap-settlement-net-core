using Fanex.Data.Repository;

namespace Settlement.Setting.Criteria.Notification;

public class NotificationBetBuilderCriteria : CriteriaBase
{
    public override string GetSettingKey()
    {
        return "Nap_Set_MatchBetbuilderStatusSel";
    }

    public override bool IsValid()
    {
        return true;
    }
}