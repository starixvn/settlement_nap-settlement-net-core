using System;
using AutoMapper;
using Fanex.Data.Repository;
using Microsoft.Extensions.Configuration;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Requests;
using System.Collections.Generic;
using System.Threading.Tasks;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface ICalculateService
    {
        Task<Result> Calculate(SettleRequest request);

        Task<Result> UnCalculate(SettleRequest request);

        Task<Result> CheckStatus(CheckStatusRequest request);
    }

    public class CalculateServiceImp : ICalculateService
    {
        private readonly IDynamicRepository repository;

        private readonly IMapper mapper;

        private readonly AppSettingsKey appSettingsKey;

        private readonly ICreateCriteriaService createQueryCriteria;

        private readonly ScaleOutSettleService scaleOutSettleService;

        public CalculateServiceImp
            (IMapper mapper,
            IDynamicRepository repository,
            IOptions<AppSettingsKey> appSettingsKey,
            ICreateCriteriaService createQueryCriteria,
            ScaleOutSettleService scaleOutSettleService)
        {
            this.repository = repository;
            this.appSettingsKey = appSettingsKey.Value;
            this.mapper = mapper;
            this.createQueryCriteria = createQueryCriteria;
            this.scaleOutSettleService = scaleOutSettleService;
        }

        public async Task<Result> Calculate(SettleRequest request)
        {
            var criteria = createQueryCriteria.CreateCalculateCriteria(request);
            var matchChecking = await ValidateBeforeExecute(criteria);
            if (matchChecking.ErrCode > 0)
            {
                return matchChecking;
            }
            await ExecuteAsync(criteria);
            await RefundChildMatch(criteria);
            if (request.IsApplyHedging)
            {
                criteria.MatchId = request.HedgeMatchId;
                await ExecuteAsync(criteria);
            }

            return matchChecking;
        }

        public async Task<Result> UnCalculate(SettleRequest request)
        {
            var criteria = createQueryCriteria.CreateUnCalculateCriteria(request);
            var requestChecking = await ValidateBeforeExecute(criteria);
            if (requestChecking.ErrCode > 0)
            {
                return requestChecking;
            }

            await ExecuteAsync(criteria);

            if (request.IsApplyHedging)
            {
                criteria.MatchId = request.HedgeMatchId;
                await ExecuteAsync(criteria);
            }

            return requestChecking;
        }

        public async Task<Result> CheckStatus(CheckStatusRequest request)
        {
            var criteria = mapper.Map<CheckStatusRequest, CheckStatusCriteria>(request);

            await repository.ExecuteAsync(criteria);

            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };
        }

        private async Task ExecuteAsync(CalculateCriteria criteria)
        {
            await UpdateMatchInfo(criteria);
            criteria.BroadcastSessionId = Guid.NewGuid().ToString();
            foreach (var server in appSettingsKey.SiteDbServer)
            {
                criteria.DbServer = server;
                repository.Execute(criteria);
            }
        }

        private async Task<Result> ValidateBeforeExecute(CalculateCriteria criteria)
        {
            var request = new EventTicketRequest
            {
                MatchId = criteria.MatchId,
                Action = criteria.Action,
                SpName = criteria.SpName,
                Mode = ActionKey.ActionDictionary[criteria.Action],
                ResourceResult = criteria.ResourceResult
            };
            var resultMessage = await scaleOutSettleService.ValidateEventAndTicket(request);
            return new Result
            {
                ErrCode = resultMessage.ErrorCode,
                ErrMsg = resultMessage.ErrorMessage
            };
        }

        private async Task UpdateMatchInfo(CalculateCriteria criteria)
        {
            await scaleOutSettleService.UpdateUnderSettlementFlag(criteria.MatchId, criteria.AdminId, criteria.Action);
            var requestUpdateInfo = new UpdateMatchInfoRequest
            {
                MatchId = criteria.MatchId,
                Action = criteria.Action,
                AdminId = criteria.AdminId,
                BetStatus = criteria.BetStatus,
                FullTimeAway = criteria.FullTimeAway,
                FullTimeHome = criteria.FullTimeHome,
                GoalRecord = criteria.GoalRecord,
                HalfTimeAway = criteria.HalfTimeAway,
                HalfTimeHome = criteria.HalfTimeHome,
                ResourceResult = criteria.ResourceResult
            };

            await scaleOutSettleService.UpdateMatchInfo(requestUpdateInfo);
        }

        private async Task RefundChildMatch(CalculateCriteria criteria)
        {
            var requestRefundChildMatch = new RefundChildMatchRequest
            {
                ParentId = criteria.MatchId,
                ChildMatchIds = criteria.ChildMatchIds,
                LeagueGroupId = criteria.LeagueGroupId,
                AwayValue = criteria.FullTimeAway,
                HomeValue = criteria.FullTimeHome,
                ActionName = criteria.Action
            };
            await scaleOutSettleService.UpdateAutoRefundChildMatch(requestRefundChildMatch);
        }
    }
}