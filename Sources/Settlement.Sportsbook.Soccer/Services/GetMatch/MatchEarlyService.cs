using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Constants;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MatchDetail = Settlement.Sportsbook.Soccer.Models.MatchDetail;

namespace Settlement.Sportsbook.Soccer.GetMatch.Services
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

        private readonly IFetchDataService fetchDataService;

        public MatchEarlyServiceImp(
            IDynamicRepository repository,
            PermissionService permission,
            IMapper mapper,
            IRefDataService refDataService,
            IGoalIconService goalIconService,
            EarlyBetTypeNameService earlyBetTypeNameService,
            IFetchDataService fetchDataService)
        {
            this.repository = repository;
            this.permission = permission;
            this.mapper = mapper;
            this.refDataService = refDataService;
            this.goalIconService = goalIconService;
            this.earlyBetTypeNameService = earlyBetTypeNameService;
            this.fetchDataService = fetchDataService;
        }

        public async Task<MatchEarly> GetMatch(int matchId)
        {
            var criteria = new GetMatchDetailEarlyCriteria { MatchId = matchId };
            var matchDetail = await repository.GetAsync<MatchDetail>(criteria);
            Check.Argument.IsNotNull(matchDetail, $"Match ${matchId} does not exist");

            matchDetail.RefDataService = refDataService;

            var goalIconQuery = mapper.Map<MatchDetail, GoalIconQueryModel>(matchDetail);
            matchDetail.GoalIcon = goalIconService.GetGoalIcon(goalIconQuery);

            var resultDetailCriteria = new GetResultDetailEarlyCriteria { MatchId = matchId };
            var fetchedResultDetails = await repository.FetchAsync<ResultDetailModel>(resultDetailCriteria);
            var (firstResultSet, secondResultSet) = await fetchDataService.GetEarlyTicketDetails(resultDetailCriteria);
            var resultDetail = fetchedResultDetails.ToList();
            MergeEarlyTicketsToResults(resultDetail, firstResultSet);

            resultDetail = MappingBetTypeName(resultDetail);
            var ticketCount = secondResultSet;

            var hedgeMatchCriteria = new GetHedgeMatchCriteria { MatchId = matchId };
            var hedgeMatchDetail = await repository.GetAsync<HedgeMatchDetail>(hedgeMatchCriteria);

            return new MatchEarly
            {
                MatchDetail = matchDetail,
                ResultDetail = resultDetail,
                TicketCounts = ticketCount,
                Permission = permission.Permission,
                HedgeMatchDetail = hedgeMatchDetail
            };
        }

        public void MergeEarlyTicketsToResults(List<ResultDetailModel> resultDetails, List<ResultDetailModel> ticketDetails)
        {
            var newTicketDetails = ticketDetails.Where(ticketDetail => !resultDetails.Any(result => result.Equals(ticketDetail)));
            if (newTicketDetails.Any())
            {
                resultDetails.AddRange(newTicketDetails);
            }

            GenerateTicketsStatus(resultDetails, ticketDetails);
        }

        private void GenerateTicketsStatus(List<ResultDetailModel> results, List<ResultDetailModel> ticketDetails)
        {
            foreach (var result in results)
            {
                var ticketDetail = ticketDetails.FirstOrDefault(detail => detail.ResourceId == result.ResourceId);
                result.TicketStatus = CreateTicketStatus(ticketDetail);
            }
        }

        private string CreateTicketStatus(ResultDetailModel ticketDetail)
        {
            if (ticketDetail == null)
            {
                return TicketStatus.NotIncluded;
            }

            if (ticketDetail.InRunning > 0)
            {
                return TicketStatus.Running;
            }

            if (ticketDetail.InWaiting > 0 && ticketDetail.InWaiting == ticketDetail.BetCount)
            {
                return TicketStatus.Waiting;
            }

            if (ticketDetail.BetMarkedCount > 0)
            {
                return TicketStatus.Marked;
            }

            var betType = ticketDetail.ResourceId.Substring(0, 3);
            if (EarlyBetTypes.SpecialBetTypes.Contains(betType) && ticketDetail.BetCount == 0)
            {
                return TicketStatus.NoTicket;
            }    

            return TicketStatus.Calculated;
        }

        private List<ResultDetailModel> MappingBetTypeName(List<ResultDetailModel> list)
        {
            const int maxResource = 3;
            var listEarly = list.Where(x => x.ResourceId.Length >= maxResource && x.TicketStatus != TicketStatus.NotIncluded).ToList();
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