using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.MoveTickets.Criteria;
using Settlement.Sportsbook.MoveTickets.Models;
using Settlement.Sportsbook.MoveTickets.Requests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.MoveTickets.Services
{
    public interface IMoveTicketService
    {
        Task<List<SportModel>> GetSportBook(GetMatchRequest request);

        Task<Result> MoveTicket(MoveTicketRequest request);

        Task<List<ChildMatch>> GetChildMatch(GetChildMatchRequest request);

        Task<Result> ValidateMovingRunningTickets(ValidateMatchesRequest request);

        Task<List<MoveTicketsMatchDetail>> GetMoveTicketsMatches(GetMoveTicketsMatchesRequest request);

        Task<Result> MoveRunningTickets(MoveRunningTicketsRequest request);
    }

    public class MoveTicketServiceImp : IMoveTicketService
    {
        private readonly int actionIdMoveTicket = 81026;
        private readonly int actionIDMoveRunningTickets = 81035;
        private readonly IDynamicRepository repository;
        private readonly IRefDataService refDataService;
        private readonly IMapper mapper;
        private readonly IMatchService matchService;
        private readonly INapSession currentSession;
        private readonly IHttpContextAccessor accessor;
        private readonly ILogService logService;

        public MoveTicketServiceImp(
            IDynamicRepository repository,
            IRefDataService refDataService,
            IMapper mapper,
            IMatchService matchService,
            INapSession currentSession,
            IHttpContextAccessor accessor,
            ILogService logService)
        {
            this.repository = repository;
            this.refDataService = refDataService;
            this.mapper = mapper;
            this.matchService = matchService;
            this.currentSession = currentSession;
            this.accessor = accessor;
            this.logService = logService;
        }

        public async Task<List<SportModel>> GetSportBook(GetMatchRequest request)
        {
            var criteria = mapper.Map<GetMatchRequest, SportsbookCriteria>(request);
            var data = await FetchMatchesAndResultDetails(criteria);
            var matchesByEachSport = GetMoreScore(data);

            var matches = new List<Match>();
            matchesByEachSport.ForEach(sport => sport.Matches.ForEach(match =>
            {
                match.RefDataService = refDataService;
                matches.Add(match);
            }));

            GetReferenceAction(matches);

            var sportBooks = matches.GroupBy(match => new { match.SportName, match.SportType })
                                    .Select(sports => new SportModel
                                    {
                                        Id = sports.Key.SportType,
                                        Name = sports.Key.SportName,
                                        Leagues = GroupLeague(sports)
                                    }).ToList();

            return sportBooks;
        }

        private void GetReferenceAction(List<Match> data)
        {
            var listMatchId = data.Select(match => match.MatchId).ToList();
            var matchIds = string.Join(',', listMatchId);
            var criteria = new GetReferenceActionCriteria
            {
                MatchIds = matchIds
            };

            var referenceActions = repository.Fetch<ReferenceAction>(criteria);

            foreach (var match in data)
            {
                var referenceActionByMatchId = referenceActions.Where(item => item.MatchId == match.MatchId).ToList();
                match.ReferenceActions = referenceActionByMatchId;
            }
        }

        private List<MatchesBySportTypeModel> GetMoreScore(MultiSportResult data)
        {
            var matchesByEachSport = data.Matches.GroupBy(match => match.SportType)
                                                .Select(sports => new MatchesBySportTypeModel { SportType = sports.Key, Matches = sports.ToList() })
                                                .ToList();
            foreach (var item in matchesByEachSport)
            {
                item.Matches = matchService.GetScoreForMatchBySportType(item.Matches, data.ResultDetails, item.SportType, 0);
            }

            return matchesByEachSport;
        }

        private static List<LeagueModel> GroupLeague(IEnumerable<Match> sports)
        {
            return sports.GroupBy(sport => new
            {
                sport.LeagueName,
                sport.LeagueId
            })
            .OrderBy(league => league.Key.LeagueName)
            .Select(league => new LeagueModel
            {
                Name = league.Key.LeagueName,
                LeagueId = league.Key.LeagueId,
                Matches = SortMatch(league)
            }).ToList();
        }

        private static List<Match> SortMatch(IEnumerable<Match> leagues)
        {
            var eventStatuses = new List<string>
            {
                "Running",
                "Result Pending",
                "Postponed",
                "Internal",
                "Closed",
                "Completed",
                "Refund HT",
                "Refund FT",
                "Refund"
            };
            return leagues.OrderBy(PositionByEventStatus)
                          .ThenBy(match => eventStatuses.IndexOf(match.NewEventStatus))
                          .ThenBy(match => match.KickOffTime)
                          .ThenBy(match => match.MatchId)
                          .ToList();
        }

        private static int PositionByEventStatus(Match match)
        {
            const int firstPosition = 1;
            const int secondPosition = 2;
            return IsSettleAndHasRunningTicket(match) ? firstPosition : secondPosition;
        }

        private static bool IsSettleAndHasRunningTicket(Match match)
        {
            var isCalc = match.NewEventStatus.Equals(EventStatus.Refund, StringComparison.OrdinalIgnoreCase) || match.NewEventStatus.Equals(EventStatus.Completed, StringComparison.OrdinalIgnoreCase);

            return isCalc && (match.IsExistMarkedTicket || match.IsExistRunningTicket || match.IsExistMarkedTicketParlay);
        }

        private async Task<MultiSportResult> FetchMatchesAndResultDetails(ICriteria criteria)
        {
            var (firstResultSet, secondResultSet) = await repository.FetchMultipleAsync<Match, ResultDetail>(criteria);
            return new MultiSportResult
            {
                Matches = firstResultSet.ToList(),
                ResultDetails = secondResultSet.ToList()
            };
        }

        public async Task<Result> MoveTicket(MoveTicketRequest request)
        {
            var criteria = mapper.Map<MoveTicketRequest, MoveTicketCriteria>(request);
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
            await repository.ExecuteAsync(criteria);

            if (criteria.ErrCode != 0)
            {
                logService.ActionLog(request.MatchId, criteria.ErrMsg, actionIdMoveTicket);
            }

            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };
        }

        public async Task<List<ChildMatch>> GetChildMatch(GetChildMatchRequest request)
        {
            var criteria = mapper.Map<GetChildMatchRequest, GetChildMatchCriteria>(request);

            var listMatch = await repository.FetchAsync<ChildMatch>(criteria);

            return listMatch.ToList();
        }

        public async Task<Result> ValidateMovingRunningTickets(ValidateMatchesRequest request)
        {
            var criteria = mapper.Map<ValidateMatchesRequest, ValidateMatchesCriteria>(request);

            await repository.ExecuteAsync(criteria);

            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };
        }

        public async Task<List<MoveTicketsMatchDetail>> GetMoveTicketsMatches(GetMoveTicketsMatchesRequest request)
        {
            var criteria = mapper.Map<GetMoveTicketsMatchesRequest, GetMoveTicketsMatchesCriteria>(request);

            var matches = await repository.FetchAsync<MoveTicketsMatchDetail>(criteria);
            foreach (var match in matches)
            {
                match.RefDataService = refDataService;
            }

            return matches.ToList();
        }

        public async Task<Result> MoveRunningTickets(MoveRunningTicketsRequest request)
        {
            var criteria = mapper.Map<MoveRunningTicketsRequest, MoveRunningTicketsCriteria>(request);
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
            await repository.ExecuteAsync(criteria);

            if (criteria.ErrCode != 0)
            {
                logService.ActionLog(request.MatchId, criteria.ErrMsg, actionIDMoveRunningTickets);
            }

            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };
        }
    }
}