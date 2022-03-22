using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using Settlement.EventManagement.Controllers;
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Requests;
using Settlement.EventManagement.Services;
using Xunit;

namespace Settlement.EventManagement.UnitTests.Controllers
{
    public class MultiSportControllerTests
    {
        private readonly MultiSportController controller;

        private readonly IMediator mediator;

        private readonly IMultiSportService multiSportService;

        public MultiSportControllerTests()
        {
            multiSportService = Substitute.For<IMultiSportService>();
            mediator = Substitute.For<IMediator>();
            controller = new MultiSportController(mediator);
        }

        [Fact]
        public void GetDate_ReturnRightValue()
        {
            // Act
            var actual = controller.GetDate() as OkObjectResult;

            // Assert
            Assert.IsType<DateSelection>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task Filter_Always_ReturnsListMatchesOnSports()
        {
            // Arrange
            var sports = new List<SportModel> {
                new SportModel {
                     Id = 1,
                     Name = "Soccer"
                }
            };

            multiSportService.GetSportBook(Arg.Any<FilterMultiSportRequest>()).Returns(sports);

            // Act
            var result = await controller.Filter(new FilterMultiSportRequest());

            // Assert
            Assert.NotNull(result);
        }

        [Fact]
        public async Task RefreshMathces_Always_ReturnsListMatches()
        {
            // Arrange
            var matches = new List<Match> {
                new Match {
                     MatchCode = "ABC",
                     MatchId = 12345
                }
            };

            multiSportService.GetWaitingMatches(Arg.Any<RefreshMatchesRequest>()).Returns(matches);

            // Act
            var result = await controller.RefreshMatches(new RefreshMatchesRequest());

            // Assert
            Assert.NotNull(result);
        }

        [Fact]
        public async Task GetSports_Always_ReturnsListSports()
        {
            var request = new SportRequest();
            mediator.Send(Arg.Any<SportRequest>()).Returns(new List<SportTypeModel>());

            var actual = await controller.GetSports(request) as OkObjectResult;

            Assert.IsType<List<SportTypeModel>>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }

        [Fact]
        public async Task GetLeagues_Always_ReturnsListLeagues()
        {
            var request = new LeagueRequest();
            mediator.Send(Arg.Any<LeagueRequest>()).Returns(new List<LeagueTypeModel>());

            var actual = await controller.GetLeagues(request) as OkObjectResult;

            Assert.IsType<List<LeagueTypeModel>>(actual.Value);
            Assert.Equal(200, actual.StatusCode);
        }
    }
}