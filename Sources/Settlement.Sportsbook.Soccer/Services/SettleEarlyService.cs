using Fanex.Data.Repository;
using Microsoft.Extensions.Configuration;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Requests;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Fanex.Settlement.ScaleOut.Criteria;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Settlement.Sportsbook.Soccer.Constants;

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

        private readonly ScaleOutSettleService scaleOutSettleService;

        private const string Mode = "EAR";

        public SettleEarlyServiceImp(
            ICreateCriteriaService createCriteriaService,
            IConfiguration configuration,
            IDynamicRepository repository,
            ScaleOutSettleService scaleOutSettleService)
        {
            this.createCriteriaService = createCriteriaService;
            this.configuration = configuration;
            this.repository = repository;
            this.scaleOutSettleService = scaleOutSettleService;
        }

        public async Task<Result> CalculateEarly(SettleEarlyRequest request)
        {
            var criteria = createCriteriaService.CreateCalculateEarlyCriteria(request);
            await UpdateMatchInfo(criteria);
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

            criteria.BroadcastSessionId = Guid.NewGuid().ToString();

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
            var request = new EventTicketRequest
            {
                MatchId = criteria.MatchId,
                Action = criteria.Action,
                SpName = criteria.SpName,
                Mode = Mode,
                SelectedResources = criteria.SelectedResources
            };
            var resultMessage = await scaleOutSettleService.ValidateEventAndTicket(request);
            return new Result
            {
                ErrCode = resultMessage.ErrorCode,
                ErrMsg = resultMessage.ErrorMessage
            };
        }

        private async Task UpdateMatchInfo(CalculateEarlyCriteria criteria)
        {
            await scaleOutSettleService.UpdateUnderSettlementFlag(criteria.MatchId, criteria.AdminId, criteria.Action);
            var requestUpdateInfo = new UpdateMatchInfoRequest
            {
                Action = criteria.Action,
                AdminId = criteria.AdminId,
                MatchId = criteria.MatchId,
                ResourceResult = criteria.SelectedResources
            };

            await scaleOutSettleService.UpdateMatchInfo(requestUpdateInfo);
        }
    }
}