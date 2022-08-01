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
using Settlement.Sportsbook.Soccer.Requests;
using Match = Settlement.Sportsbook.Soccer.Models.Match;
using MatchDetail = Settlement.Sportsbook.Soccer.Models.MatchDetail;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface IFetchDataService
    {
        public Task<Match> GetMatchInfo(GetMatchRequest request);

        public Task<BetDaq> GetMultiServersBetDaq(BetDaqCheckingCriteria criteria);

        public Task<BetFair> GetMultiServersBetFair(BetFairCheckingCriteria criteria);

        public Task<(List<ResultDetailModel>, TicketCounts)> GetEarlyResultDetails(GetResultDetailEarlyCriteria criteria);
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
            var childMatches =
                mergeDataService.MergeDataChildMatches(result[1].Cast<ChildMatchModel>().ToList(), siteMatch);

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

        public async Task<BetDaq> GetMultiServersBetDaq(BetDaqCheckingCriteria criteria)
        {
            var servers = configuration.GetSection("SiteDBServer").Get<List<string>>();
            var betDaqs = new List<BetDaq>();
            foreach (var server in servers)
            {
                criteria.DbServer = server;
                var betDaq = await repository.GetAsync<BetDaq>(criteria);
                betDaqs.Add(betDaq);
            }

            var baseData = betDaqs.First();
            var nodeData = betDaqs.Skip(1).ToList();

            // merge function
            var existConflictData = nodeData.Any(betDaq => baseData.IsExcludeBetDaq != betDaq.IsExcludeBetDaq
                                                           || baseData.IsMoveBetDaq != betDaq.IsMoveBetDaq
                                                           || baseData.IsRefundRunningBetDaq !=
                                                           betDaq.IsRefundRunningBetDaq
                                                           || baseData.IsSettleAbandonedMatchBetDaq !=
                                                           betDaq.IsSettleAbandonedMatchBetDaq);
            if (existConflictData)
            {
                return mergeDataService.MergeBetDaq(baseData, nodeData);
            }

            return baseData;
        }

        public async Task<BetFair> GetMultiServersBetFair(BetFairCheckingCriteria criteria)
        {
            var servers = configuration.GetSection("SiteDBServer").Get<List<string>>();
            var betFairs = new List<BetFair>();
            foreach (var server in servers)
            {
                criteria.DbServer = server;
                var betFair = await repository.GetAsync<BetFair>(criteria);
                betFairs.Add(betFair);
            }

            var baseData = betFairs.First();
            var nodeData = betFairs.Skip(1).ToList();

            // merge function
            var existConflictData = nodeData.Any(betDaq => baseData.IsExcludeBetFair != betDaq.IsExcludeBetFair
                                                           || baseData.IsMoveBetFair != betDaq.IsMoveBetFair
                                                           || baseData.IsRefundRunningBetFair !=
                                                           betDaq.IsRefundRunningBetFair
                                                           || baseData.IsSettleAbandonedMatchBetFair !=
                                                           betDaq.IsSettleAbandonedMatchBetFair);
            if (existConflictData)
            {
                return mergeDataService.MergeBetFair(baseData, nodeData);
            }

            return baseData;
        }

        public async Task<(List<ResultDetailModel>, TicketCounts)> GetEarlyResultDetails(GetResultDetailEarlyCriteria criteria)
        {
            var servers = configuration.GetSection("SiteDBServer").Get<List<string>>();
            var multipleTicketDetails = new List<(List<ResultDetailModel>, TicketCounts)>();
            foreach (var server in servers)
            {
                var ticketDetails = await GetTicketDetailByServer(criteria, server);
                multipleTicketDetails.Add(ticketDetails);
            }

            return mergeDataService.MergeEarlyResultDetails(multipleTicketDetails);
        }

        private async Task<(List<ResultDetailModel> betTypes, TicketCounts ticketCounts)> GetTicketDetailByServer(GetResultDetailEarlyCriteria criteria, string server)
        {
            criteria.DbServer = server;
            var (betTypes, ticketCounts) = await repository.FetchMultipleAsync<ResultDetailModel, TicketCounts>(criteria);

            return (betTypes.ToList(), ticketCounts.FirstOrDefault());
        }
    }
}