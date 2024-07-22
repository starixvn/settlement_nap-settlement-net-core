using Settlement.Sportsbook.Aio.Constants;

namespace Settlement.Sportsbook.Aio.MapperFactory;

public class CriteriaFactoryImp : CriteriaFactoryBase
{
    static CriteriaFactoryImp()
    {
        Tennis();
        Cricket();
        Esport();
        Badminton();
        GameTotal();
        Basketball();
        Bandy();
        TableTennis();
        StandardAIO();
    }

    private static void Tennis()
    {
        CriteriaTypes.Add($"tennis-{ApiKeyConstant.MatchInfoKey}", typeof(Criteria.GetMatchDetailCriteria));
        CriteriaTypes.Add($"tennis-{ApiKeyConstant.HedgeMatchInfoKey}", typeof(Criteria.GetHedgeMatchCriteria));
        CriteriaTypes.Add($"tennis-{ApiKeyConstant.ResultDetailKey}", typeof(Criteria.GetResultDetailCriteria));
        CriteriaTypes.Add($"tennis-{ApiKeyConstant.ProviderKey}", typeof(Criteria.Tennis.GetProviderCriteria));
        CriteriaTypes.Add($"tennis-{ApiKeyConstant.LatestResultKey}", typeof(Criteria.GetRecalResultCriteria));
        CriteriaTypes.Add($"tennis-{ApiKeyConstant.SaveScore}", typeof(Criteria.SaveScoreCriteria));

        CriteriaTypes.Add("tennis-settle", typeof(Criteria.SettleCriteria));
    }

    private static void Cricket()
    {
        CriteriaTypes.Add($"cricket-{ApiKeyConstant.MatchInfoKey}", typeof(Criteria.GetMatchDetailCriteria));
        CriteriaTypes.Add($"cricket-{ApiKeyConstant.HedgeMatchInfoKey}", typeof(Criteria.GetHedgeMatchCriteria));
        CriteriaTypes.Add($"cricket-{ApiKeyConstant.ResultDetailKey}", typeof(Criteria.GetResultDetailCriteria));
        CriteriaTypes.Add($"cricket-{ApiKeyConstant.ProviderKey}", typeof(Criteria.Cricket.GetProviderCriteria));
        CriteriaTypes.Add($"cricket-{ApiKeyConstant.LatestResultKey}", typeof(Criteria.GetRecalResultCriteria));
        CriteriaTypes.Add($"cricket-{ApiKeyConstant.SaveScore}", typeof(Criteria.Cricket.SaveScoreCriteria));

        CriteriaTypes.Add("cricket-settle", typeof(Criteria.SettleCriteria));
    }

    private static void Esport()
    {
        CriteriaTypes.Add($"esport-{ApiKeyConstant.MatchInfoKey}", typeof(Criteria.GetMatchDetailCriteria));
        CriteriaTypes.Add($"esport-{ApiKeyConstant.HedgeMatchInfoKey}", typeof(Criteria.GetHedgeMatchCriteria));
        CriteriaTypes.Add($"esport-{ApiKeyConstant.ResultDetailKey}", typeof(Criteria.GetResultDetailCriteria));
        CriteriaTypes.Add($"esport-{ApiKeyConstant.ProviderKey}", typeof(Criteria.ESport.GetProviderCriteria));
        CriteriaTypes.Add($"esport-{ApiKeyConstant.LatestResultKey}", typeof(Criteria.GetRecalResultCriteria));
        CriteriaTypes.Add($"esport-{ApiKeyConstant.SaveScore}", typeof(Criteria.ESport.SaveScoreCriteria));
        CriteriaTypes.Add($"esport-{ApiKeyConstant.OldMatch}", typeof(Criteria.ESport.GetOldMatchCriteria));

        CriteriaTypes.Add("esport-settle", typeof(Criteria.SettleCriteria));
    }

    private static void Badminton()
    {
        CriteriaTypes.Add($"badminton-{ApiKeyConstant.MatchInfoKey}", typeof(Criteria.GetMatchDetailCriteria));
        CriteriaTypes.Add($"badminton-{ApiKeyConstant.HedgeMatchInfoKey}", typeof(Criteria.GetHedgeMatchCriteria));
        CriteriaTypes.Add($"badminton-{ApiKeyConstant.ResultDetailKey}", typeof(Criteria.GetResultDetailCriteria));
        CriteriaTypes.Add($"badminton-{ApiKeyConstant.LatestResultKey}", typeof(Criteria.GetRecalResultCriteria));
        CriteriaTypes.Add($"badminton-{ApiKeyConstant.ProviderKey}", typeof(Criteria.GetProviderCriteria));
        CriteriaTypes.Add($"badminton-{ApiKeyConstant.SaveScore}", typeof(Criteria.SaveScoreCriteria));

        CriteriaTypes.Add("badminton-settle", typeof(Criteria.SettleCriteria));
    }

