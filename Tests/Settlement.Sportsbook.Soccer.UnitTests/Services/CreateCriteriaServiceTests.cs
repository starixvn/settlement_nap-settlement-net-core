using AutoMapper;
using Fanex.NAP.Client;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Sportsbook.Soccer.Models;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;
using Settlement.Sportsbook.Soccer.Services.GetMatch;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services;

public class CreateCriteriaServiceTests
{
    private readonly IResourceService resourceService;

    private readonly ISoccerBetStatusService soccerBetStatusService;

    private readonly XmlConvertService xmlConvertService;

    private readonly IBetStatusAllService betStatusAllService;

    private readonly CreateCriteriaServiceImp service;

    private readonly IMatchService matchService;

    private readonly INapSession napSession;

    public CreateCriteriaServiceTests()
    {
        var accessor = Substitute.For<IHttpContextAccessor>();
        soccerBetStatusService = Substitute.For<ISoccerBetStatusService>();
        xmlConvertService = Substitute.For<XmlConvertService>();
        resourceService = Substitute.For<IResourceService>();
        betStatusAllService = Substitute.For<IBetStatusAllService>();
        matchService = Substitute.For<IMatchService>();
        napSession = Substitute.For<INapSession>();
        var context = new DefaultHttpContext
        {
            Connection =
            {
                RemoteIpAddress = new System.Net.IPAddress(1)
            }
        };
        accessor.HttpContext = context;

        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<SoccerAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);

