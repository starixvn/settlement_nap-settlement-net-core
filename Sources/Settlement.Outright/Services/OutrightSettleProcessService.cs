using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Criteria;
using Fanex.Settlement.ScaleOut.Models;
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

        Task<Result> ValidateDeployment(string spName);
    }

    public class OutrightSettleProcessServiceImp : OutrightSettleProcessService
    {
        private readonly IDynamicRepository repository;

        private readonly AppSettingsKey appSettingsKey;

        private readonly ScaleOutSettleThirdPartyService scaleOutSettleService;

        public OutrightSettleProcessServiceImp(IDynamicRepository repository,
            IOptions<AppSettingsKey> appSettingsKey,
            ScaleOutSettleThirdPartyService scaleOutSettleService)
        {
            this.repository = repository;
            this.appSettingsKey = appSettingsKey.Value;
            this.scaleOutSettleService = scaleOutSettleService;
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
                var result = new Result
                {
                    ErrMsg = $"<br/>- {message}"
                };

                results.Add(result);
            }

            return results;
        }

        public async Task<Result> ValidateDeployment(string spName)
        {
            var validateResult = await scaleOutSettleService.GetDeploymentInfo(new GetDeploymentInfoRequest { SPName = spName });

            if (validateResult.ErrorCode > 0)
            {
                return new Result
                {
                    ErrCode = validateResult.ErrorCode,
                    ErrMsg = validateResult.ErrorMessage
                };
            }

            return new Result();
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

        private async Task<int> GetSiteGroupId(string dbServer)
        {
            var criteria = new GetSiteGroupCriteria { DbServer = dbServer };
            var site = await repository.GetAsync<SiteGroup>(criteria);
            return site.SiteDbGroupId;
        }
    }
}