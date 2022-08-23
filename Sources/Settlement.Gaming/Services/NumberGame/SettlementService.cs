using Fanex.Data.Repository;
using Settlement.Core.Models;
using Kaden.XmlConverter;
using System.Threading.Tasks;
using Settlement.Gaming.Requests;
using Settlement.Gaming.Criteria.NumberGame;
using Settlement.Gaming.Models;
using Settlement.Gaming.Models.NumberGame;
using System.Collections.Generic;
using System.Linq;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using Fanex.Settlement.ScaleOut.Request;

namespace Settlement.Gaming.Services.NumberGame
{
    public interface SettlementService
    {
        Task<Result> Settle(NumberGameSettlementRequest request);
    }

    public class SettlementServiceImp : SettlementService
    {
        private const int NotAuthorized = 1000;

        private readonly IDynamicRepository repository;

        private readonly INapSession currentSession;

        private readonly PermissionService permissionService;

        private readonly XmlConvertService xmlConvertService;

        private readonly IHttpContextAccessor accessor;

        private readonly ScaleOutSettleThirdPartyService scaleOutSettleThirdPartyService;

        private readonly AppSettingsKey appSettingsKey;

        public SettlementServiceImp(
            IDynamicRepository repository,
            INapSession currentSession,
            PermissionService permissionService,
            XmlConvertService xmlConvertService,
            IHttpContextAccessor accessor,
            ScaleOutSettleThirdPartyService scaleOutSettleThirdPartyService,
            IOptions<AppSettingsKey> options)
        {
            this.repository = repository;
            this.currentSession = currentSession;
            this.permissionService = permissionService;
            this.xmlConvertService = xmlConvertService;
            this.accessor = accessor;
            this.scaleOutSettleThirdPartyService = scaleOutSettleThirdPartyService;
            this.appSettingsKey = options.Value;
        }

        public async Task<Result> Settle(NumberGameSettlementRequest request)
        {
            var permission = permissionService.Permission;
            var hasPermission = permission.CanCalculate || permission.CanItAdmin;

            return hasPermission ? await SettleWhenHavePermission(request) : NoPermission;
        }

        private async Task<Result> SettleWhenHavePermission(NumberGameSettlementRequest request)
        {
            var criteria = CreateCriteria(request);
            var validateDeploymentCriteria = new GetDeploymentInfoRequest
            {
                SPName = "dbo.NAP_Admin_Settlement_s161_Manual"
            };

            var validateDeploymentResult = await scaleOutSettleThirdPartyService.GetDeploymentInfo(validateDeploymentCriteria);
            if (validateDeploymentResult.ErrorCode != 0)
            {
                return new Result
                {
                    ErrCode = validateDeploymentResult.ErrorCode,
                    ErrMsg = validateDeploymentResult.ErrorMessage
                };
            }

            await UpdateResult(criteria);
            await UpdateMatchInfo(criteria);
            Execute(criteria);

            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };
        }

        private async Task UpdateResult(RecalculateNumberGameCriteria criteria)
        {
            var updateMatchCriteria = new UpdateResultCriteria
            {
                MatchId = criteria.MatchId,
                BallResults = criteria.BallResults,
            };

            await repository.ExecuteAsync(updateMatchCriteria);
        }

        private async Task UpdateMatchInfo(RecalculateNumberGameCriteria criteria)
        {
            var updateRequest = new UpdateMatchInfo3rdRequest
            {
                Command = "completed",
                MatchId = criteria.MatchId,
                creator = currentSession.UserId
            };

            await scaleOutSettleThirdPartyService.UpdateMatchInfo3rd(updateRequest);
        }

        private void Execute(RecalculateNumberGameCriteria criteria)
        {
            foreach (var server in appSettingsKey.SiteDbServer)
            {
                criteria.DbServer = server;
                repository.Execute(criteria);
            }
        }

        private RecalculateNumberGameCriteria CreateCriteria(NumberGameSettlementRequest request)
        {
            return new RecalculateNumberGameCriteria
            {
                MatchId = request.MatchId,
                AdminId = currentSession.UserId,
                Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString(),
                BallResults = GetBallResults(request.Balls)
            };
        }

        private Result NoPermission => new Result
        {
            ErrCode = NotAuthorized,
            ErrMsg = "You are not authorized to use this function. Please contact the admin for help."
        };

        private string GetBallResults(List<BallModel> balls)
        {
            var ballResultsItems = balls.Select(ball => new BallModel { Seq = ball.Seq, NumberBall = ball.NumberBall, Color = ball.Color }).ToList();

            var ballResults = new BallResultsModel
            {
                BallResultsItems = ballResultsItems
            };

            return xmlConvertService.Serialize(ballResults);
        }
    }
}