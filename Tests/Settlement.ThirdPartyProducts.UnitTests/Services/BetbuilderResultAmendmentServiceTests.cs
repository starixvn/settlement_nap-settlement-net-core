using System;
using Fanex.Data.Repository;
using Fanex.Settlement.MessageBridge.ResultAmendment;
using MassTransit;
using Settlement.Core.Criteria.ResultAmendment;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;

namespace Settlement.ThirdPartyProducts.UnitTests.Services;

public class BetbuilderResultAmendmentServiceTests
{
    private readonly IDynamicRepository _repository;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly IBetbuilderResultAmendmentService _service;

    public BetbuilderResultAmendmentServiceTests()
    {
        _repository = Substitute.For<IDynamicRepository>();
        _publishEndpoint = Substitute.For<IPublishEndpoint>();
        _service = new BetbuilderResultAmendmentService(_repository, _publishEndpoint);
    }

    [Fact]
    public async Task GetResultChanged_ShouldReturnResults_WhenValidRequestProvided()
    {
        // Arrange
        var request = new CalculateRequest
        {
            MatchId = 123,
            ActionName = "TestAction",
            SportType = 1
        };
        var selectedResources = "resource1,resource2";
        var expectedResults = new List<ResultChanged>
            {
                new() { ResourceId = "resource1", OtherInfo = "info1" },
                new() { ResourceId = "resource2", OtherInfo = "info2" }
            };

        _repository.FetchAsync<ResultChanged>(Arg.Any<CheckReSettleCriteria>())
            .Returns(expectedResults);

        // Act
        var result = await _service.GetResultChanged(request, selectedResources);

        // Assert
        Assert.Equal(expectedResults, result);
        await _repository.Received(1).FetchAsync<ResultChanged>(Arg.Is<CheckReSettleCriteria>(c =>
            c.MatchId == request.MatchId &&
            c.Action == request.ActionName &&
            c.SelectedResources == selectedResources));
    }

    [Fact]
    public async Task PublishResultAmendment_ShouldPublishWithCorrectData_WhenValidInputProvided()
    {
        // Arrange
        var request = new CalculateRequest
        {
            MatchId = 123,
            ActionName = "TestAction",
            SportType = 1
        };

        var selectedResources = new List<Fanex.Settlement.MessageBridge.ResultAmendment.ResourceItem>
            {
                new() { ResourceId = "resource1" },
                new() { ResourceId = "resource2" }
            };

        var results = new List<ResultChanged>
            {
                new() { ResourceId = "resource1" },
                new() { ResourceId = "resource2" }
            };

        var markets = new List<SelectionMarket>
            {
                new() { SelectionType = "resource1", MarketId = "market1" },
                new() { SelectionType = "resource2", MarketId = "market2" }
            };

        _repository.FetchAsync<SelectionMarket>(Arg.Any<GetSelectionMarketsCriteria>())
            .Returns(markets);

        // Act
        await _service.PublishResultAmendment(request, selectedResources, results);

        // Assert
        await _repository.Received(1).FetchAsync<SelectionMarket>(Arg.Is<GetSelectionMarketsCriteria>(c =>
            c.MatchId == request.MatchId &&
            c.SelectionTypes == "resource1,resource2"));

        await _publishEndpoint.Received(1).Publish(
            Arg.Is<ResultAmended>(r =>
                r.MatchId == request.MatchId &&
                r.BroadcastSessionId == request.BroadcastSessionId &&
                r.SportType == request.SportType &&
                r.Action == request.ActionName &&
                r.SelectedResources.Count() == 2 &&
                r.ResultsChanged.Count() == 2),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task PublishResultAmendment_ShouldHandleEmptyResults_WhenNoResultsProvided()
    {
        // Arrange
        var request = new CalculateRequest
        {
            MatchId = 123,
            ActionName = "TestAction",
            SportType = 1
        };

        var selectedResources = new List<Fanex.Settlement.MessageBridge.ResultAmendment.ResourceItem>();
        var results = new List<ResultChanged>();
        var markets = new List<SelectionMarket>();

        _repository.FetchAsync<SelectionMarket>(Arg.Any<GetSelectionMarketsCriteria>())
            .Returns(markets);

        // Act
        await _service.PublishResultAmendment(request, selectedResources, results);

        // Assert
        await _repository.Received(1).FetchAsync<SelectionMarket>(Arg.Is<GetSelectionMarketsCriteria>(c =>
            c.MatchId == request.MatchId &&
            string.IsNullOrEmpty(c.SelectionTypes)));

        await _publishEndpoint.Received(1).Publish(
            Arg.Is<ResultAmended>(r =>
                r.MatchId == request.MatchId &&
                r.BroadcastSessionId == request.BroadcastSessionId &&
                r.SportType == request.SportType &&
                r.Action == request.ActionName &&
                !r.SelectedResources.Any() &&
                !r.ResultsChanged.Any()),
            Arg.Any<CancellationToken>());
    }
}