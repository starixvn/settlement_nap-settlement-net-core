using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Handlers;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Requests;
using MatchDetail = Settlement.Sportsbook.Aio.Models.MatchDetail;
using ResultDetail = Settlement.Sportsbook.Aio.Models.ResultDetail;

namespace Settlement.Sportsbook.Aio.UnitTests.Handlers;

public class GetResultsHandlerTests
{
    private readonly IRefDataService _refDataService = Substitute.For<IRefDataService>();
    private readonly IDynamicRepository _repository = Substitute.For<IDynamicRepository>();
    private readonly IMapperFactory _mapperFactory = Substitute.For<IMapperFactory>();
    private readonly IOptions<AppSettingsKey> _options = Substitute.For<IOptions<AppSettingsKey>>();
    private readonly AppSettingsKey _appSettings = new() { SiteDbServer = new List<string> { "db1" } };

    public GetResultsHandlerTests()
    {
        _options.Value.Returns(_appSettings);
    }

    [Fact]
    public async Task Handle_ReturnsAioMatch_WithExpectedData()
    {
        // Arrange
        var matchId = 1;
        var sportType = 2;
        var request = new GetResultsRequest(matchId);

        var matchDetail = new MatchDetail { MatchId = matchId, SportType = sportType };
        _repository.GetAsync<MatchDetail>(Arg.Any<GetMatchDetailCriteria>()).Returns(matchDetail);

        var ticketDetails = new List<ResultDetail>
        {
            new ResultDetail { ResourceId = "65301", BetCount = 1 },
            new ResultDetail { ResourceId = "66201", BetCount = 2 }
        };
        _repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((ticketDetails, new List<TicketCounts> { new TicketCounts() }));

        var resultDetails = new List<ResultDetail>
        {
            new ResultDetail { ResourceId = "65301", BetCount = 1 },
            new ResultDetail { ResourceId = "66201", BetCount = 2 }
        };
        _repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>()).Returns(resultDetails);

        var mapperService = Substitute.For<IMapperService>();
        _mapperFactory.GetMapperService(Arg.Any<string>()).Returns(mapperService);
        mapperService.Decorate(Arg.Any<List<ResultDetail>>()).Returns(Task.CompletedTask);

        var handler = new GetResultsHandler(
            _refDataService,
            _repository,
            _mapperFactory,
            _options
        );

        // Act
        var result = await handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.MatchDetail);
        Assert.Equal(matchId, result.MatchDetail.MatchId);
        Assert.NotNull(result.ResultDetails);
        Assert.All(result.ResultDetails, r => Assert.Contains(r.ResourceId, new[] { "65301", "66201" }));
    }

    [Fact]
    public async Task Handle_EmptyTicketDetails_ReturnsEmptyResultDetails()
    {
        // Arrange
        var matchId = 2;
        var sportType = 2;
        var request = new GetResultsRequest(matchId);

        var matchDetail = new MatchDetail { MatchId = matchId, SportType = sportType };
        _repository.GetAsync<MatchDetail>(Arg.Any<GetMatchDetailCriteria>()).Returns(matchDetail);

        _repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((new List<ResultDetail>(), new List<TicketCounts>()));

        _repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>())
            .Returns(new List<ResultDetail>());

        _mapperFactory.GetMapperService(Arg.Any<string>()).Returns((IMapperService)null);

        var handler = new GetResultsHandler(
            _refDataService,
            _repository,
            _mapperFactory,
            _options
        );

        // Act
        var result = await handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.MatchDetail);
        Assert.Empty(result.ResultDetails);
    }

    [Fact]
    public async Task Handle_MapperServiceIsNull_DoesNotThrow()
    {
        // Arrange
        var matchId = 3;
        var sportType = 2;
        var request = new GetResultsRequest(matchId);

        var matchDetail = new MatchDetail { MatchId = matchId, SportType = sportType };
        _repository.GetAsync<MatchDetail>(Arg.Any<GetMatchDetailCriteria>()).Returns(matchDetail);

        var ticketDetails = new List<ResultDetail>
        {
            new ResultDetail { ResourceId = "65301", BetCount = 1 }
        };
        _repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((ticketDetails, new List<TicketCounts>()));

        var resultDetails = new List<ResultDetail>
        {
            new ResultDetail { ResourceId = "65301", BetCount = 1 }
        };
        _repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>()).Returns(resultDetails);

        _mapperFactory.GetMapperService(Arg.Any<string>()).Returns((IMapperService)null);

        var handler = new GetResultsHandler(
            _refDataService,
            _repository,
            _mapperFactory,
            _options
        );

        // Act & Assert
        var result = await handler.Handle(request, CancellationToken.None);
        Assert.NotNull(result);
        Assert.Single(result.ResultDetails);
    }

    [Fact]
    public async Task Handle_ResultDetailsWithNotIncludedStatus_AreFilteredOut()
    {
        // Arrange
        var matchId = 4;
        var sportType = 2;
        var request = new GetResultsRequest(matchId);

        var matchDetail = new MatchDetail { MatchId = matchId, SportType = sportType };
        _repository.GetAsync<MatchDetail>(Arg.Any<GetMatchDetailCriteria>()).Returns(matchDetail);

        _repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns(([], new List<TicketCounts>()));

        var resultDetails = new List<ResultDetail>
        {
            new ResultDetail { ResourceId = "99999", BetCount = 0 } // Not in BaseBetTypes
        };
        _repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>()).Returns(resultDetails);

        var handler = new GetResultsHandler(
            _refDataService,
            _repository,
            _mapperFactory,
            _options
        );

        // Act
        var result = await handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result.ResultDetails); // Because "99999" is not a BaseBetType
    }
}
