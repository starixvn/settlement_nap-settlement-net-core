using Fanex.Data.Repository;

namespace Settlement.Outright.Criteria;

public class GetOutrightLogDetailCriteria : CriteriaBase
{
	public int LeagueId { get; set; }

	public int MatchId { get; set; }

	public DateTime FromDate { get; set; }

	public DateTime ToDate { get; set; }

	public override string GetSettingKey()
	{
		return "NAP_UserLog_Settle_OutrightSelByLeagueID";
	}

	public override bool IsValid()
	{
		return FromDate <= ToDate;
	}
}