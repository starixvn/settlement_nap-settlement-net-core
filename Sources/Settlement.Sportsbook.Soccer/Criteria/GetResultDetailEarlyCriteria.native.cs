using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Soccer.Criteria;

public class GetResultDetailEarlyCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public override string GetSettingKey() => $"NAP_Set_MatchSelDetail_Auto_1s";

    public override bool IsValid() => MatchId > 0;
}