    private static void Basketball()
    {
        CriteriaTypes.Add($"basketball-{ApiKeyConstant.MatchInfoKey}", typeof(Criteria.GetMatchDetailCriteria));
        CriteriaTypes.Add($"basketball-{ApiKeyConstant.HedgeMatchInfoKey}", typeof(Criteria.GetHedgeMatchCriteria));
        CriteriaTypes.Add($"basketball-{ApiKeyConstant.ResultDetailKey}", typeof(Criteria.GetResultDetailCriteria));
        CriteriaTypes.Add($"basketball-{ApiKeyConstant.LatestResultKey}", typeof(Criteria.GetRecalResultCriteria));
        CriteriaTypes.Add($"basketball-{ApiKeyConstant.ProviderKey}", typeof(Criteria.GetProviderCriteria));
        CriteriaTypes.Add($"basketball-refund-{ApiKeyConstant.ProviderKey}", typeof(Criteria.GetResultConfirmRefundCriteria));
        CriteriaTypes.Add($"basketball-{ApiKeyConstant.SaveScore}", typeof(Criteria.SaveScoreCriteria));

        CriteriaTypes.Add("basketball-settle", typeof(Criteria.SettleCriteria));
    }

    private static void GameTotal()
    {
        CriteriaTypes.Add($"game-total-{ApiKeyConstant.MatchInfoKey}", typeof(Criteria.GetMatchDetailCriteria));
        CriteriaTypes.Add($"game-total-{ApiKeyConstant.HedgeMatchInfoKey}", typeof(Criteria.GetHedgeMatchCriteria));
        CriteriaTypes.Add($"game-total-{ApiKeyConstant.ResultDetailKey}", typeof(Criteria.GetResultDetailCriteria));
        CriteriaTypes.Add($"game-total-{ApiKeyConstant.LatestResultKey}", typeof(Criteria.GetRecalResultCriteria));
        CriteriaTypes.Add($"game-total-{ApiKeyConstant.ProviderKey}", typeof(Criteria.GetProviderCriteria));
        CriteriaTypes.Add($"game-total-{ApiKeyConstant.ChildMatchKey}", typeof(Criteria.Volleyball.GetChildMatchCriteria));
        CriteriaTypes.Add($"game-total-{ApiKeyConstant.SaveScore}", typeof(Criteria.SaveScoreCriteria));

        CriteriaTypes.Add("game-total-settle", typeof(Criteria.SettleCriteria));
    }

    private static void Bandy()
    {
        CriteriaTypes.Add($"bandy-{ApiKeyConstant.MatchInfoKey}", typeof(Criteria.GetMatchDetailCriteria));
        CriteriaTypes.Add($"bandy-{ApiKeyConstant.HedgeMatchInfoKey}", typeof(Criteria.GetHedgeMatchCriteria));
        CriteriaTypes.Add($"bandy-{ApiKeyConstant.ResultDetailKey}", typeof(Criteria.GetResultDetailCriteria));
        CriteriaTypes.Add($"bandy-{ApiKeyConstant.LatestResultKey}", typeof(Criteria.GetRecalResultCriteria));
        CriteriaTypes.Add($"bandy-{ApiKeyConstant.ProviderKey}", typeof(Criteria.GetProviderCriteria));
        CriteriaTypes.Add($"bandy-{ApiKeyConstant.ChildMatchKey}", typeof(Criteria.Volleyball.GetChildMatchCriteria));
        CriteriaTypes.Add($"bandy-{ApiKeyConstant.SaveScore}", typeof(Criteria.SaveScoreCriteria));
        CriteriaTypes.Add("bandy-settle", typeof(Criteria.SettleCriteria));
    }

    private static void TableTennis()
    {
        CriteriaTypes.Add($"tableTennis-{ApiKeyConstant.MatchInfoKey}", typeof(Criteria.GetMatchDetailCriteria));
        CriteriaTypes.Add($"tableTennis-{ApiKeyConstant.HedgeMatchInfoKey}", typeof(Criteria.GetHedgeMatchCriteria));
        CriteriaTypes.Add($"tableTennis-{ApiKeyConstant.ResultDetailKey}", typeof(Criteria.GetResultDetailCriteria));
        CriteriaTypes.Add($"tableTennis-{ApiKeyConstant.LatestResultKey}", typeof(Criteria.GetRecalResultCriteria));
        CriteriaTypes.Add($"tableTennis-{ApiKeyConstant.ProviderKey}", typeof(Criteria.GetProviderCriteria));
        CriteriaTypes.Add($"tableTennis-{ApiKeyConstant.ChildMatchKey}", typeof(Criteria.Volleyball.GetChildMatchCriteria));
        CriteriaTypes.Add($"tableTennis-{ApiKeyConstant.SaveScore}", typeof(Criteria.SaveScoreCriteria));

        CriteriaTypes.Add("tableTennis-settle", typeof(Criteria.SettleCriteria));
    }
    
     private static void StandardAIO()
    {
        CriteriaTypes.Add($"standard-{ApiKeyConstant.MatchInfoKey}", typeof(Criteria.GetMatchDetailCriteria));
        CriteriaTypes.Add($"standard-{ApiKeyConstant.HedgeMatchInfoKey}", typeof(Criteria.GetHedgeMatchCriteria));
        CriteriaTypes.Add($"standard-{ApiKeyConstant.ResultDetailKey}", typeof(Criteria.GetResultDetailCriteria));
        CriteriaTypes.Add($"standard-{ApiKeyConstant.LatestResultKey}", typeof(Criteria.GetRecalResultCriteria));
        CriteriaTypes.Add($"standard-{ApiKeyConstant.ProviderKey}", typeof(Criteria.GetProviderCriteria));
        CriteriaTypes.Add($"standard-{ApiKeyConstant.SaveScore}", typeof(Criteria.SaveScoreCriteria));
        CriteriaTypes.Add("standard-settle", typeof(Criteria.SettleCriteria));
    }

    
}