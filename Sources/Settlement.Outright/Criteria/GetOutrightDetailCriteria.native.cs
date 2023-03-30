using Fanex.Data.Repository;

namespace Settlement.Outright.Criteria;

public class GetOutrightDetailCriteria : CriteriaBase
{
	public string FromDate { get; set; }

	public string ToDate { get; set; }

	public string LeagueIds { get; set; }

	public byte StatusId { get; set; }

	public bool IsIncludeTest { get; set; }


	public override string GetSettingKey()
	{
		return "NAP_Set_OutrightSelInfo";
	}

	public override bool IsValid()
	{
		return LeagueIds.Length > 0;
	}
}