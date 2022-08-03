using Fanex.Data.Repository;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;

namespace Settlement.Core.Services
{
    public interface UpdateStatusMatchService
    {
        Task UpdateUnderSettleFlag(int matchId, string action);
    }

    public class UpdateStatusMatchServiceImp : UpdateStatusMatchService
    {
        private const int UnderSettlementId = 4;

        private readonly IDynamicRepository repository;

        private readonly INapSession currentSession;

        private readonly IHttpContextAccessor accessor;

        public UpdateStatusMatchServiceImp(IDynamicRepository repository,
            IHttpContextAccessor accessor,
            INapSession currentSession)
        {
            this.repository = repository;
            this.accessor = accessor;
            this.currentSession = currentSession;
        }

        public async Task UpdateUnderSettleFlag(int matchId, string action)
        {
            if (action != ActionType.CalculateHalfTime && action != ActionType.RefundHalfTime)
            {
                var updateStatusCriteria = new UpdateRemarkCriteria
                {
                    MatchId = matchId,
                    AdminId = currentSession.UserId,
                    Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
                    Type = UnderSettlementId,
                    IsEnabled = action != ActionType.UnCalculate
                };
                await repository.ExecuteAsync(updateStatusCriteria);
            }
        }
    }
}