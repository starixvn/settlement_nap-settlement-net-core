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

            var listSiteMatch = GetAllMatch(criteria);
            var ticketCounts = mergeDataService.MergeTicketCounts(listSiteMatch);
            var siteMatchInfo = mergeDataService.MergeSiteMatch(listSiteMatch.Select(item => item.SiteMatchInfo).ToList(), ticketCounts);
            var childMatches = mergeDataService.MergeDataChildMatches(result[1].Cast<ChildMatchModel>().ToList(), listSiteMatch);

            return new Match
            {
                MatchDetail = mapper.Map(siteMatchInfo, baseMatchDetail),
                TicketCounts = ticketCounts,
                ChildMatches = childMatches
            };
        }

        private List<SiteMatch> GetAllMatch(GetMatchDetailCriteria criteria)
        {
            var listReplicatedServer = configuration.GetSection("SiteDBServer").Get<List<string>>();
            var mappingTypes = new[] { typeof(SiteMatchDetail), typeof(TicketCounts), typeof(ChildMatchTicketInfos) };
            var listMatch = new List<SiteMatch>();

            var tasks = new List<Task>();

            foreach (var server in listReplicatedServer)
            {
                criteria.DbServer = server;
                Task getMatchTask = Task.Factory.StartNew(() => GetMatchFromCriteria(criteria, mappingTypes, listMatch));
                tasks.Add(getMatchTask);
            }

            Task.WaitAll(tasks.ToArray());

            return listMatch;
        }

        private void GetMatchFromCriteria(GetMatchDetailCriteria criteria, Type[] mappingTypes, List<SiteMatch> listMatch)
        {
            var result = repository.FetchMultiple(criteria, mappingTypes);
            var tempMatch = new SiteMatch
            {
                SiteMatchInfo = result[0].Cast<SiteMatchDetail>().FirstOrDefault(),
                TicketCounts = result[1].Cast<TicketCounts>().ToList(),
                SiteChildMatches = result[2].Cast<ChildMatchTicketInfos>().ToList(),
            };

            listMatch.Add(tempMatch);
        }
    }
}