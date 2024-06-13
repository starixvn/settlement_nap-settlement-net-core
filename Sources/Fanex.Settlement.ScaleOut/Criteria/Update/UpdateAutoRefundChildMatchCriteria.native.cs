using Fanex.Data.Repository;

namespace Fanex.Settlement.ScaleOut.Criteria.Update;

public class UpdateAutoRefundChildMatchCriteria : NonQueryCommand
{
    public int ParentId { get; set; }

    public string ChildMatchIds { get; set; }

    public override string GetSettingKey() => "NAP_Set_AutoRefund_ResultIns";

    public override bool IsValid() => ParentId > 0;
}