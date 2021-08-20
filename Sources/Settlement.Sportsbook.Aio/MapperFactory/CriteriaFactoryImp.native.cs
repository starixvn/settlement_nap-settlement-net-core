using Settlement.Sportsbook.Aio.Constants;

namespace Settlement.Sportsbook.Aio.MapperFactory
{
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
        }

        private static void Tennis()
        {
            CriteriaTypes.Add($"tennis-{ApiKeyConstant.MatchInfoKey}", typeof(Criterias.GetMatchDetailCriteria));
            CriteriaTypes.Add($"tennis-{ApiKeyConstant.HedgeMatchInfoKey}", typeof(Criterias.GetHedgeMatchCriteria));
            CriteriaTypes.Add($"tennis-{ApiKeyConstant.ResultDetailKey}", typeof(Criterias.GetResultDetailCriteria));
            CriteriaTypes.Add($"tennis-{ApiKeyConstant.ProviderKey}", typeof(Criterias.Tennis.GetProviderCriteria));
            CriteriaTypes.Add($"tennis-{ApiKeyConstant.LastestResultKey}", typeof(Criterias.GetRecalResultCriteria));
            CriteriaTypes.Add($"tennis-{ApiKeyConstant.SaveScore}", typeof(Criterias.SaveScoreCriteria));

            CriteriaTypes.Add("tennis-refund-parlay", typeof(Criterias.RefundParlayCriteria));
            CriteriaTypes.Add("tennis-settle", typeof(Criterias.SettleCriteria));
        }

        private static void Cricket()
        {
            CriteriaTypes.Add($"cricket-{ApiKeyConstant.MatchInfoKey}", typeof(Criterias.GetMatchDetailCriteria));
            CriteriaTypes.Add($"cricket-{ApiKeyConstant.HedgeMatchInfoKey}", typeof(Criterias.GetHedgeMatchCriteria));
            CriteriaTypes.Add($"cricket-{ApiKeyConstant.ResultDetailKey}", typeof(Criterias.GetResultDetailCriteria));
            CriteriaTypes.Add($"cricket-{ApiKeyConstant.ProviderKey}", typeof(Criterias.Cricket.GetProviderCriteria));
            CriteriaTypes.Add($"cricket-{ApiKeyConstant.LastestResultKey}", typeof(Criterias.GetRecalResultCriteria));
            CriteriaTypes.Add($"cricket-{ApiKeyConstant.SaveScore}", typeof(Criterias.Cricket.SaveScoreCriteria));

            CriteriaTypes.Add("cricket-refund-parlay", typeof(Criterias.RefundParlayCriteria));
            CriteriaTypes.Add("cricket-settle", typeof(Criterias.SettleCriteria));
        }

        private static void Esport()
        {
            CriteriaTypes.Add($"esport-{ApiKeyConstant.MatchInfoKey}", typeof(Criterias.GetMatchDetailCriteria));
            CriteriaTypes.Add($"esport-{ApiKeyConstant.HedgeMatchInfoKey}", typeof(Criterias.GetHedgeMatchCriteria));
            CriteriaTypes.Add($"esport-{ApiKeyConstant.ResultDetailKey}", typeof(Criterias.GetResultDetailCriteria));
            CriteriaTypes.Add($"esport-{ApiKeyConstant.ProviderKey}", typeof(Criterias.ESport.GetProviderCriteria));
            CriteriaTypes.Add($"esport-{ApiKeyConstant.LastestResultKey}", typeof(Criterias.GetRecalResultCriteria));
            CriteriaTypes.Add($"esport-{ApiKeyConstant.SaveScore}", typeof(Criterias.ESport.SaveScoreCriteria));

            CriteriaTypes.Add($"esport-settle", typeof(Criterias.SettleCriteria));
            CriteriaTypes.Add($"esport-refund-parlay", typeof(Criterias.RefundParlayCriteria));
        }

        private static void Badminton()
        {
            CriteriaTypes.Add($"badminton-{ApiKeyConstant.MatchInfoKey}", typeof(Criterias.GetMatchDetailCriteria));
            CriteriaTypes.Add($"badminton-{ApiKeyConstant.HedgeMatchInfoKey}", typeof(Criterias.GetHedgeMatchCriteria));
            CriteriaTypes.Add($"badminton-{ApiKeyConstant.ResultDetailKey}", typeof(Criterias.GetResultDetailCriteria));
            CriteriaTypes.Add($"badminton-{ApiKeyConstant.LastestResultKey}", typeof(Criterias.GetRecalResultCriteria));
            CriteriaTypes.Add($"badminton-{ApiKeyConstant.ProviderKey}", typeof(Criterias.GetProviderCriteria));
            CriteriaTypes.Add($"badminton-{ApiKeyConstant.SaveScore}", typeof(Criterias.SaveScoreCriteria));

            CriteriaTypes.Add("badminton-settle", typeof(Criterias.SettleCriteria));
            CriteriaTypes.Add("badminton-refund-parlay", typeof(Criterias.RefundParlayCriteria));
        }

        private static void Basketball()
        {
            CriteriaTypes.Add($"basketball-{ApiKeyConstant.MatchInfoKey}", typeof(Criterias.GetMatchDetailCriteria));
            CriteriaTypes.Add($"basketball-{ApiKeyConstant.HedgeMatchInfoKey}", typeof(Criterias.GetHedgeMatchCriteria));
            CriteriaTypes.Add($"basketball-{ApiKeyConstant.ResultDetailKey}", typeof(Criterias.GetResultDetailCriteria));
            CriteriaTypes.Add($"basketball-{ApiKeyConstant.LastestResultKey}", typeof(Criterias.GetRecalResultCriteria));
            CriteriaTypes.Add($"basketball-{ApiKeyConstant.ProviderKey}", typeof(Criterias.GetProviderCriteria));
            CriteriaTypes.Add($"basketball-{ApiKeyConstant.SaveScore}", typeof(Criterias.SaveScoreCriteria));

            CriteriaTypes.Add("basketball-settle", typeof(Criterias.SettleCriteria));
            CriteriaTypes.Add("basketball-refund-parlay", typeof(Criterias.RefundParlayCriteria));
        }

        private static void GameTotal()
        {
            CriteriaTypes.Add($"game-total-{ApiKeyConstant.MatchInfoKey}", typeof(Criterias.GetMatchDetailCriteria));
            CriteriaTypes.Add($"game-total-{ApiKeyConstant.HedgeMatchInfoKey}", typeof(Criterias.GetHedgeMatchCriteria));
            CriteriaTypes.Add($"game-total-{ApiKeyConstant.ResultDetailKey}", typeof(Criterias.GetResultDetailCriteria));
            CriteriaTypes.Add($"game-total-{ApiKeyConstant.LastestResultKey}", typeof(Criterias.GetRecalResultCriteria));
            CriteriaTypes.Add($"game-total-{ApiKeyConstant.ProviderKey}", typeof(Criterias.GetProviderCriteria));

            CriteriaTypes.Add($"game-total-settle", typeof(Criterias.SettleCriteria));
            CriteriaTypes.Add($"game-total-refund-parlay", typeof(Criterias.RefundParlayCriteria));
        }
    }
}