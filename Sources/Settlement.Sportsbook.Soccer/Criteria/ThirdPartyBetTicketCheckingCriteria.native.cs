using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Soccer.Criteria;

public class GetMatchDetailThirdPartyBetTicketCriteria : CriteriaBase
{
    public int MatchId { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_Set_BetDaq_MatchSel";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}