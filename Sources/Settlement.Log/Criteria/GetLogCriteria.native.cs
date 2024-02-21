using Fanex.Data.Repository;

namespace Settlement.Log.Criteria;

public class GetLogCriteria : CriteriaBase
{
    public string MatchCode { get; set; }

    public DateTime? FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public DateTime BalanceUpDay { get; set; }

    public string ProductType { get; set; }

    public override string GetSettingKey() => "NAP_UserLog_Settle_MatchSelByCode";

    public override bool IsValid() => MatchCode.Length > 0;
}