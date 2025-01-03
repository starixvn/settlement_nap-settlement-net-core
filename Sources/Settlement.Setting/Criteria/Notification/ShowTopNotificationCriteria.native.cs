using Fanex.Data;

namespace Settlement.Setting.Criteria.Notification;

public class ShowTopNotificationCriteria : CriteriaBase
{
    private int? top;

    public int? Top
    {
        get => top is not > 0 ? int.MaxValue : top.Value;

        set => top = value;
    }

    public int AdminId { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override string GetSettingKey() => $"NAP_Set_SettledErrorSel_{DbServer}";

    public override bool IsValid()  => AdminId > 0;
}