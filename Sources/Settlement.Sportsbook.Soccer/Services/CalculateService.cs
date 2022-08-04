using AutoMapper;
using Fanex.Data.Repository;
using Microsoft.Extensions.Configuration;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Requests;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Settlement.Core.Constants;
using System.Linq;

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

        private readonly IConfiguration configuration;

        private readonly ICreateCriteriaService createQueryCriteria;

        private readonly UpdateStatusMatchService updateStatusMatchService;

        private readonly int[] listLeagueGroupHasChildMatch = { 42, 74, 108 };

        public CalculateServiceImp
            (IMapper mapper,
            IDynamicRepository repository,
            IConfiguration configuration,
            ICreateCriteriaService createQueryCriteria,
            UpdateStatusMatchService updateStatusMatchService)
        {
            this.repository = repository;
            this.configuration = configuration;
            this.mapper = mapper;
            this.createQueryCriteria = createQueryCriteria;
            this.updateStatusMatchService = updateStatusMatchService;
        }

        public async Task<Result> Calculate(SettleRequest request)
        {
            var criteria = createQueryCriteria.CreateCalculateCriteria(request);
            var requestChecking = await ValidateBeforeExecute(criteria);
            if (requestChecking.ErrCode > 0)
            {
                return requestChecking;
            }

            await updateStatusMatchService.UpdateUnderSettleFlag(criteria.MatchId, criteria.Action);

            var result = await Execute(criteria);

            if (result.IsSuccessful)
            {
                await AutoRefundChildMatch(criteria);
                if (request.IsApplyHedging)
                {
                    criteria.MatchId = request.HedgeMatchId;
                    await Execute(criteria);
                }
            }

            return result;
        }

        public async Task<Result> UnCalculate(SettleRequest request)
        {
            var criteria = createQueryCriteria.CreateUnCalculateCriteria(request);
            var requestChecking = await ValidateBeforeExecute(criteria);
            if (requestChecking.ErrCode > 0)
            {
                return requestChecking;
            }

            await updateStatusMatchService.UpdateUnderSettleFlag(criteria.MatchId, criteria.Action);

            var result = await Execute(criteria);

            if (result.IsSuccessful)
            {
                await AutoRefundChildMatch(criteria);
                if (request.IsApplyHedging)
                {
                    criteria.MatchId = request.HedgeMatchId;
                    await Execute(criteria);
                }
            }

            return result;
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

        private async Task AutoRefundChildMatch(CalculateCriteria criteria)
        {
            var isRefundChildMatch = !string.IsNullOrEmpty(criteria.ChildMatchIds)
                                     && listLeagueGroupHasChildMatch.Contains(criteria.LeagueGroupId)
                                     && (criteria.Action == ActionType.CalculateAll
                                         || criteria.Action == ActionType.CalculateFullTime);
            var finalScoreNotDraw = criteria.FullTimeAway != criteria.FullTimeHome;
            if (isRefundChildMatch && finalScoreNotDraw)
            {
                var autoRefundCriteria = new UpdateStatusChildMatchCriteria
                {
                    ParentId = criteria.MatchId,
                    ChildMatchIds = criteria.ChildMatchIds
                };

                await repository.ExecuteAsync(autoRefundCriteria);
            }
        }

        private async Task<Result> Execute(CalculateCriteria criteria)
        {
            var listReplicatedServer = configuration.GetSection("SiteDBServer").Get<List<string>>();

            foreach (var server in listReplicatedServer)
            {
                criteria.DbServer = server;
                await repository.ExecuteAsync(criteria);
            }

            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };
        }

        private async Task<Result> ValidateBeforeExecute(CalculateCriteria criteria)
        {
            var validateEvent = await ValidateEvent(criteria);

            if (validateEvent.ErrCode > 0)
            {
                return validateEvent;
            }

            var validateTicket = await ValidateTicket(criteria);

            if (validateTicket.ErrCode > 0)
            {
                return validateTicket;
            }

            return new Result();
        }

        private async Task<Result> ValidateTicket(CalculateCriteria criteria)
        {
            var servers = configuration.GetSection("SiteDBServer").Get<List<string>>();
            var checkingCriteria = new ValidateBeforePushCriteria
            {
                MatchId = criteria.MatchId,
                SpName = criteria.SpName,
                Action = criteria.Action,
                Mode = ActionKey.ActionDictionary[criteria.Action]
            };
            foreach (var server in servers)
            {
                checkingCriteria.DbServer = server;
                await repository.ExecuteAsync(checkingCriteria);
                if (checkingCriteria.ErrCode > 0)
                {
                    return new Result
                    {
                        ErrCode = checkingCriteria.ErrCode,
                        ErrMsg = checkingCriteria.ErrMsg
                    };
                }
            }

            return new Result();
        }

        private async Task<Result> ValidateEvent(CalculateCriteria criteria)
        {
            var checkEventCriteria = new ValidateEventCriteria
            {
                MatchId = criteria.MatchId,
                SpName = criteria.SpName,
                Action = criteria.Action,
                Mode = ActionKey.ActionDictionary[criteria.Action]
            };
            await repository.ExecuteAsync(checkEventCriteria);

            if (checkEventCriteria.ErrCode > 0)
            {
                return new Result
                {
                    ErrCode = checkEventCriteria.ErrCode,
                    ErrMsg = checkEventCriteria.ErrMsg
                };
            }

            return new Result();
        }
    }
}