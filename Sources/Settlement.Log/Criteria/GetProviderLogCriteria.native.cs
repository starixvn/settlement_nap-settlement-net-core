using Fanex.Data.Repository;

namespace Settlement.Log.Criteria;

public class GetProviderLogCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public string ResourceIds { get; set; }

    public string SourceIds { get; set; }

    public bool LatestRecord { get; set; }

    public override string GetSettingKey() => "NAP_Set_ProviderResultSel";

    public override bool IsValid() => MatchId > 0;
}