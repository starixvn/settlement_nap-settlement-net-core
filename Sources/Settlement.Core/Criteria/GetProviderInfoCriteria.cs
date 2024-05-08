using Fanex.Data.Repository;

namespace Settlement.Core.Criteria;

public class GetProviderInfoCriteria : CriteriaBase
{
    public int SportType { get; set; }

    public int LeagueId { get; set; }

    public override string GetSettingKey() => "NAP_Set_AutoPayout_SourceInfo_Sel";

    public override bool IsValid() => SportType > 0;
}