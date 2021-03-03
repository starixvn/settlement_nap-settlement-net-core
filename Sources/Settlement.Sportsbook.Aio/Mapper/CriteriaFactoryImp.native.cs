using Settlement.Core.Constants;
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
            CriteriaTypes.Add($"{SportType.Tennis}-{ApiKeyConstant.ProviderKey}", typeof(Tennis.Criteria.GetProviderCriteria));
        }
    }
}
