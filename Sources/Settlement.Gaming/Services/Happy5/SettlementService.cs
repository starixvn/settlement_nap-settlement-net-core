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
using MediatR;

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

            var validateDeploymentCriteria = new GetDeploymentInfoRequest
            {
                SPName = "NAP_Admin_Settlement_s164"
            };

            var validateDeploymentResult = await scaleOutSettleThirdPartyService.GetDeploymentInfo(validateDeploymentCriteria);
            if (validateDeploymentResult.ErrorCode == 0)
            {
                criteria.StrOldResult = await GetOldResult(request.MatchId);
                await UpdateResult(request);
                await UpdateMatchInfo(request);
                Execute(criteria);
            }

            return new Result
            {
                ErrCode = validateDeploymentResult.ErrorCode,
                ErrMsg = validateDeploymentResult.ErrorMessage
            };
        }

        private async Task<string> GetOldResult(int matchId)
        {
            var getOldResultCriteria = new GetOldResultCriteria { MatchId = matchId };
            await repository.ExecuteAsync(getOldResultCriteria);
            return getOldResultCriteria.StrOldResult;
        }

        private async Task UpdateResult(Happy5SettlementRequest request)
        {
            var updateMatchCriteria = new UpdateResultCriteria
            {
                MatchId = request.MatchId,
                Resources = ballService.ResourcesBalls(request.Balls)
            };

            await repository.ExecuteAsync(updateMatchCriteria);
        }

        private async Task UpdateMatchInfo(Happy5SettlementRequest request)
        {
            var updateRequest = new UpdateMatchInfo3rdRequest
            {
                Command = "completed",
                Action = request.Action,
                MatchId = request.MatchId,
                creator = currentSession.UserId
            };

            await scaleOutSettleThirdPartyService.UpdateMatchInfo3rd(updateRequest);
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
            return new SettlementCriteria
            {
                MatchId = request.MatchId,
                Action = request.Action,
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