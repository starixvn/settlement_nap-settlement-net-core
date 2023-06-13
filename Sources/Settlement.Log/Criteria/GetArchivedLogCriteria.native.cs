using Fanex.Data.Repository;

namespace Settlement.Log.Criteria;

public class GetArchivedLogCriteria : CriteriaBase
{
    public string MatchCode { get; set; }

    public DateTime? FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public DateTime BalanceUpDay { get; set; }

    public string ProductType { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_UserLog_Settle_MatchArchivedSelByCode";
    }

    public override bool IsValid()
    {
        return MatchCode.Length > 0;
    }
}