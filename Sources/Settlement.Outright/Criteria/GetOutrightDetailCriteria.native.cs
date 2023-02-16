using Fanex.Data.Repository;

namespace Settlement.Outright.Criteria;

public class GetOutrightDetailCriteria : CriteriaBase
{
	public DateTime FromDate { get; set; }

	public DateTime ToDate { get; set; }

	public int SportType { get; set; }

	public int LeagueId { get; set; }

	public byte StatusId { get; set; }

	public override string GetSettingKey()
	{
		return "NAP_Set_OutrightSelInfo";
	}

	public override bool IsValid()
	{
		return FromDate <= ToDate;
	}
}