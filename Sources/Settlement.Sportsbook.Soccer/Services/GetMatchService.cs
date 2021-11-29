using System.Collections.Generic;
using AutoMapper;
using Fanex.Data.Repository;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Criterias;
using Settlement.Sportsbook.Soccer.Models;
using System.Linq;
using System.Threading.Tasks;
using Match = Settlement.Sportsbook.Soccer.Models.Match;
using MatchDetail = Settlement.Sportsbook.Soccer.Models.MatchDetail;
using static Fanex.NAP.Client.Check;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface IGetMatchService
    {
        Task<Match> GetMatch(GetMatchRequest request);
    }

    public class GetMatchService : IGetMatchService
    {
        private readonly IDynamicRepository repository;

        private readonly PermissionService permission;

        private readonly IMapper mapper;

        private readonly IRefDataService refDataService;

        private readonly IGoalIconService goalIconService;

        public GetMatchService(
            IDynamicRepository repository,
            PermissionService permission,
            IMapper mapper,
            IRefDataService refDataService,
            IGoalIconService goalIconService)
        {
            this.repository = repository;
            this.permission = permission;
            this.mapper = mapper;
            this.refDataService = refDataService;
            this.goalIconService = goalIconService;
        }

        public async Task<Match> GetMatch(GetMatchRequest request)
        {
            var criteria = mapper.Map<GetMatchRequest, GetMatchDetailCriteria>(request);
            var mappingTypes = new[] { typeof(MatchDetail), typeof(ResultDetail), typeof(TicketCounts), typeof(ChildMatchModel) };
            var result = await repository.FetchMultipleAsync(criteria, mappingTypes);
            var matchDetail = result[0].Cast<MatchDetail>().FirstOrDefault();
            Argument.IsNotNull(matchDetail, $"Match ${criteria.MatchId} does not exist");
            matchDetail.RefDataService = refDataService;

            var goalIconQuery = GoalIconQuery(matchDetail);
            matchDetail.GoalIcon = goalIconService.GetGoalIcon(goalIconQuery);

            var providerCriteria = new GetExternalResultCriteria
            {
                MatchId = criteria.MatchId
            };

            var externalResultDetails = await repository.FetchAsync<ResultDetail>(providerCriteria);
            matchDetail = ProviderScore(matchDetail, externalResultDetails.ToList());

            var fantasyMatch = new FantasyMatch();
            if (matchDetail.IsFantasyMatch)
            {
                fantasyMatch = await GetRelatedMatches(matchDetail.MatchId);
            }

            return new Match
            {
                MatchDetail = matchDetail,
                ResultDetails = result[1].Cast<ResultDetail>().ToList(),
                TicketCounts = result[2].Cast<TicketCounts>().ToList(),
                ChildMatches = result[3].Cast<ChildMatchModel>().ToList(),
                FantasyMatch = fantasyMatch,
                Permission = permission.Permission
            };
        }

        private GoalIconQueryModel GoalIconQuery(MatchDetail match)
        {
            return new GoalIconQueryModel
            {
                BetStatus = match.BetStatus,
                GoalRecord = match.GoalRecord,
                FinalAwayScore = match.FinalAwayScore,
                FinalHomeScore = match.FinalHomeScore,
                IsExistFgLg = match.IsExistFgLg,
                IsExistHtFgLg = match.IsExistHtFgLg
            };
        }

        private MatchDetail ProviderScore(MatchDetail matchDetail, List<ResultDetail> externalResultDetails)
        {
            const string fullTimeResource = "00";
            const string halfTimeResource = "01";
            var fulltimeExScore = externalResultDetails.FirstOrDefault(item => item.ResourceId == fullTimeResource);
            if (fulltimeExScore != null && !string.IsNullOrEmpty(fulltimeExScore.HomeValue) && !string.IsNullOrEmpty(fulltimeExScore.AwayValue))
            {
                matchDetail.ExternalSourceName = fulltimeExScore.SourceName;
                matchDetail.ExFTAwayScore = int.Parse(fulltimeExScore.AwayValue);
                matchDetail.ExFTHomeScore = int.Parse(fulltimeExScore.HomeValue);
            }

            var halftimeExScore = externalResultDetails.FirstOrDefault(item => item.ResourceId == halfTimeResource);
            
            if (halftimeExScore != null && !string.IsNullOrEmpty(halftimeExScore.HomeValue) && !string.IsNullOrEmpty(halftimeExScore.AwayValue))
            {
                matchDetail.ExternalSourceName = halftimeExScore.SourceName;
                matchDetail.ExHTAwayScore = int.Parse(halftimeExScore.AwayValue);
                matchDetail.ExHTHomeScore = int.Parse(halftimeExScore.HomeValue);
            }

            return matchDetail;
            }

        private async Task<FantasyMatch> GetRelatedMatches(int matchId)
        {
            var criteria = new GetFantasyMatchCriteria
            {
                MatchId = matchId
            };

            var result = await repository.FetchMultipleAsync<FantasyMatchDetail, FantasyRelatedMatch>(criteria);
            var matchDetail = result.firstResultSet.FirstOrDefault();
            var relatedMatches = result.secondResultSet.OrderBy(match => match.MatchCode).ToList();
            foreach (var match in relatedMatches)
            {
                match.RefDataService = refDataService;
            }

            return new FantasyMatch
            {
                FantasyMatchDetail = matchDetail,
                RelatedMatches = relatedMatches
            };
        }
    }
}