        service = new CreateCriteriaServiceImp(resourceService, accessor, soccerBetStatusService,
            xmlConvertService, mapper, betStatusAllService, matchService, napSession);
    }

    [Fact]
    public void CalculateCriteria_ActionHalftime_CallInOrderFunctionOnService()
    {
        // Arrange
        var query = new SettleRequest
        {
            GoalRecord = "AH",
            ActionName = ActionType.CalculateHalfTime
        };

        resourceService.HalftimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>())
            .Returns([new XmlResource()]);

        // Act
        service.CreateCalculateCriteria(query);

        // Assert
        Received.InOrder(() =>
        {
            resourceService.HalftimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>());
            xmlConvertService.Serialize(Arg.Any<XmlResults>());
            soccerBetStatusService.CreateBetStatus(Arg.Any<SettleRequest>());
        });
    }

    [Fact]
    public void CalculateCriteria_ActionFullTime_CallInOrderFunctionOnService()
    {
        // Arrange
        var query = new SettleRequest
        {
            GoalRecord = "AH",
            ActionName = ActionType.CalculateFullTime
        };
        resourceService.FullTimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>()).Returns([new XmlResource()]);

        // Act
        service.CreateCalculateCriteria(query);

        // Assert
        Received.InOrder(() =>
        {
            resourceService.FullTimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>());
            xmlConvertService.Serialize(Arg.Any<XmlResults>());
            soccerBetStatusService.CreateBetStatus(Arg.Any<SettleRequest>());
        });
    }

    [Fact]
    public void CalculateCriteria_ActionAll_CallInOrderFunctionOnService()
    {
        // Arrange
        var query = new SettleRequest
        {
            GoalRecord = "AH",
            ActionName = ActionType.CalculateAll
        };
        resourceService.AllResources(Arg.Any<GoalCondition>(), Arg.Any<int>()).Returns([new XmlResource()]);

        // Act
        service.CreateCalculateCriteria(query);

        // Assert
        Received.InOrder(() =>
        {
            resourceService.AllResources(Arg.Any<GoalCondition>(), Arg.Any<int>());
            xmlConvertService.Serialize(Arg.Any<XmlResults>());
            soccerBetStatusService.CreateBetStatus(Arg.Any<SettleRequest>());
        });
    }

    [Fact]
    public void CreateRefundCriteria_RefundFullTimeAndMatchAbandoned_CallInOrderFunctionOnService()
    {
        // Arrange
        var query = new RefundRequest
        {
            ActionName = ActionType.RefundFullTime,
            IsSettleAbandonedMatchIbc = true
        };
        resourceService.FullTimeResourcesSettleDetermined(Arg.Any<GoalCondition>()).Returns([new XmlResource()]);

        // Act
        service.CreateRefundCriteria(query);

        // Assert
        Received.InOrder(() =>
        {
            resourceService.FullTimeResourcesSettleDetermined(Arg.Any<GoalCondition>());
            xmlConvertService.Serialize(Arg.Any<XmlResults>());
            betStatusAllService.GetBetStatusRefund(Arg.Any<RefundRequest>());
        });
    }

    [Fact]
    public void CreateRefundCriteria_RefundAllNotAbandoned_CallInOrderFunctionOnService()
    {
        // Arrange
        var query = new RefundRequest { ActionName = ActionType.RefundAll, BetStatus = "123" };
        resourceService.AllResources(Arg.Any<GoalCondition>(), Arg.Any<int>()).Returns([new XmlResource()]);

        // Act
        var criteria = service.CreateRefundCriteria(query);

        // Assert
        Received.InOrder(() =>
        {
            resourceService.AllResources(Arg.Any<GoalCondition>(), Arg.Any<int>());
            xmlConvertService.Serialize(Arg.Any<XmlResults>());
        });

        Assert.Equal("123", criteria.BetStatus);
    }

    [Fact]
    public void CreateRefundCriteria_RefundAllAndMatchAbandoned_CallInOrderFunctionOnService()
    {
        // Arrange
        var query = new RefundRequest
        {
            ActionName = ActionType.RefundAll,
            IsSettleAbandonedMatchIbc = true,
            HalfTimeAwayScore = 1,
            HalfTimeHomeScore = 2
        };
        resourceService.AllResourcesSettleDetermined(Arg.Any<GoalCondition>()).Returns([new XmlResource()]);

        // Act
        var criteria = service.CreateRefundCriteria(query);

        // Assert
        Received.InOrder(() =>
        {
            resourceService.AllResourcesSettleDetermined(Arg.Any<GoalCondition>());
            xmlConvertService.Serialize(Arg.Any<XmlResults>());
            betStatusAllService.GetBetStatusRefund(Arg.Any<RefundRequest>());
        });
        Assert.Equal(1, criteria.FullTimeAway);
        Assert.Equal(2, criteria.FullTimeHome);
    }

    [Fact]
    public void CreateRefundCriteria_RefundFullTimeNotAbandoned_CallInOrderFunctionOnService()
    {
        // Arrange
        var query = new RefundRequest
        {
            ActionName = ActionType.RefundFullTime,
            BetStatus = "123",
            HalfTimeAwayScore = 1,
            HalfTimeHomeScore = 2
        };
        resourceService.FullTimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>()).Returns([new XmlResource()]);

        // Act
        var criteria = service.CreateRefundCriteria(query);

        // Assert
        Received.InOrder(() =>
        {
            resourceService.FullTimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>());
            xmlConvertService.Serialize(Arg.Any<XmlResults>());
        });

        Assert.Equal("123", criteria.BetStatus);
        Assert.Equal(0, criteria.FullTimeAway);
        Assert.Equal(0, criteria.FullTimeHome);
    }

    [Fact]
    public void CreateRefundCriteria_RefundHalfTime_CallInOrderFunctionOnService()
    {
        // Arrange
        var query = new RefundRequest
        {
            ActionName = ActionType.RefundHalfTime,
            BetStatus = "123",
            HalfTimeAwayScore = 1,
            HalfTimeHomeScore = 2
        };
        resourceService.HalftimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>()).Returns([new XmlResource()]);

        // Act
        var criteria = service.CreateRefundCriteria(query);

        // Assert
        Received.InOrder(() =>
        {
            resourceService.HalftimeResources(Arg.Any<GoalCondition>(), Arg.Any<int>());
            xmlConvertService.Serialize(Arg.Any<XmlResults>());
        });

        Assert.Empty(criteria.BetStatus);
        Assert.Equal(0, criteria.FullTimeAway);
        Assert.Equal(0, criteria.FullTimeHome);
    }

    [Theory]
    [InlineData("HA;A", "HA;")]
    [InlineData("", "")]
    [InlineData("HA", "HA")]
    public void CreateUnCalculateFtCriteria_HalfTimeNotRefunded_ReturnCorrectGoalRecord(string currentGoalRecord, string expected)
    {
        var request = new UncalculateFtRequest
        {
            ResultDetails = new List<ResultDetail>
            {
                new()
                {
                    ResourceId = ResourceType.Halftime,
                    SettlementStatusId = SettlementStatus.Completed
                }
            }
        };
        matchService.GetMatchGoalRecord(Arg.Any<int>()).Returns(new MatchGoalRecordModel { BetStatus = "", GoalRecord = currentGoalRecord });
        soccerBetStatusService.CreateBetStatusAfterUncalculateFt(Arg.Any<UncalculateFtRequest>(), "", Arg.Any<string>()).Returns("");
        resourceService.UnCalculateFtResources(Arg.Any<string>()).Returns([]);

        var criteria = service.CreateUnCalculateFtCriteria(request);

        Assert.Equal(expected, criteria.GoalRecord);
    }

    [Fact]
    public void CreateUnCalculateFtCriteria_HalfTimeRefunded_ReturnCorrectGoalRecord()
    {
        var request = new UncalculateFtRequest
        {
            ResultDetails = new List<ResultDetail>
            {
                new()
                {
                    ResourceId = ResourceType.Halftime,
                    SettlementStatusId = SettlementStatus.RefundHt
                }
            }
        };
        matchService.GetMatchGoalRecord(Arg.Any<int>()).Returns(new MatchGoalRecordModel { BetStatus = "", GoalRecord = "HA" });
        soccerBetStatusService.CreateBetStatusAfterUncalculateFt(Arg.Any<UncalculateFtRequest>(), "", Arg.Any<string>())
            .Returns("");
        resourceService.UnCalculateFtResources(Arg.Any<string>()).Returns([]);

        var criteria = service.CreateUnCalculateFtCriteria(request);

        Assert.Equal(string.Empty, criteria.GoalRecord);
    }
    [Fact]
    public void CreateSaveScoreCriteria_ValidRequest_ReturnsCorrectCriteria()
    {
        // Arrange
        var request = new SaveScoreRequest
        {
            MatchId = 1,
            ResultDetails = new List<ResultDetail>
            {
                new ResultDetail { ResourceId = "R1", HomeValue = "1", AwayValue = "0" },
                new ResultDetail { ResourceId = "R2", HomeValue = "2", AwayValue = "1" }
            }
        };
        var expectedResources = "<Resources><Resource Id=\"R1\" Home=\"1\" /><Resource Id=\"R2\" Home=\"2\" /></Resources>";
        xmlConvertService.Serialize(Arg.Any<Resources<ResourceItem>>()).Returns(expectedResources);

        // Act
        var criteria = service.CreateSaveScoreCriteria(request);

        // Assert
        Assert.Equal(request.MatchId, criteria.MatchId);
        Assert.Equal(napSession.UserId, criteria.UserId);
        Assert.Equal(expectedResources, criteria.SelectedResources);
    }

    [Fact]
    public void CreateSaveScoreCriteria_EmptyResultDetails_ReturnsEmptySelectedResources()
    {
        // Arrange
        var request = new SaveScoreRequest
        {
            MatchId = 1,
            ResultDetails = new List<ResultDetail>()
        };
        var expectedResources = "<Resources></Resources>";
        xmlConvertService.Serialize(Arg.Any<Resources<ResourceItem>>()).Returns(expectedResources);

        // Act
        var criteria = service.CreateSaveScoreCriteria(request);

        // Assert
        Assert.Equal(request.MatchId, criteria.MatchId);
        Assert.Equal(napSession.UserId, criteria.UserId);
        Assert.Equal(expectedResources, criteria.SelectedResources);
    }
}