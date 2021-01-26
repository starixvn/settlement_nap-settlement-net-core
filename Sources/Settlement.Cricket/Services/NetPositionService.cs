using Fanex.Data.Repository;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Criterias;
using System;
using Client = ONEbook.Product.NetPosition.Client;


namespace Settlement.Sportsbook.Aio.Services
{
    public interface INetPositionService
    {
        Result PushNetPosition(SettleCriteria query);
    }

    public class NetPositionService : INetPositionService
    {
        private readonly IDynamicRepository repository;

        public NetPositionService(
            IDynamicRepository repository)
        {
            this.repository = repository;
        }

        public Result PushNetPosition(SettleCriteria query)
        {

        }

        private Client.Result NetPositionApi(PushNetPositionCriteria criteria, bool testMode)
        {
            try
            {
                return DoSettlement(criteria, testMode);
            }
            catch (Exception exception)
            {
                const int errorCode = 1000;
                return new Client.Result { ErrorCode = errorCode, ErrorMsg = exception.Message };
            }
        }

        public virtual Client.Result DoSettlement(NetPositionCommandCriteria criteria, bool testMode)
        {
            var netPosition = new NPService(testMode);
            int[] betTypes = { 501, 502 };
            var action = ActionName(criteria.Action);

            return netPosition.doSettlement(action, criteria.MatchId, betTypes);
        }

        private PushNetPositionCriteria CreateNPCriteria(SettleCriteria query)
        {
            const int cricketServiceType = 1;

            return new PushNetPositionCriteria
            {
                ServiceType = cricketServiceType,
                MatchId = query.MatchId,
                Action = query.Action,
                ServiceCommand = query.Command
            };
        }
    }
}
