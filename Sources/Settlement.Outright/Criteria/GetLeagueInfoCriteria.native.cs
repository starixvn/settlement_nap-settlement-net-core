using Fanex.Data.Repository;

namespace Settlement.Outright.Criteria;

public class GetLeagueInfoCriteria : CriteriaBase
{
	public int LeagueId { get; set; }

	public byte StatusId { get; set; }

	public override string GetSettingKey()
	{
		return "NAP_Set_OutrightSelInfoByLeagueID";
	}

	public override bool IsValid()
	{
		return LeagueId > 0;
	}
}