using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Models;
using MatchDetail = Settlement.Sportsbook.Soccer.Models.MatchDetail;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface MatchEarlyService
    {
        Task<MatchEarly> GetMatch(int matchId);
    }

    public class MatchEarlyServiceImp : MatchEarlyService
    {
        private readonly IDynamicRepository repository;

        private readonly PermissionService permission;

        private readonly IRefDataService refDataService;

        private readonly IGoalIconService goalIconService;

        private readonly EarlyBetTypeNameService earlyBetTypeNameService;

        private readonly IMapper mapper;

        public MatchEarlyServiceImp(
            IDynamicRepository repository,
            PermissionService permission,
            IMapper mapper,
            IRefDataService refDataService,
            IGoalIconService goalIconService,
            EarlyBetTypeNameService earlyBetTypeNameService)
        {
            this.repository = repository;
            this.permission = permission;
            this.mapper = mapper;
            this.refDataService = refDataService;
            this.goalIconService = goalIconService;
            this.earlyBetTypeNameService = earlyBetTypeNameService;
        }
        public async Task<MatchEarly> GetMatch(int matchId)
        {
            var criteria = new GetMatchDetailCriteria { MatchId = matchId };
            var matchDetail = await repository.GetAsync<MatchDetail>(criteria);
            Check.Argument.IsNotNull(matchDetail, $"Match ${matchId} does not exist");

            matchDetail.RefDataService = refDataService;

            var goalIconQuery = mapper.Map<MatchDetail, GoalIconQueryModel>(matchDetail);
            matchDetail.GoalIcon = goalIconService.GetGoalIcon(goalIconQuery);

            var resultDetailCriteria = new GetResultDetailEarlyCriteria { MatchId = matchId };
            var (firstResultSet, secondResultSet) = await repository.FetchMultipleAsync<ResultDetailModel, TicketCounts>(resultDetailCriteria);
            var resultDetail = MappingBetTypeName(firstResultSet.ToList());
            var ticketCount = secondResultSet.FirstOrDefault() ?? new TicketCounts();

            return new MatchEarly
            {
                MatchDetail = matchDetail,
                ResultDetail = resultDetail,
                TicketCounts = ticketCount,
                Permission = permission.Permission,
            };
        }

        private List<ResultDetailModel> MappingBetTypeName(List<ResultDetailModel> list)
        {
            const int maxResource = 3;
            var listEarly = list.Where(x => x.ResourceId.Length >= maxResource).ToList();
            foreach (var item in listEarly)
            {
                var resourceId = item.ResourceId;
                var betType = resourceId.Substring(0, maxResource);
                var betTypeId = Convert.ToInt32(betType);
                item.BetType = betType;
                item.Map = earlyBetTypeNameService.GetGroupMap(betTypeId, resourceId);
                item.BetTypeName = earlyBetTypeNameService.GetBetTypeName(betTypeId, resourceId);
            }

            return listEarly;
        }
    }
}
