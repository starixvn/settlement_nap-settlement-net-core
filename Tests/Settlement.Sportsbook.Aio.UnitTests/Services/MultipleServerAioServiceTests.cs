using AutoMapper;
using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Models;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using MassTransit;
using Microsoft.Extensions.Options;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Constants;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using Settlement.Sportsbook.Aio.Services;
using ResultDetail = Settlement.Sportsbook.Aio.Models.ResultDetail;

namespace Settlement.Sportsbook.Aio.UnitTests.Services;

public class MultipleServerAioServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly ScaleOutSettleService scaleOutSettleService;

    private readonly ICreateQueryService createQueryService;

    private readonly MergeDataService mergeDataService;

    private readonly LogService logService;

    private readonly MultipleServerAioService service;


    public MultipleServerAioServiceTests()
    {
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<SportsbookAioAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);

        var appSetting = new AppSettingsKey { SiteDbServer = ["01", "02"] };
        var option = Options.Create(appSetting);
        repository = Substitute.For<IDynamicRepository>();
        scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
        createQueryService = Substitute.For<ICreateQueryService>();
        mergeDataService = Substitute.For<MergeDataService>();
        logService = Substitute.For<LogService>();
        var publishEndpoint = Substitute.For<IPublishEndpoint>();

        var resultAmendmentService = Substitute.For<ResultAmendmentService>();

        service = new MultipleServerAioServiceImp(
            repository,
            option,
            new MultipleServerAioServiceDependencies(
                scaleOutSettleService,
                createQueryService,
                mergeDataService,
                logService,
                mapper,
                resultAmendmentService,
                publishEndpoint

            )
        );
    }

    [Theory]
    [InlineData(SettleType.Early, 1, 1, 0, 0, 0, 0, TicketStatus.Running)]
    [InlineData(SettleType.Early, 0, 0, 0, 0, 0, 0, TicketStatus.NoTicket)]
    [InlineData(SettleType.Early, 1, 0, 1, 1, 1, 1, TicketStatus.NoTicket)]
    [InlineData(SettleType.Early, 1, 0, 0, 1, 1, 1, TicketStatus.Marked)]
    [InlineData(SettleType.Early, 1, 0, 0, 0, 1, 1, TicketStatus.Calculated)]
    [InlineData(SettleType.Calculate, 1, 0, 0, 0, 0, 1, TicketStatus.Refunded)]
    [InlineData(SettleType.Early, 1, 0, 0, 0, 0, 1, TicketStatus.Calculated)]
    public async Task FetchResultDetails_Always_GenerateTicketStatus(string settleType, int betCount, int inRunning, int inWaiting, int betMarkedCount, int betSettledCount, int betRefundedCount, string ticketStatus)
    {
        var resultDetail = new ResultDetail
        {
            BetCount = betCount,
            InWaiting = inWaiting,
            InRunning = inRunning,
            BetMarkedCount = betMarkedCount,
            BetSettledCount = betSettledCount,
            BetRefundedCount = betRefundedCount,
            ResourceId = "00"
        };

        var ticketDetails = new List<ResultDetail> { resultDetail };
        var resultDetails = new List<ResultDetail> { new() { ResourceId = "00" } };
        repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>())
            .Returns(resultDetails);

        repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((new List<ResultDetail>(), new List<TicketCounts>()));

        mergeDataService.MergeTicketDetails(Arg.Any<List<(List<ResultDetail>, TicketCounts)>>())
            .Returns((ticketDetails, new TicketCounts()));

        var (actualResultDetail, _) = await service.FetchResultDetails(new GetResultDetailCriteria { SettleType = settleType }, SportType.ESports);

        Assert.Equal(ticketStatus, actualResultDetail[0].TicketStatus);
    }

    [Fact]
    public async Task FetchResultDetails_ESportsNotExistTicketDetail_GenerateNoTicket()
    {
        var resultDetails = new List<ResultDetail> { new() { ResourceId = "00" } };
        repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>())
            .Returns(resultDetails);

        repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((new List<ResultDetail>(), new List<TicketCounts>()));

        mergeDataService.MergeTicketDetails(Arg.Any<List<(List<ResultDetail>, TicketCounts)>>())
            .Returns((new List<ResultDetail> { new() { ResourceId = "00" } }, new TicketCounts()));

        var (actualResultDetail, _) = await service.FetchResultDetails(new GetResultDetailCriteria(), SportType.ESports);

        Assert.Equal(TicketStatus.NoTicket, actualResultDetail[0].TicketStatus);
    }

    [Fact]
    public async Task FetchResultDetails_NotESportsAndNotExistTicketDetail_DoNotReturnTicket()
    {
        var resultDetails = new List<ResultDetail> { new() { ResourceId = "00" } };
        repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>())
            .Returns(resultDetails);

        repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((new List<ResultDetail>(), new List<TicketCounts>()));

        mergeDataService.MergeTicketDetails(Arg.Any<List<(List<ResultDetail>, TicketCounts)>>())
            .Returns((new List<ResultDetail>(), new TicketCounts()));

        var (actualResultDetail, _) = await service.FetchResultDetails(new GetResultDetailCriteria(), SportType.Badminton);

        Assert.Empty(actualResultDetail);
    }

    [Theory]
    [InlineData(true, 1)]
    [InlineData(false, 2)]
    public async Task CheckMarkedTickets_Always_ReturnCorrectResult(bool result, byte executeTime)
    {
        await repository.ExecuteAsync(Arg.Do<CheckingMarkedTicketsCriteria>(x =>
        {
            x.IsExistMarkedTicket = result;
        }));
        var request = new CheckMarkedTicketsRequest
        {
            MatchId = 12345,
            SelectedResources = []
        };

        var actual = await service.CheckMarkedTickets(request);

        Assert.Equal(result, actual.IsExistMarkedTicket);
        await repository.Received(executeTime).ExecuteAsync(Arg.Any<CheckingMarkedTicketsCriteria>());
    }

    [Fact]
    public async Task Settle_ValidateFailed_ReturnErrorAndStopProcess()
    {
        var resultMessage = new ResultMessage
        {
            ErrorCode = 1,
            ErrorMessage = "Message"
        };

        var criteria = new SettleCriteria { Action = "CAL" };
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(resultMessage);
        createQueryService.QuerySettle(Arg.Any<SettleRequest>()).Returns(criteria);

        var actual = await service.Settle(new SettleRequest());

        var expectResult = new Result
        {
            ErrCode = 1,
            ErrMsg = "Message",
            ChildMatchIds = null,
            SettledSessionId = actual.SettledSessionId,
        };

        Assert.Equal(expectResult.ErrCode, actual.ErrCode);
    }

    [Fact]
    public async Task Settle_ValidatePassedAndExistChildMatch_ReturnListChildMatchIds()
    {
        var childMatch = new ChildMatch { MatchId = 123 };
        var childMatchSecond = new ChildMatch { MatchId = 456 };
        var request = new SettleRequest
        {
            SelectedResources = [new ResourceItem { ResourceId = "00" }],
            SportType = SportType.Cricket
        };
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());
        createQueryService.QuerySettle(Arg.Any<SettleRequest>()).Returns(new SettleCriteria { Action = "CAL" });
        repository.FetchAsync<ChildMatch>(Arg.Any<GetChildMatchCriteria>()).Returns(new List<ChildMatch> { childMatch, childMatchSecond });
        var actual = await service.Settle(request);

        var expectResult = new Result
        {
            ErrCode = 0,
            ErrMsg = null,
            ChildMatchIds = "123,456",
            SettledSessionId = actual.SettledSessionId,
            IsOrg = true
        };

        Assert.Equal(expectResult.ErrCode, actual.ErrCode);
        Assert.Equal(expectResult.ChildMatchIds, actual.ChildMatchIds);
    }

    [Fact]
    public async Task Settle_ValidatePassed_CallInOrderAllRelatedMethods()
    {
        var request = new SettleRequest
        {
            SelectedResources = [new ResourceItem { ResourceId = "00" }]
        };
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());
        createQueryService.QuerySettle(Arg.Any<SettleRequest>()).Returns(new SettleCriteria { Action = "CAL" });
        scaleOutSettleService.GetSiteGroupId(Arg.Any<string>()).Returns(1, 2);

        await service.Settle(request);

        await scaleOutSettleService.Received()
            .UpdateUnderSettlementFlag(Arg.Any<int>(), Arg.Any<int>(), Arg.Any<string>());
        await scaleOutSettleService.Received().UpdateMatchInfo(Arg.Any<UpdateMatchInfoRequest>());
        await repository.Received(2).ExecuteAsync(Arg.Any<SettleCriteria>());
    }

    [Fact]
    public async Task Settle_ValidatePassedAndIsResettle_InsertLog()
    {
        var request = new SettleRequest
        {
            IsReSettledTickets = true,
            SelectedResources = [new ResourceItem { ResourceId = "00" }]
        };
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());
        createQueryService.QuerySettle(Arg.Any<SettleRequest>()).Returns(new SettleCriteria { Action = "CAL", IsReSettledTickets = true });
        scaleOutSettleService.GetSiteGroupId(Arg.Any<string>()).Returns(1, 2);

        await service.Settle(request);

        await logService.Received().WriteLog(Arg.Any<InsertLogCriteria>());
    }

    [Fact]
    public async Task SettleChildMatch_ExistChildMatchItem_SettleForEachChildMatch()
    {
        var request = new SettleChildMatchRequest
        {
            ChildMatches =
            [
                new ChildMatchModel { MatchId = 1 },
                new ChildMatchModel { MatchId = 2 }
            ],
            SelectedResources = [new ResourceItem { ResourceId = "00" }]
        };
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());
        createQueryService.QuerySettleChildMatch(Arg.Any<SettleChildMatchRequest>()).Returns(new SettleCriteria { Action = "CAL" });
        createQueryService.CreateResourceChildMatch(Arg.Any<ChildMatchModel>()).Returns("");

        await service.SettleChildMatch(request);

        await repository.Received(4).ExecuteAsync(Arg.Any<SettleCriteria>());
        createQueryService.Received(2).WriteLogChildMatch(Arg.Any<SettleCriteria>(), Arg.Any<Result>());
    }

    [Fact]
    public async Task SettleChildMatch_ExistListChildMatchIds_SettleForEachChildMatch()
    {
        var request = new SettleChildMatchRequest
        {
            ChildMatchIds = "123,456",
            SelectedResources = [new ResourceItem { ResourceId = "00" }]
        };
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());
        createQueryService.QuerySettleChildMatch(Arg.Any<SettleChildMatchRequest>()).Returns(new SettleCriteria { Action = "CAL" });
        createQueryService.CreateResources(Arg.Any<List<ResourceItem>>()).Returns("");

        await service.SettleChildMatch(request);

        await repository.Received(4).ExecuteAsync(Arg.Any<SettleCriteria>());
    }

    [Fact]
    public async Task FetchResultDetails_BasketballEarlySettlement_ExecutesGenerateRelatedResource()
    {
        // Arrange
        var criteria = new GetResultDetailCriteria
        {
            MatchId = 12345,
            SettleType = SettleType.Early
        };

        var ticketDetails = new List<ResultDetail>
        {
            new() { ResourceId = "00", BetCount = 5 },
            new() { ResourceId = "01", BetCount = 3 },
            new() { ResourceId = "02", BetCount = 0 } // Should not be included in related resources
        };

        var resultDetails = new List<ResultDetail>
        {
            new() { ResourceId = "00" },
            new() { ResourceId = "01" }
        };

        repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>())
            .Returns(resultDetails);

        repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((new List<ResultDetail>(), new List<TicketCounts>()));

        mergeDataService.MergeTicketDetails(Arg.Any<List<(List<ResultDetail>, TicketCounts)>>())
            .Returns((ticketDetails, new TicketCounts()));

        // Act
        await service.FetchResultDetails(criteria, SportType.BasketBall);

        // Assert
        await repository.Received(1).ExecuteAsync(Arg.Is<GenerateRelatedResourcesCriteria>(x =>
            x.MatchId == 12345 &&
            x.ResourceIds == "00,01")); // Only resources with BetCount > 0
    }

    [Fact]
    public async Task FetchResultDetails_NonBasketballSport_DoesNotExecuteGenerateRelatedResource()
    {
        // Arrange
        var criteria = new GetResultDetailCriteria
        {
            MatchId = 12345,
            SettleType = SettleType.Early
        };

        var ticketDetails = new List<ResultDetail>
        {
            new() { ResourceId = "00", BetCount = 5 }
        };

        var resultDetails = new List<ResultDetail>
        {
            new() { ResourceId = "00" }
        };

        repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>())
            .Returns(resultDetails);

        repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((new List<ResultDetail>(), new List<TicketCounts>()));

        mergeDataService.MergeTicketDetails(Arg.Any<List<(List<ResultDetail>, TicketCounts)>>())
            .Returns((ticketDetails, new TicketCounts()));

        // Act
        await service.FetchResultDetails(criteria, SportType.Soccer);

        // Assert
        await repository.DidNotReceive().ExecuteAsync(Arg.Any<GenerateRelatedResourcesCriteria>());
    }

    [Fact]
    public async Task FetchResultDetails_BasketballNonEarlySettlement_DoesNotExecuteGenerateRelatedResource()
    {
        // Arrange
        var criteria = new GetResultDetailCriteria
        {
            MatchId = 12345,
            SettleType = SettleType.Calculate
        };

        var ticketDetails = new List<ResultDetail>
        {
            new() { ResourceId = "00", BetCount = 5 }
        };

        var resultDetails = new List<ResultDetail>
        {
            new() { ResourceId = "00" }
        };

        repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>())
            .Returns(resultDetails);

        repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((new List<ResultDetail>(), new List<TicketCounts>()));

        mergeDataService.MergeTicketDetails(Arg.Any<List<(List<ResultDetail>, TicketCounts)>>())
            .Returns((ticketDetails, new TicketCounts()));

        // Act
        await service.FetchResultDetails(criteria, SportType.BasketBall);

        // Assert
        await repository.DidNotReceive().ExecuteAsync(Arg.Any<GenerateRelatedResourcesCriteria>());
    }

    [Fact]
    public async Task FetchResultDetails_MergeTicketDetailsWithResults_ReturnsCorrectMergedData()
    {
        // Arrange
        var criteria = new GetResultDetailCriteria
        {
            MatchId = 12345,
            SettleType = SettleType.Early
        };

        var ticketDetails = new List<ResultDetail>
        {
            new() { ResourceId = "00", BetCount = 5, IsSpecialBettype = 1 },
            new() { ResourceId = "01", BetCount = 3, IsSpecialBettype = 0 },
            new() { ResourceId = "02", BetCount = 2, IsSpecialBettype = 1 } // New ticket not in results
        };

        var resultDetails = new List<ResultDetail>
        {
            new() { ResourceId = "00" }, // Existing in both
            new() { ResourceId = "01" }  // Existing in both
        };

        repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>())
            .Returns(resultDetails);

        repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((new List<ResultDetail>(), new List<TicketCounts>()));

        mergeDataService.MergeTicketDetails(Arg.Any<List<(List<ResultDetail>, TicketCounts)>>())
            .Returns((ticketDetails, new TicketCounts()));

        // Act
        var (actualResults, _) = await service.FetchResultDetails(criteria, SportType.Soccer);

        // Assert
        Assert.Equal(3, actualResults.Count); // Should include merged ticket detail
        Assert.Contains(actualResults, r => r.ResourceId == "00" && r.IsSpecialBettype == 1);
        Assert.Contains(actualResults, r => r.ResourceId == "01" && r.IsSpecialBettype == 0);
        Assert.Contains(actualResults, r => r.ResourceId == "02" && r.IsSpecialBettype == 1);
    }

    [Fact]
    public async Task FetchResultDetails_FilterNotIncludedTickets_ReturnsOnlyIncludedTickets()
    {
        // Arrange
        var criteria = new GetResultDetailCriteria
        {
            MatchId = 12345,
            SettleType = SettleType.Early
        };

        var ticketDetails = new List<ResultDetail>
        {
            new() { ResourceId = "00", BetCount = 5 }, // Will get status other than NotIncluded
            new() { ResourceId = "01", BetCount = 0 }  // Will get NoTicket status
        };

        var resultDetails = new List<ResultDetail>
        {
            new() { ResourceId = "00" },
            new() { ResourceId = "02" } // This will get NotIncluded status (no matching ticket)
        };

        repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>())
            .Returns(resultDetails);

        repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((new List<ResultDetail>(), new List<TicketCounts>()));

        mergeDataService.MergeTicketDetails(Arg.Any<List<(List<ResultDetail>, TicketCounts)>>())
            .Returns((ticketDetails, new TicketCounts()));

        // Act
        var (actualResults, _) = await service.FetchResultDetails(criteria, SportType.Soccer);

        // Assert - Should exclude tickets with NotIncluded status
        Assert.DoesNotContain(actualResults, r => r.TicketStatus == TicketStatus.NotIncluded);
        Assert.All(actualResults, r => Assert.NotEqual(TicketStatus.NotIncluded, r.TicketStatus));
    }

    [Fact]
    public async Task FetchResultDetails_MultipleServers_CallsRepositoryForEachServer()
    {
        // Arrange
        var criteria = new GetResultDetailCriteria
        {
            MatchId = 12345,
            SettleType = SettleType.Early
        };

        var ticketDetails = new List<ResultDetail>();
        var resultDetails = new List<ResultDetail>();

        repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>())
            .Returns(resultDetails);

        repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((new List<ResultDetail>(), new List<TicketCounts>()));

        mergeDataService.MergeTicketDetails(Arg.Any<List<(List<ResultDetail>, TicketCounts)>>())
            .Returns((ticketDetails, new TicketCounts()));

        // Act
        await service.FetchResultDetails(criteria, SportType.Soccer);

        // Assert - Should call FetchMultipleAsync for each server (01, 02)
        await repository.Received(2).FetchMultipleAsync<ResultDetail, TicketCounts>(
            Arg.Is<GetTicketDetailsCriteria>(x =>
                x.MatchId == 12345 &&
                x.SettleType == SettleType.Early &&
                x.SportType == SportType.Soccer));
    }

    [Fact]
    public async Task FetchResultDetails_ReturnsCorrectTicketCounts()
    {
        // Arrange
        var criteria = new GetResultDetailCriteria
        {
            MatchId = 12345,
            SettleType = SettleType.Early
        };

        var expectedTicketCounts = new TicketCounts
        {
            BetCount = 100,
            BetSettledCount = 50
        };

        var ticketDetails = new List<ResultDetail>();
        var resultDetails = new List<ResultDetail>();

        repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>())
            .Returns(resultDetails);

        repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((new List<ResultDetail>(), new List<TicketCounts>()));

        mergeDataService.MergeTicketDetails(Arg.Any<List<(List<ResultDetail>, TicketCounts)>>())
            .Returns((ticketDetails, expectedTicketCounts));

        // Act
        var (_, actualTicketCounts) = await service.FetchResultDetails(criteria, SportType.Soccer);

        // Assert
        Assert.Equal(expectedTicketCounts.BetCount, actualTicketCounts.BetCount);
        Assert.Equal(expectedTicketCounts.BetSettledCount, actualTicketCounts.BetSettledCount);
    }

    [Fact]
    public async Task FetchResultDetails_SetsSportTypeOnCriteria()
    {
        // Arrange
        var criteria = new GetResultDetailCriteria
        {
            MatchId = 12345,
            SettleType = SettleType.Early,
            SportType = 0 // Initially unset
        };

        var ticketDetails = new List<ResultDetail>();
        var resultDetails = new List<ResultDetail>();

        repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>())
            .Returns(resultDetails);

        repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
            .Returns((new List<ResultDetail>(), new List<TicketCounts>()));

        mergeDataService.MergeTicketDetails(Arg.Any<List<(List<ResultDetail>, TicketCounts)>>())
            .Returns((ticketDetails, new TicketCounts()));

        // Act
        await service.FetchResultDetails(criteria, SportType.Tennis);

        // Assert - Verify the criteria passed to repository has correct SportType
        await repository.Received(1).FetchAsync<ResultDetail>(
            Arg.Is<GetResultDetailCriteria>(x => x.SportType == SportType.Tennis));
    }
}