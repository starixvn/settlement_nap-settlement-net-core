using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using NSubstitute;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.MoveTickets.Criterias;
using Settlement.Sportsbook.MoveTickets.Requests;
using Settlement.Sportsbook.MoveTickets.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Settlement.Sportsbook.MoveTickets.UnitTests.Services
{
    public class MoveTicketServiceTests
    {
        private readonly IDynamicRepository repository;
        private readonly IRefDataService refDataService;
        private readonly IMapper mapper;
        private readonly IMatchService matchService;
        private readonly INapSession currentSession;
        private readonly IHttpContextAccessor accessor;
        private readonly ILogService logService;
        private readonly IMoveTicketService service;

        public MoveTicketServiceTests()
        {
            repository = Substitute.For<IDynamicRepository>();
            refDataService = Substitute.For<IRefDataService>();
            matchService = Substitute.For<IMatchService>();
            currentSession = Substitute.For<INapSession>();
            accessor = Substitute.For<IHttpContextAccessor>();
            logService = Substitute.For<ILogService>();
            var context = new DefaultHttpContext();
            context.Connection.RemoteIpAddress = new System.Net.IPAddress(1);
            accessor.HttpContext = context;
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<SportsbookMoveTicketAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            mapper = new Mapper(config);
            service = new MoveTicketService(repository, refDataService, mapper, matchService, currentSession, accessor, logService);
        }

        private Match CreateMatch(int matchId, string eventStatus, bool isMarkedTicket)
        {
            return new Match
            {
                MatchId = matchId,
                SportType = 50,
                EventStatus = eventStatus,
                IsExistMarkedTicket = isMarkedTicket,
                RefDataService = refDataService,
                ReferenceActions = new List<ReferenceAction>(),
            };
        }

        [Fact]
        public async Task GetSportBook_Always_ReturnsExpectedOrderMatch()
        {
            // Arrange
            var resultDetail = new ResultDetail();
            resultDetail.MatchId = 1;
            resultDetail.ResourceId = "01";
            var referenceAction = new ReferenceAction();
            referenceAction.LogDate = new DateTime(2000, 1, 3, 7, 0, 0);
            referenceAction.MatchId = 1;
            var fakeReferenceAction = new List<ReferenceAction> { referenceAction };
            var fakeMatches = new List<Match> {
                CreateMatch(2, "Completed", false),
                CreateMatch(1, "Completed", true),
                CreateMatch(3, "Result Pending", false),
                CreateMatch(4, "Closed", false),
                CreateMatch(5, "Refund FT", false),
                CreateMatch(6, "Refund HT", false),
                CreateMatch(7, "Refund", false),
                CreateMatch(8, "Running", false),
                CreateMatch(9, "Postponed", false),
                CreateMatch(10, "Internal", false),
            };

            var fakeData = new ValueTuple<IEnumerable<Match>, IEnumerable<ResultDetail>>();

            fakeData.Item1 = fakeMatches;
            fakeData.Item2 = new List<ResultDetail> { resultDetail };
            repository.FetchMultipleAsync<Match, ResultDetail>(Arg.Any<ICriteria>()).Returns(fakeData);
            repository.Fetch<ReferenceAction>(Arg.Any<ICriteria>()).Returns(fakeReferenceAction);
            matchService.GetScoreForMatchBySportType(Arg.Any<List<Match>>(), Arg.Any<List<ResultDetail>>(), Arg.Any<int>(), Arg.Any<int>()).Returns(fakeMatches);

            // Act
            var sportBooks = await service.GetSportBook(new GetMatchRequest());
            var actualMatches = sportBooks[0].Leagues[0].Matches;

            // Assert
            var expectedMatches = new List<Match> {
                CreateMatch(1, "Completed", true),
                CreateMatch(8, "Running", false),
                CreateMatch(3, "Result Pending", false),
                CreateMatch(9, "Postponed", false),
                CreateMatch(10, "Internal", false),
                CreateMatch(4, "Closed", false),
                CreateMatch(2, "Completed", false),
                CreateMatch(6, "Refund HT", false),
                CreateMatch(5, "Refund FT", false),
                CreateMatch(7, "Refund", false),
            };

            expectedMatches[0].ReferenceActions.Add(referenceAction);

            Assert.Equal(JsonConvert.SerializeObject(expectedMatches), JsonConvert.SerializeObject(actualMatches));
        }

        [Fact]
        public async Task MoveTicket_Always_ReturnResult()
        {
            repository.ExecuteAsync(Arg.Do<MoveTicketCriteria>(x =>
            {
                x.ErrCode = 0;
                x.ErrMsg = "";
            })).Returns(1);

            var actual = await service.MoveTicket(new MoveTicketRequest());

            Assert.True(actual.IsSuccessful);
        }

        [Fact]
        public async Task MoveTicket_IsFail_AlwaysCallActionLog()
        {
            repository.ExecuteAsync(Arg.Do<MoveTicketCriteria>(x =>
            {
                x.ErrCode = 1;
                x.ErrMsg = "message";
            })).Returns(1);

            await service.MoveTicket(new MoveTicketRequest());

            logService.Received().ActionLog(Arg.Any<int>(), Arg.Any<string>());
        }

        [Fact]
        public async Task GetChildMatch_Always_ReturnCorrectMatch()
        {
            var listMatch = new List<ChildMatch>
            {
                new ChildMatch {matchId = 1}
            };

            repository.FetchAsync<ChildMatch>(Arg.Any<ICriteria>()).Returns(listMatch);

            var actual = await service.GetChildMatch(new GetChildMatchRequest());

            Assert.Equal(listMatch, actual);

        }
    }
}
