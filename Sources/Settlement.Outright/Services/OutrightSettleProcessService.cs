using AutoMapper;
using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Outright.Criteria;

namespace Settlement.Outright.Services
{
    public interface OutrightSettleProcessService
    {
        Task<Result> UpdateResultUndo(OutrightSettleCriteria criteria);

        Task<Result> OutrightSettleMultiSite(OutrightSettleCriteria criteria);

        Task<ResultOutright> ValidateDeployment(string spName);

        Task<Result> UpdateResultCalculate(OutrightSettleCriteria criteria);
    }

    public class OutrightSettleProcessServiceImp : OutrightSettleProcessService
    {
        private readonly IDynamicRepository repository;

        private readonly AppSettingsKey appSettingsKey;

        private readonly ScaleOutSettleThirdPartyService scaleOutSettleService;

        private readonly IMapper mapper;

        public OutrightSettleProcessServiceImp(IDynamicRepository repository,
            IOptions<AppSettingsKey> appSettingsKey,
            ScaleOutSettleThirdPartyService scaleOutSettleService,
            IMapper mapper)
        {
            this.repository = repository;
            this.appSettingsKey = appSettingsKey.Value;
            this.scaleOutSettleService = scaleOutSettleService;
            this.mapper = mapper;
        }

        public async Task<Result> OutrightSettleMultiSite(OutrightSettleCriteria criteria)
        {
            var results = new List<Result>();
            foreach (var server in appSettingsKey.SiteDbServer)
            {
                criteria.DbServer = server;
                await repository.ExecuteAsync(criteria);
                results = ResultMessage(results, criteria.ErrMsg);
            }

            return new Result
            {
                ErrCode = results.Count,
                ErrMsg = string.Join("", results.Select(r => r.ErrMsg).ToArray())
            };
        }

        private List<Result> ResultMessage(List<Result> results, string message)
        {
            if (!string.IsNullOrWhiteSpace(message))
            {
                var result = new ResultOutright
                {
                    ErrMsg = $"<br/>- {message}"
                };

                results.Add(result);
            }

            return results;
        }

        public async Task<ResultOutright> ValidateDeployment(string spName)
        {
            var validateResult = await scaleOutSettleService.GetDeploymentInfo(new GetDeploymentInfoRequest { SPName = spName });

            if (validateResult.ErrorCode > 0)
            {
                return new ResultOutright
                {
                    ErrCode = validateResult.ErrorCode,
                    ErrMsg = validateResult.ErrorMessage
                };
            }

            return new ResultOutright();
        }

        public async Task<Result> UpdateResultUndo(OutrightSettleCriteria criteria)
        {
            var updateResultCriteria = new UpdateResultOutrightCriteria
            {
                Action = criteria.Action,
                Status = criteria.Status,
                MatchId = criteria.MatchId
            };

            await repository.ExecuteAsync(updateResultCriteria);

            return new Result
            {
                ErrCode = updateResultCriteria.ErrCode,
                ErrMsg = updateResultCriteria.ErrMsg
            };
        }

        public async Task<Result> UpdateResultCalculate(OutrightSettleCriteria criteria)
        {
            var updateResultCriteria = mapper.Map<OutrightSettleCriteria, UpdateResultOutrightCriteria>(criteria);
            await repository.ExecuteAsync(updateResultCriteria);

            return new Result
            {
                ErrCode = updateResultCriteria.ErrCode,
                ErrMsg = updateResultCriteria.ErrMsg
            };
        }
    }
}