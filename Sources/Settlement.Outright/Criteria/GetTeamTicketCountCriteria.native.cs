using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.Outright.Criteria;

public class GetTeamTicketCountCriteria : CriteriaBase
{
	public string OrIds { get; set; }

	[SpParam(Ignored = true)]
	public string DbServer { get; set; }

	public override string GetSettingKey() => $"NAP_Set_OutrightSelTicketCount_{DbServer}";

	public override bool IsValid() => !string.IsNullOrEmpty(OrIds);
}