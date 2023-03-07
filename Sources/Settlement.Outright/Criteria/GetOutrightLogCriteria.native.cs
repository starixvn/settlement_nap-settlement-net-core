using Fanex.Data.Repository;

namespace Settlement.Outright.Criteria;

public class GetOutrightLogCriteria : CriteriaBase
{
#nullable enable
	public string? MatchCode { get; set; }

	public int? MatchId { get; set; }

	public DateTime FromDate { get; set; }

	public DateTime ToDate { get; set; }

	public DateTime BalanceUpDay { get; set; }

	public override string GetSettingKey()
	{
		return "NAP_UserLog_Settle_OutrightSelByCode";
	}

	public override bool IsValid()
	{
		return FromDate <= ToDate;
	}
}