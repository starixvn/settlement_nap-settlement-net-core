using Fanex.Data;

namespace Settlement.Setting.Criteria.Notification;

public class GetNumberOfNotificationCriteria : CriteriaBase
{
    public int AdminId { get; set; }

    public int NumberError { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override string GetSettingKey() => $"NAP_Set_GetNumberError_{DbServer}";

    public override bool IsValid() => AdminId > 0;
}