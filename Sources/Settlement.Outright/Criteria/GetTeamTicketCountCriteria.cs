using Fanex.Data.Repository;

namespace Settlement.Outright.Criteria;

public class GetTeamTicketCountCriteria : CriteriaBase
{
    public string Orids { get; set; }
    public override string GetSettingKey() => "NAP_Set_OutrightSelTicketCount";

    public override bool IsValid() => string.IsNullOrEmpty(Orids);
}
