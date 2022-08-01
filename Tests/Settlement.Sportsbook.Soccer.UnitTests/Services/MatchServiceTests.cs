using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using NSubstitute;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Xunit;
using MatchDetail = Settlement.Core.Models.MatchDetail;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services
{
    public class MatchServiceTests
    {
        private readonly IDynamicRepository repository;

        private readonly PermissionService permission;

        private readonly IRefDataService refDataService;

        private readonly IGoalIconService goalIconService;

        private readonly IMatchService service;

        public MatchServiceTests()
        {
            repository = Substitute.For<IDynamicRepository>();
            permission = Substitute.For<PermissionService>(null, null, null, null);
            refDataService = Substitute.For<IRefDataService>();
            goalIconService = Substitute.For<IGoalIconService>();
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<SoccerAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);
            service = new MatchServiceImp(repository, permission, mapper, refDataService, goalIconService);
        }

        [Fact]
        public void GetBetStatus_IsNotExistMatchId_ReturnsEmpty()
        {
            // Act
            var actualBetStatus = service.GetBetStatus(123);

            // Assert
            Assert.Empty(actualBetStatus);
        }

        [Fact]
        public void MatchDetail_Always_ReturnsNotNull()
        {
            // Arrange
            IEnumerable<Models.MatchDetail> matches = new List<Models.MatchDetail> {
                new Models.MatchDetail { MatchId = 123 }
            };
            var results = new IEnumerable<object>[4];

            results[0] = matches;
            results[1] = Substitute.For<IEnumerable<ResultDetail>>();
            results[2] = Substitute.For<IEnumerable<TicketCounts>>();
            results[3] = Substitute.For<IEnumerable<ChildMatchModel>>();
            repository.FetchMultipleAsync(Arg.Any<CriteriaBase>(), Arg.Any<Type[]>()).Returns(results);

            // Act
            var match = service.GetMatch(new GetMatchRequest { MatchId = 1 });

            // Assert
            Assert.NotNull(match);
        }

        [Fact]
        public async Task MatchDetail_FantasySoccerMatch_ReturnMatchWithRelatedMatchesAsync()
        {
            // Arrange
            IEnumerable<Models.MatchDetail> matches = new List<Models.MatchDetail> {
                new Models.MatchDetail { MatchId = 123, LeagueId = 16371 }
            };
            var results = new IEnumerable<object>[4];

            results[0] = matches;
            results[1] = Substitute.For<IEnumerable<ResultDetail>>();
            results[2] = Substitute.For<IEnumerable<TicketCounts>>();
            results[3] = Substitute.For<IEnumerable<ChildMatchModel>>();
            repository.FetchMultipleAsync(Arg.Any<CriteriaBase>(), Arg.Any<Type[]>()).Returns(results);
            var fantasyResult = (Substitute.For<IEnumerable<FantasyMatchDetail>>(), new List<FantasyRelatedMatch> { new FantasyRelatedMatch() });
            repository.FetchMultipleAsync<FantasyMatchDetail, FantasyRelatedMatch>(Arg.Any<CriteriaBase>()).Returns(fantasyResult);
            // Act
            var match = await service.GetMatch(new GetMatchRequest { MatchId = 1 });

            // Assert
            Assert.Single(match.FantasyMatch.RelatedMatches);
        }

        [Fact]
        public async Task MatchDetail_ExternalResultDetail_ReturnMatchExternalScore()
        {
            // Arrange
            IEnumerable<Models.MatchDetail> matches = new List<Models.MatchDetail> {
                new Models.MatchDetail { MatchId = 123}
            };

            var resultDetail = new List<ResultDetail>
            {
                new ResultDetail { ResourceId = "01", AwayValue = "1", HomeValue = "2", SourceId = SourceType.SBO}
            };
            var results = new IEnumerable<object>[4];

            results[0] = matches;
            results[1] = resultDetail;
            results[2] = Substitute.For<IEnumerable<TicketCounts>>();
            results[3] = Substitute.For<IEnumerable<ChildMatchModel>>();
            repository.FetchMultipleAsync(Arg.Any<CriteriaBase>(), Arg.Any<Type[]>()).Returns(results);
            // Act
            var match = await service.GetMatch(new GetMatchRequest { MatchId = 1 });

            // Assert
            Assert.Equal(1, match.MatchDetail.ExHTAwayScore);
            Assert.Equal(2, match.MatchDetail.ExHTHomeScore);
        }
    }
}