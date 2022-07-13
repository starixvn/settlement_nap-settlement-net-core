using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Fanex.Data.Repository;
using Microsoft.Extensions.Configuration;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Requests;

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

        public CalculateServiceImp
            (IMapper mapper,
            IDynamicRepository repository,
            IConfiguration configuration,
            ICreateCriteriaService createQueryCriteria)
        {
            this.repository = repository;
            this.configuration = configuration;
            this.mapper = mapper;
            this.createQueryCriteria = createQueryCriteria;
        }

        public async Task<Result> Calculate(SettleRequest request)
        {
            var criteria = createQueryCriteria.CreateCalculateCriteria(request);

            var requestChecking = await ValidateBeforePush(criteria);
            if (requestChecking.ErrCode > 0)
            {
                return requestChecking;
            }

            var result = await Execute(criteria);

            if (result.IsSuccessful && request.IsApplyHedging)
            {
                criteria.MatchId = request.HedgeMatchId;
                await Execute(criteria);
            }

            return result;
        }

        public async Task<Result> UnCalculate(SettleRequest request)
        {
            var criteria = createQueryCriteria.CreateUnCalculateCriteria(request);
            var result = await Execute(criteria);

            if (result.IsSuccessful && request.IsApplyHedging)
            {
                criteria.MatchId = request.HedgeMatchId;
                await Execute(criteria);
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

        private async Task<Result> ValidateBeforePush(CalculateCriteria criteria)
        {
            var listReplicatedServer = configuration.GetSection("SiteDBServer").Get<List<string>>();
            foreach (var server in listReplicatedServer)
            {
                criteria.DbServer = server;
                await repository.ExecuteAsync(criteria);
                if (criteria.ErrCode > 0)
                {
                    return new Result
                    {
                        ErrCode = criteria.ErrCode,
                        ErrMsg = criteria.ErrMsg
                    };
                }
            }

            return new Result();
        }
    }
}