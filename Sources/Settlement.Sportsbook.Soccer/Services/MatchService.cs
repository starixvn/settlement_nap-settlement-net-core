using System.Collections.Generic;
using AutoMapper;
using Fanex.Data.Repository;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Models;
using System.Linq;
using System.Threading.Tasks;
using Settlement.Core.Constants;
using Settlement.Sportsbook.Soccer.Requests;
using Match = Settlement.Sportsbook.Soccer.Models.Match;
using MatchDetail = Settlement.Sportsbook.Soccer.Models.MatchDetail;
using static Fanex.NAP.Client.Check;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface IMatchService
    {
        string GetBetStatus(int matchId);

        Task<Match> GetMatch(GetMatchRequest request);

        Task<Match> GetMatchRefund(GetMatchRequest request);

        Task<MatchDetail> GetLastestMatchDetail(GetLastestMatchDetailRequest request);

        Task<List<string>> GetSpecificBetTypes(GetSpecificBetTypeRequest request);
    }

    public class MatchService : IMatchService
    {
        private readonly IDynamicRepository repository;

        private readonly PermissionService permission;

        private readonly IMapper mapper;

        private readonly IRefDataService refDataService;

        private readonly IGoalIconService goalIconService;

        public MatchService(
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

        public string GetBetStatus(int matchId)
        {
            var criteria = new GetMatchInfoCriteria
            {
                MatchId = matchId
            };

            var matchInfo = repository.Get<MatchDetail>(criteria);

            return matchInfo != null ? matchInfo.BetStatus : string.Empty;
        }

        public async Task<Match> GetMatch(GetMatchRequest request)
        {
            var criteria = mapper.Map<GetMatchRequest, GetMatchDetailCriteria>(request);
            var mappingTypes = new[] { typeof(MatchDetail), typeof(ResultDetail), typeof(TicketCounts), typeof(ChildMatchModel) };
            var result = await repository.FetchMultipleAsync(criteria, mappingTypes);
            var matchDetail = result[0].Cast<MatchDetail>().FirstOrDefault();
            var resultDetails = result[1].Cast<ResultDetail>().ToList();
            Argument.IsNotNull(matchDetail, $"Match ${criteria.MatchId} does not exist");
            matchDetail.RefDataService = refDataService;
            matchDetail = HandleResultDetailSoccer(matchDetail, resultDetails);

            var goalIconQuery = GoalIconQuery(matchDetail);
            matchDetail.GoalIcon = goalIconService.GetGoalIcon(goalIconQuery);

            var hedgeMatchCriteria = new GetHedgeMatchCriteria { MatchId = request.MatchId };
            var hedgeMatchDetail = await repository.GetAsync<HedgeMatchDetail>(hedgeMatchCriteria);

            var fantasyMatch = new FantasyMatch();
            if (matchDetail.IsFantasyMatch)
            {
                fantasyMatch = await GetRelatedMatches(matchDetail.MatchId);
            }

            var childMatches = result[3].Cast<ChildMatchModel>().OrderBy(child => child.MatchCode)
                .ThenBy(child => child.MatchId).ToList();

            foreach (var match in childMatches)
            {
                match.RefDataService = refDataService;
            }

            var ticketCount = result[2].Cast<TicketCounts>().ToList();

            return new Match
            {
                MatchDetail = matchDetail,
                ResultDetails = resultDetails,
                TicketCounts = ticketCount,
                ChildMatches = childMatches,
                FantasyMatch = fantasyMatch,
                HedgeMatchDetail = hedgeMatchDetail,
                Permission = permission.Permission
            };
        }

        public async Task<Match> GetMatchRefund(GetMatchRequest request)
        {
            var criteria = mapper.Map<GetMatchRequest, GetMatchDetailCriteria>(request);
            var mappingTypes = new[] { typeof(MatchDetail), typeof(ResultDetail) };
            var result = await repository.FetchMultipleAsync(criteria, mappingTypes);
            var matchDetail = result[0].Cast<MatchDetail>().FirstOrDefault();
            var resultDetails = result[1].Cast<ResultDetail>().ToList();
            Argument.IsNotNull(matchDetail, $"Match ${criteria.MatchId} does not exist");

            matchDetail.RefDataService = refDataService;
            matchDetail = HandleResultDetailSoccer(matchDetail, resultDetails);
            var goalIconQuery = GoalIconQuery(matchDetail);
            matchDetail.GoalIcon = goalIconService.GetGoalIcon(goalIconQuery);

            var hedgeMatchCriteria = new GetHedgeMatchCriteria { MatchId = request.MatchId };
            var hedgeMatchDetail = await repository.GetAsync<HedgeMatchDetail>(hedgeMatchCriteria);

            var betDaqCriteria = new BetDaqCheckingCriteria { MatchId = request.MatchId };
            var betDaq = await repository.GetAsync<BetDaq>(betDaqCriteria);

            var betFairCriteria = new BetFairCheckingCriteria { MatchId = request.MatchId };
            var betFair = await repository.GetAsync<BetFair>(betFairCriteria);

            return new Match()
            {
                MatchDetail = matchDetail,
                ResultDetails = resultDetails,
                HedgeMatchDetail = hedgeMatchDetail,
                BetDaq = betDaq,
                BetFair = betFair,
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

        private static MatchDetail HandleResultDetailSoccer(MatchDetail match, List<ResultDetail> resultdetails)
        {
            var externalResultDetail = resultdetails.Where(result => result.SourceId == SourceType.SBO).ToList();
            var halfTimeResult = externalResultDetail.Find(result => result.ResourceId == ResourceType.Halftime);
            var fullTimeResult = externalResultDetail.Find(result => result.ResourceId == ResourceType.Final);

            if (halfTimeResult != null && !string.IsNullOrWhiteSpace(halfTimeResult.AwayValue) && !string.IsNullOrWhiteSpace(halfTimeResult.HomeValue))
            {
                match.ExHTAwayScore = int.Parse(halfTimeResult.AwayValue);
                match.ExHTHomeScore = int.Parse(halfTimeResult.HomeValue);
            }

            if (fullTimeResult != null && !string.IsNullOrWhiteSpace(fullTimeResult.AwayValue) && !string.IsNullOrWhiteSpace(fullTimeResult.HomeValue))
            {
                match.ExFTAwayScore = int.Parse(fullTimeResult.AwayValue);
                match.ExFTHomeScore = int.Parse(fullTimeResult.HomeValue);
            }

            return match;
        }

        public async Task<MatchDetail> GetLastestMatchDetail(GetLastestMatchDetailRequest request)
        {
            var criteria = mapper.Map<GetLastestMatchDetailRequest, GetLastestMatchDetailCriteria>(request);
            var matchDetail = await repository.GetAsync<MatchDetail>(criteria);
            matchDetail.RefDataService = refDataService;

            return matchDetail;
        }

        public async Task<List<string>> GetSpecificBetTypes(GetSpecificBetTypeRequest request)
        {
            var criteria = mapper.Map<GetSpecificBetTypeRequest, SpecificBetTypesCriteria>(request);
            var listBetType = await repository.FetchAsync<int>(criteria);

            return listBetType.Select(item => refDataService.GetBetTypeName(item.ToString())).ToList();
        }
    }
}