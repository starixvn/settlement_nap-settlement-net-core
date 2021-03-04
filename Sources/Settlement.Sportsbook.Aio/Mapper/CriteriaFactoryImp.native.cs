using Settlement.Sportsbook.Aio.Constants;

namespace Settlement.Sportsbook.Aio.Mapper
{
    public class CriteriaFactoryImp : CriteriaFactoryBase
    {
        static CriteriaFactoryImp()
        {
            Tennis();
        }

        private static void Tennis()
        {
            CriteriaTypes.Add($"tennis-{ApiKeyConstant.MatchInfoKey}", typeof(Criterias.GetMatchDetailCriteria));
            CriteriaTypes.Add($"tennis-{ApiKeyConstant.HedgeMatchInfoKey}", typeof(Criterias.GetHedgeMatchCriteria));
            CriteriaTypes.Add($"tennis-{ApiKeyConstant.ResultDetailKey}", typeof(Criterias.GetResultDetailCriteria));
            CriteriaTypes.Add($"tennis-{ApiKeyConstant.ProviderKey}", typeof(Tennis.Criteria.GetProviderCriteria));
            CriteriaTypes.Add($"tennis-{ApiKeyConstant.LastestResultKey}", typeof(Criterias.GetRecalResultCriteria));

            CriteriaTypes.Add("tennis-refund-parlay", typeof(Criterias.RefundParlayCriteria));
            CriteriaTypes.Add("tennis-settle", typeof(Criterias.SettleCriteria));
            CriteriaTypes.Add("tennis-save-score", typeof(Tennis.Criteria.SaveScoreCriteria));
        }
    }
}