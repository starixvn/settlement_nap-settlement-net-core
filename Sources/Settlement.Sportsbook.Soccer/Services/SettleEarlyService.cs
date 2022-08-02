using Fanex.Data.Repository;
using Microsoft.Extensions.Configuration;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Requests;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface SettleEarlyService
    {
        public Task<Result> CalculateEarly(SettleEarlyRequest request);
    }

    public class SettleEarlyServiceImp : SettleEarlyService
    {
        private readonly ICreateCriteriaService createCriteriaService;

        private readonly IConfiguration configuration;

        private readonly IDynamicRepository repository;

        private const string Mode = "EAR";

        public SettleEarlyServiceImp(
            ICreateCriteriaService createCriteriaService,
            IConfiguration configuration,
            IDynamicRepository repository)
        {
            this.createCriteriaService = createCriteriaService;
            this.configuration = configuration;
            this.repository = repository;
        }

        public async Task<Result> CalculateEarly(SettleEarlyRequest request)
        {
            var criteria = createCriteriaService.CreateCalculateEarlyCriteria(request);
            var result = await Execute(criteria);
            return result;
        }

        private async Task<Result> Execute(CalculateEarlyCriteria criteria)
        {
            var listReplicatedServer = configuration.GetSection("SiteDBServer").Get<List<string>>();
            var requestChecking = await ValidateBeforeExecute(criteria);
            if (requestChecking.ErrCode > 0)
            {
                return requestChecking;
            }

            criteria.SessionId = Guid.NewGuid().ToString();

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

        private async Task<Result> ValidateBeforeExecute(CalculateEarlyCriteria criteria)
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

        private async Task<Result> ValidateTicket(CalculateEarlyCriteria criteria)
        {
            var servers = configuration.GetSection("SiteDBServer").Get<List<string>>();
            var checkingCriteria = new ValidateBeforePushCriteria
            {
                MatchId = criteria.MatchId,
                SpName = criteria.SpName,
                Action = criteria.Action,
                SelectedResources = criteria.SelectedResources,
                Mode = Mode
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

        private async Task<Result> ValidateEvent(CalculateEarlyCriteria criteria)
        {
            var checkEventCriteria = new ValidateEventCriteria
            {
                MatchId = criteria.MatchId,
                SpName = criteria.SpName,
                Action = criteria.Action,
                SelectedResources = criteria.SelectedResources,
                Mode = Mode
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