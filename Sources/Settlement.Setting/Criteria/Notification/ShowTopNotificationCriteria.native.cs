using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Setting.Criteria.Notification;

public class ShowTopNotificationCriteria : CriteriaBase
{
    private int? top;

    public int? Top
    {
        get
        {
            if (!top.HasValue || top.Value <= 0)
            {
                return int.MaxValue;
            }

            return top.Value;
        }

        set => top = value;
    }

    public int AdminId { get; set; }

    [SpParam(Ignored = true)]
    public string DbServer { get; set; }

    public override string GetSettingKey() => $"NAP_Set_SettledErrorSel_{DbServer}";

    public override bool IsValid()  => AdminId > 0;
}