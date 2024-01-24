using Fanex.Data.Repository;

namespace Settlement.Log.Criteria;

public class GetProviderLogCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public string ResultId { get; set; }

    public string ResultName { get; set; }

    public string Provider { get; set; }

    public bool IsLatestRecord { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_ProviderResultSel";
    }

    public override bool IsValid() => MatchId > 0;
}