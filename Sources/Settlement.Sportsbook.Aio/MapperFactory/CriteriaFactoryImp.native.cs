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
            CriteriaTypes.Add($"cricket-{ApiKeyConstant.SaveScore}", typeof(Criterias.SaveScoreCriteria));

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
    }
}