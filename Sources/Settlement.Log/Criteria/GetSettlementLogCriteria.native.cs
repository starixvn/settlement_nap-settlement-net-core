using Fanex.Data.Repository;
using System;

namespace Settlement.Log.Criteria;

public class GetSettlementLogCriteria : CriteriaBase
{
    public string MatchCode { get; set; }

    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public DateTime BalanceUpDay { get; set; }

    public string ProductType { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_UserLog_Settle_MatchSelByCode";
    }

    public override bool IsValid()
    {
        return FromDate <= ToDate;
    }
}