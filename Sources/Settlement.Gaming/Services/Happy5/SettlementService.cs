using Fanex.Data.Repository;
using Settlement.Core.Models;
using Settlement.Gaming.Criteria.Happy5;
using Settlement.Gaming.Requests;
using System.Threading.Tasks;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Constants;
using Fanex.Settlement.ScaleOut.Services;
using Fanex.Settlement.ScaleOut.Request;
using Microsoft.Extensions.Options;

namespace Settlement.Gaming.Services.Happy5
{
    public interface SettlementService
    {
        Task<Result> Settle(Happy5SettlementRequest request);
    }

    public class SettlementServiceImp : SettlementService
    {
        private const int NotAuthorized = 1000;

        private readonly IDynamicRepository repository;

        private readonly INapSession currentSession;

        private readonly PermissionService permissionService;

        private readonly BallService ballService;

        private readonly IHttpContextAccessor accessor;

        private readonly ScaleOutSettleThirdPartyService scaleOutSettleThirdPartyService;

        private readonly AppSettingsKey appSettingsKey;

        public SettlementServiceImp(
            IDynamicRepository repository,
            INapSession currentSession,
            PermissionService permissionService,
            IHttpContextAccessor accessor,
            BallService ballService,
            ScaleOutSettleThirdPartyService scaleOutSettleThirdPartyService,
            IOptions<AppSettingsKey> options)
        {
            this.repository = repository;
            this.currentSession = currentSession;
            this.permissionService = permissionService;
            this.accessor = accessor;
            this.ballService = ballService;
            this.scaleOutSettleThirdPartyService = scaleOutSettleThirdPartyService;
            this.appSettingsKey = options.Value;
        }

        public async Task<Result> Settle(Happy5SettlementRequest request)
        {
            var permission = permissionService.Permission;
            var isRecalculation = permission.CanCalculate && request.Action.Equals(ActionType.CalculateAll);
            var isRefund = permission.CanRefund && request.Action.Equals(ActionType.RefundAll);
            var hasPermission = isRecalculation || isRefund || permission.CanItAdmin;

            return hasPermission ? await SettleWhenHavePermission(request) : NoPermission;
        }

        private async Task<Result> SettleWhenHavePermission(Happy5SettlementRequest request)
        {
            var criteria = CreateCriteria(request);
            var validateResult = await ValidateBeforeSettle(criteria);
            if (validateResult.ErrCode != 0)
            {
                return validateResult;
            }

            var getOldResultCriteria = new GetOldResultCriteria { MatchId = request.MatchId };
            await repository.ExecuteAsync(getOldResultCriteria);

            criteria.StrOldResult = getOldResultCriteria.OldResult;
            Execute(criteria);

            return validateResult;
        }

        private async Task<Result> ValidateBeforeSettle(SettlementCriteria criteria)
        {
            var request = new EventTicketHappyFiveRequest
            {
                MatchId = criteria.MatchId,
                Action = criteria.Action
            };

            var result = await scaleOutSettleThirdPartyService.ValidateEventAndTicketHappyFive(request);

            return new Result
            {
                ErrCode = result.ErrorCode,
                ErrMsg = result.ErrorMessage
            };
        }

        private void Execute(SettlementCriteria criteria)
        {
            foreach (var server in appSettingsKey.SiteDbServer)
            {
                criteria.DbServer = server;
                repository.Execute(criteria);
            }
        }

        private SettlementCriteria CreateCriteria(Happy5SettlementRequest request)
        {
            var resources = ballService.ResourcesBalls(request.Balls);

            return new SettlementCriteria
            {
                MatchId = request.MatchId,
                Action = request.Action,
                Resources = resources,
                AdminId = currentSession.UserId,
                Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
            };
        }

        private static Result NoPermission => new Result
        {
            ErrCode = NotAuthorized,
            ErrMsg = "You are not authorized to use this function. Please contact the admin for help."
        };
    }
}