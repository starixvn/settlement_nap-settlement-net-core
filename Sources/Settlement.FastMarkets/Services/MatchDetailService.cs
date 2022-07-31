using Fanex.Data.Repository;
using Fanex.NAP.Client;
using Microsoft.Extensions.Configuration;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.FastMarkets.Criteria;
using Settlement.FastMarkets.Requests;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MatchDetail = Settlement.FastMarkets.Models.MatchDetail;

namespace Settlement.FastMarkets.Services
{
    public interface IMatchDetailService
    {
        Task<MatchDetail> MatchInfo(int matchId);

        Task<MarkedTickets> CheckingMarkedTickets(CheckingMarkedTicketsRequest request);
    }

    public class MatchDetailServiceImp : IMatchDetailService
    {
        private readonly IRefDataService refDataService;

        private readonly IDynamicRepository repository;

        private readonly IGoalIconService goalIconService;

        private readonly IFastMarketResultService fastMarketResultService;

        private readonly IConfiguration configuration;

        public MatchDetailServiceImp(
            IDynamicRepository repository,
            IRefDataService refDataService,
            IGoalIconService goalIconService,
            IFastMarketResultService fastMarketResultService,
            IConfiguration configuration)
        {
            this.repository = repository;
            this.refDataService = refDataService;
            this.goalIconService = goalIconService;
            this.fastMarketResultService = fastMarketResultService;
            this.configuration = configuration;
        }

        public async Task<MatchDetail> MatchInfo(int matchId)
        {
            var criteria = new GetMatchDetailCriteria { MatchId = matchId };
            var matchDetail = await repository.GetAsync<MatchDetail>(criteria);
            Check.Argument.IsNotNull(matchDetail, $"Match ${matchId} does not exist");

            matchDetail.RefDataService = refDataService;

            var goalIconQuery = GoalIconQuery(matchDetail);
            matchDetail.GoalIcon = goalIconService.GetGoalIcon(goalIconQuery);

            return matchDetail;
        }

        private static GoalIconQueryModel GoalIconQuery(MatchDetail match)
        {
            var finalHomeScore = match.FinalHomeScore.Equals("-") ? 0 : Convert.ToInt32(match.FinalHomeScore);
            var finalAwayScore = match.FinalAwayScore.Equals("-") ? 0 : Convert.ToInt32(match.FinalAwayScore);

            return new GoalIconQueryModel
            {
                BetStatus = match.BetStatus,
                GoalRecord = match.GoalRecord,
                FinalAwayScore = finalAwayScore,
                FinalHomeScore = finalHomeScore,
                IsExistFgLg = match.IsExistFgLg,
                IsExistHtFgLg = match.IsExistHtFgLg
            };
        }

        public async Task<MarkedTickets> CheckingMarkedTickets(CheckingMarkedTicketsRequest request)
        {
            var results = fastMarketResultService.Result(request.BetTypes, string.Empty);
            var servers = configuration.GetSection("SiteDBServer").Get<List<string>>();
            var criteria = new CheckingMarkedTicketsCriteria { MatchId = request.MatchId, Results = results };
            foreach (var server in servers)
            {
                criteria.DbServer = server;
                var markedTicket = await repository.GetAsync<MarkedTickets>(criteria);
                if (markedTicket.IsExistMarkedTicket)
                {
                    return markedTicket;
                }
            }

            return new MarkedTickets();
        }
    }
}