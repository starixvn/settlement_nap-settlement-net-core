using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
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


    #region Additional Tests - External Results
    [Fact]
    public async Task Handle_ExternalResults_ReturnsCorrectExternalResults()
    {
        // Arrange
        var matchId = 5;
        var request = new GetResultsRequest(matchId);

        SetupBasicMocks(matchId);

        var externalResults = new List<ExternalResultDetailModel>
        {
            new() { SourceId = SourceType.ConfirmSTD, SourceName = "STD", ResourceId = "R1", OrderNo = 1, Remark = "Test" },
            new() { SourceId = SourceType.ConfirmSTD, SourceName = "STD", ResourceId = "R2", OrderNo = 1, Remark = "Test" }
        };
        _repository.FetchAsync<ExternalResultDetailModel>(Arg.Any<GetProviderCriteria>())
            .Returns(externalResults);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.NotNull(result.ExternalResults);
        Assert.Single(result.ExternalResults);
        Assert.Equal(2, result.ExternalResults[0].ResultDetails.Count);
        Assert.Equal(SourceType.ConfirmSTD, result.ExternalResults[0].SourceId);
    }

    [Fact]
    public async Task Handle_ExternalResults_FiltersNonConfirmSTDSources()
    {
        // Arrange
        var matchId = 6;
        var request = new GetResultsRequest(matchId);

        SetupBasicMocks(matchId);

        var externalResults = new List<ExternalResultDetailModel>
        {
            new() { SourceId = SourceType.ConfirmSTD, SourceName = "STD", ResourceId = "R1" },
            new() { SourceId = 999, SourceName = "Other", ResourceId = "R2" }, // Should be filtered out
            new() { SourceId = SourceType.ConfirmSTD, SourceName = "STD2", ResourceId = "R3" }
        };
        _repository.FetchAsync<ExternalResultDetailModel>(Arg.Any<GetProviderCriteria>())
            .Returns(externalResults);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.Equal(2, result.ExternalResults.Sum(er => er.ResultDetails.Count));
        Assert.All(result.ExternalResults.SelectMany(er => er.ResultDetails),
            rd => Assert.Equal(SourceType.ConfirmSTD, rd.SourceId));
    }

    [Fact]
    public async Task Handle_ExternalResults_GroupsCorrectlyBySourceProperties()
    {
        // Arrange
        var matchId = 7;
        var request = new GetResultsRequest(matchId);

        SetupBasicMocks(matchId);

        var externalResults = new List<ExternalResultDetailModel>
        {
            new() { SourceId = SourceType.ConfirmSTD, SourceName = "STD1", OrderNo = 1, Remark = "R1" },
            new() { SourceId = SourceType.ConfirmSTD, SourceName = "STD1", OrderNo = 1, Remark = "R1" }, // Same group
            new() { SourceId = SourceType.ConfirmSTD, SourceName = "STD2", OrderNo = 2, Remark = "R2" } // Different group
        };
        _repository.FetchAsync<ExternalResultDetailModel>(Arg.Any<GetProviderCriteria>())
            .Returns(externalResults);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.Equal(2, result.ExternalResults.Count);
        Assert.Contains(result.ExternalResults, er => er.ResultDetails.Count == 2);
        Assert.Contains(result.ExternalResults, er => er.ResultDetails.Count == 1);
    }
    #endregion

    #region Additional Tests - Ticket Aggregation
    [Fact]
    public async Task Handle_MultipleServers_AggregatesTicketDetailsCorrectly()
    {
        // Arrange
        var matchId = 8;
        var request = new GetResultsRequest(matchId);

        _appSettings.SiteDbServer = new List<string> { "db1", "db2" };

        SetupBasicMocks(matchId);

        // Setup different responses for each server call
        _repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns(
                (new List<ResultDetail>
                {
                    new() { ResourceId = "65301", InRunning = 5, BetCount = 10, BetMarkedCount = 2 }
                }, new List<TicketCounts> { new() }),
                (new List<ResultDetail>
                {
                    new() { ResourceId = "65301", InRunning = 3, BetCount = 7, BetMarkedCount = 1 }
                }, new List<TicketCounts> { new() })
            );

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.Single(result.ResultDetails);
        var aggregatedDetail = result.ResultDetails[0];
        Assert.Equal("65301", aggregatedDetail.ResourceId);
        Assert.Equal(8, aggregatedDetail.InRunning); // 5 + 3
        Assert.Equal(17, aggregatedDetail.BetCount); // 10 + 7
        Assert.Equal(3, aggregatedDetail.BetMarkedCount); // 2 + 1
    }

    [Fact]
    public async Task Handle_TicketDetailsWithSameResourceId_AggregatesAllFields()
    {
        // Arrange
        var matchId = 9;
        var request = new GetResultsRequest(matchId);

        SetupBasicMocks(matchId);

        var ticketDetails = new List<ResultDetail>
        {
            new()
            {
                ResourceId = "65301",
                InRunning = 2,
                InWaiting = 3,
                BetMarkedCount = 1,
                BetSettledCount = 4,
                BetCount = 10
            },
            new()
            {
                ResourceId = "65301",
                InRunning = 1,
                InWaiting = 2,
                BetMarkedCount = 2,
                BetSettledCount = 3,
                BetCount = 8
            }
        };

        _repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((ticketDetails, new List<TicketCounts> { new() }));

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.Single(result.ResultDetails);
        var aggregated = result.ResultDetails[0];
        Assert.Equal(3, aggregated.InRunning); // 2 + 1
        Assert.Equal(5, aggregated.InWaiting); // 3 + 2
        Assert.Equal(3, aggregated.BetMarkedCount); // 1 + 2
        Assert.Equal(7, aggregated.BetSettledCount); // 4 + 3
        Assert.Equal(18, aggregated.BetCount); // 10 + 8
    }
    #endregion

    #region Additional Tests - CreateTicketStatus
    [Theory]
    [InlineData(SportType.BasketBall, TicketStatus.NoTicket)]
    public async Task Handle_NullTicketDetail_ReturnsCorrectStatusBySportType(int sportType, string expectedStatus)
    {
        // Arrange
        var matchId = 10;
        var request = new GetResultsRequest(matchId);

        var matchDetail = new MatchDetail { MatchId = matchId, SportType = sportType };
        _repository.GetAsync<MatchDetail>(Arg.Any<GetMatchDetailCriteria>()).Returns(matchDetail);

        var resultDetails = new List<ResultDetail>
        {
            new() { ResourceId = "65301", BetCount = 1 }
        };
        _repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>()).Returns(resultDetails);

        // No ticket details to match
        _repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((new List<ResultDetail>(), new List<TicketCounts>()));

        SetupEmptyExternalResults();

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(request, CancellationToken.None);

        // Assert
        if (expectedStatus == TicketStatus.NotIncluded)
        {
            Assert.Empty(result.ResultDetails); // NotIncluded items are filtered out
        }
        else
        {
            Assert.Single(result.ResultDetails);
            Assert.Equal(expectedStatus, result.ResultDetails[0].TicketStatus);
        }
    }

    [Theory]
    [InlineData(10, 3, TicketStatus.Calculated)] // Has actual bets
    public async Task Handle_BetCountScenarios_ReturnsCorrectTicketStatus(int betCount, int inWaiting, string expectedStatus)
    {
        // Arrange
        var matchId = 11;
        var request = new GetResultsRequest(matchId);

        SetupBasicMocks(matchId);

        var ticketDetail = new ResultDetail
        {
            ResourceId = "65301",
            BetCount = betCount,
            InWaiting = inWaiting
        };

        _repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((new List<ResultDetail> { ticketDetail }, new List<TicketCounts> { new() }));

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(request, CancellationToken.None);

        // Assert
        if (expectedStatus == TicketStatus.NoTicket)
        {
            Assert.Empty(result.ResultDetails); // NoTicket items are filtered out
        }
        else
        {
            Assert.Single(result.ResultDetails);
            Assert.Equal(expectedStatus, result.ResultDetails[0].TicketStatus);
        }
    }

    [Theory]
    [InlineData(1, 0, 0, 0, TicketStatus.Running)]
    [InlineData(0, 1, 0, 0, TicketStatus.Marked)]
    [InlineData(0, 0, 1, 0, TicketStatus.Calculated)]
    [InlineData(0, 0, 0, 1, TicketStatus.Calculated)] // Refunded but Early settle type
    public async Task Handle_TicketStatusPriority_ReturnsHighestPriorityStatus(
        int inRunning, int betMarkedCount, int betSettledCount, int betRefundedCount, string expectedStatus)
    {
        // Arrange
        var matchId = 12;
        var request = new GetResultsRequest(matchId);

        SetupBasicMocks(matchId);

        var ticketDetail = new ResultDetail
        {
            ResourceId = "65301",
            BetCount = 5,
            InRunning = inRunning,
            BetMarkedCount = betMarkedCount,
            BetSettledCount = betSettledCount,
            BetRefundedCount = betRefundedCount
        };

        _repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((new List<ResultDetail> { ticketDetail }, new List<TicketCounts> { new() }));

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.Single(result.ResultDetails);
        Assert.Equal(expectedStatus, result.ResultDetails[0].TicketStatus);
    }
    #endregion

    #region Additional Tests - BaseBetType Filtering
    [Theory]
    [InlineData("65301", true)]
    [InlineData("66201", true)]
    [InlineData("65901", true)]
    [InlineData("65601", true)]
    [InlineData("66501", true)]
    [InlineData("66701", true)]
    [InlineData("12345", false)]
    [InlineData("99999", false)]
    [InlineData("", false)]
    public async Task Handle_BaseBetTypeFiltering_FiltersCorrectResourceIds(string resourceId, bool shouldInclude)
    {
        // Arrange
        var matchId = 13;
        var request = new GetResultsRequest(matchId);

        SetupBasicMocks(matchId);

        var resultDetail = new ResultDetail
        {
            ResourceId = resourceId,
            BetCount = 1
        };

        _repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>())
            .Returns(new List<ResultDetail> { resultDetail });

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(request, CancellationToken.None);

        // Assert
        if (shouldInclude)
        {
            Assert.Single(result.ResultDetails);
            Assert.Equal(resourceId, result.ResultDetails[0].ResourceId);
        }
        else
        {
            Assert.Empty(result.ResultDetails);
        }
    }
    #endregion


    #region Additional Tests - Edge Cases
    [Fact]
    public async Task Handle_EmptyTicketCounts_UsesDefaultTicketCounts()
    {
        // Arrange
        var matchId = 14;
        var request = new GetResultsRequest(matchId);

        SetupBasicMocks(matchId);

        _repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((new List<ResultDetail>(), new List<TicketCounts>())); // Empty TicketCounts

        var handler = CreateHandler();

        // Act & Assert - Should not throw
        var result = await handler.Handle(request, CancellationToken.None);
        Assert.NotNull(result);
    }

    [Fact]
    public async Task Handle_LargeDataSet_HandlesEfficiently()
    {
        // Arrange
        var matchId = 15;
        var request = new GetResultsRequest(matchId);

        SetupBasicMocks(matchId);

        // Create large dataset
        var largeResultSet = Enumerable.Range(1, 1000)
            .Select(i => new ResultDetail
            {
                ResourceId = $"653{i:D3}",
                BetCount = 1
            }).ToList();

        _repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>())
            .Returns(largeResultSet);

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.Equal(1000, result.ResultDetails.Count);
        Assert.All(result.ResultDetails, rd => Assert.StartsWith("653", rd.ResourceId));
    }

    [Fact]
    public async Task Handle_DuplicateResourceIds_MergesCorrectlyWithExcept()
    {
        // Arrange
        var matchId = 16;
        var request = new GetResultsRequest(matchId);

        SetupBasicMocks(matchId);

        var resultDetails = new List<ResultDetail>
        {
            new() { ResourceId = "65301", BetCount = 1 },
            new() { ResourceId = "65302", BetCount = 1 }
        };

        var ticketDetails = new List<ResultDetail>
        {
            new() { ResourceId = "65301", BetCount = 2 }, // Duplicate - should be excluded by Except
            new() { ResourceId = "65303", BetCount = 1 }  // New - should be included
        };

        _repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>())
            .Returns(resultDetails);

        _repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((ticketDetails, new List<TicketCounts> { new() }));

        var handler = CreateHandler();

        // Act
        var result = await handler.Handle(request, CancellationToken.None);

        // Assert
        Assert.Equal(3, result.ResultDetails.Count);
        var resourceIds = result.ResultDetails.Select(rd => rd.ResourceId).ToList();
        Assert.Contains("65301", resourceIds);
        Assert.Contains("65302", resourceIds);
        Assert.Contains("65303", resourceIds);
    }

    [Fact]
    public async Task Handle_MapperDecorate_CallsDecorateWhenAvailable()
    {
        // Arrange
        var matchId = 17;
        var request = new GetResultsRequest(matchId);

        SetupBasicMocks(matchId);

        var mapperService = Substitute.For<IMapperService>();
        _mapperFactory.GetMapperService("basketball-result-detail").Returns(mapperService);

        var handler = CreateHandler();

        // Act
        await handler.Handle(request, CancellationToken.None);

        // Assert
        await mapperService.Received(1).Decorate(Arg.Any<List<ResultDetail>>());
    }


    #endregion


    #region Helper Methods
    private GetResultsHandler CreateHandler()
    {
        return new GetResultsHandler(_refDataService, _repository, _mapperFactory, _options);
    }

    private void SetupBasicMocks(int matchId, int sportType = SportType.BasketBall)
    {
        var matchDetail = new MatchDetail { MatchId = matchId, SportType = sportType };
        _repository.GetAsync<MatchDetail>(Arg.Any<GetMatchDetailCriteria>()).Returns(matchDetail);

        // Default empty collections
        _repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>())
            .Returns(new List<ResultDetail>());

        _repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((new List<ResultDetail>(), new List<TicketCounts>()));

        SetupEmptyExternalResults();

        _mapperFactory.GetMapperService(Arg.Any<string>()).Returns((IMapperService)null);
    }

    private void SetupEmptyExternalResults()
    {
        _repository.FetchAsync<ExternalResultDetailModel>(Arg.Any<GetProviderCriteria>())
            .Returns(new List<ExternalResultDetailModel>());
    }
    #endregion
}
