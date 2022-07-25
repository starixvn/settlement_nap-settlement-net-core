using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client;
using Microsoft.Extensions.Configuration;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Models;
using Match = Settlement.Sportsbook.Soccer.Models.Match;
using MatchDetail = Settlement.Sportsbook.Soccer.Models.MatchDetail;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface IFetchDataService
    {
        public Task<Match> GetMatchInfo(GetMatchRequest request);
    }

    public class FetchDateServiceImp : IFetchDataService
    {
        private readonly IDynamicRepository repository;

        private readonly IMapper mapper;

        private readonly IConfiguration configuration;

        private readonly IMergeDataService mergeDataService;

        public FetchDateServiceImp(IDynamicRepository repository,
            IMapper mapper,
            IConfiguration configuration,
            IMergeDataService mergeDataService)
        {
            this.repository = repository;
            this.mapper = mapper;
            this.configuration = configuration;
            this.mergeDataService = mergeDataService;
        }

        public async Task<Match> GetMatchInfo(GetMatchRequest request)
        {
            var criteria = mapper.Map<GetMatchRequest, GetMatchDetailCriteria>(request);
            var mappingTypes = new[] { typeof(MatchDetail), typeof(ChildMatchModel) };

            var result = await repository.FetchMultipleAsync(criteria, mappingTypes);
            var baseMatchDetail = result[0].Cast<MatchDetail>().FirstOrDefault();
            Check.Argument.IsNotNull(baseMatchDetail, $"Match ${criteria.MatchId} does not exist");

            var siteMatch = GetSiteMatchInfo(criteria.MatchId);

            baseMatchDetail.SiteMatch = siteMatch;

            var ticketCounts = mergeDataService.MergeTicketCounts(siteMatch);
            var matchDetail = mergeDataService.MergeSiteMatch(baseMatchDetail, ticketCounts);
            var childMatches = mergeDataService.MergeDataChildMatches(result[1].Cast<ChildMatchModel>().ToList(), siteMatch);

            return new Match
            {
                MatchDetail = matchDetail,
                TicketCounts = ticketCounts,
                ChildMatches = childMatches
            };
        }

        private List<SiteMatch> GetSiteMatchInfo(int matchId)
        {
            var siteDbServer = configuration.GetSection("SiteDBServer").Get<List<string>>();
            var mappingTypes = new[] { typeof(SiteMatch), typeof(TicketCounts), typeof(ChildMatchTicketInfos) };

            return siteDbServer.Select(server => GetSiteMatchByServer(matchId, mappingTypes, server)).ToList();
        }

        private SiteMatch GetSiteMatchByServer(int matchId, Type[] mappingTypes, string server)
        {
            var criteria = new GetTicketInfoCriteria { MatchId = matchId, DbServer = server };
            var result = repository.FetchMultiple(criteria, mappingTypes);

            var siteMatch = result[0].Cast<SiteMatch>().FirstOrDefault();
            siteMatch.TicketCounts = result[1].Cast<TicketCounts>().ToList();
            siteMatch.SiteChildMatches = result[2].Cast<ChildMatchTicketInfos>().ToList();

            return siteMatch;
        }
    }
}