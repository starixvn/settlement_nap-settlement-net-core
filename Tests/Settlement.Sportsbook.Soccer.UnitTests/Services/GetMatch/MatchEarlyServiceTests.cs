using AutoMapper;
using Fanex.Data.Repository;
using NSubstitute.ReturnsExtensions;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Models;
using MatchDetail = Settlement.Sportsbook.Soccer.Models.MatchDetail;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services.GetMatch;

using Core.Services.SpecificService;
using Soccer.Services.GetMatch;

public class MatchEarlyServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly EarlyBetTypeNameService earlyBetTypeNameService;

    private readonly IFetchDataService fetchDataService;

    private readonly MatchEarlyService service;

    public MatchEarlyServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        var permission = Substitute.For<PermissionService>(null, null, null, null);
        var refDataService = Substitute.For<IRefDataService>();
        var goalIconService = Substitute.For<GoalIconService>();
        earlyBetTypeNameService = Substitute.For<EarlyBetTypeNameService>();
        fetchDataService = Substitute.For<IFetchDataService>();
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<SoccerAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        service = new MatchEarlyServiceImp(repository, permission, mapper, refDataService, goalIconService,
            earlyBetTypeNameService, fetchDataService);
    }

    [Fact]
    public async Task GetMatch_MatchDetailIsNull_ThrowNullException()
    {
        repository.GetAsync<MatchDetail>(Arg.Any<GetMatchDetailEarlyCriteria>()).ReturnsNull();

        await Assert.ThrowsAsync<ArgumentNullException>(() => service.GetMatch(1));
    }

    [Theory]
    [InlineData(1, 0, 0, 1, "318000", TicketStatus.Running)]
    [InlineData(0, 2, 0, 2, "318000", TicketStatus.Waiting)]
    [InlineData(0, 2, 1, 3, "318000", TicketStatus.Marked)]
    [InlineData(0, 0, 0, 0, "381xxx", TicketStatus.NoTicket)]
    [InlineData(0, 0, 0, 0, "318000", TicketStatus.Calculated)]
    public async Task GetMatch_Always_GenerateTicketStatus(int inRunning, int inWaiting, int marked, int betCount, string resourceId, string ticketStatus)
    {
        var listResult = new List<ResultDetailModel>
        {
            new()
            {
                InRunning = inRunning,
                InWaiting = inWaiting,
                BetMarkedCount = marked,
                BetCount = betCount,
                ResourceId = resourceId
            }
        };
        repository.GetAsync<MatchDetail>(Arg.Any<GetMatchDetailEarlyCriteria>()).Returns(new MatchDetail());
        fetchDataService.GetEarlyTicketDetails(Arg.Any<GetResultDetailEarlyCriteria>())
            .Returns((listResult, new TicketCounts()));

        var match = await service.GetMatch(1);
        var resultDetail = match.ResultDetail[0];

        Assert.Equal(resultDetail.TicketStatus, ticketStatus);
    }

    [Fact]
    public async Task GetMatch_ResultNotExistTicketInfo_GenerateNoTicket()
    {
        var listResult = new List<ResultDetailModel>
        {
            new()
            {
                InRunning = 0,
                InWaiting = 0,
                BetMarkedCount = 0,
                BetCount = 0,
                ResourceId = "318000"
            },
            new()
            {
                InRunning = 0,
                InWaiting = 0,
                BetMarkedCount = 0,
                BetCount = 0,
                ResourceId = "381000"
            }
        };
        repository.GetAsync<MatchDetail>(Arg.Any<GetMatchDetailEarlyCriteria>()).Returns(new MatchDetail());
        repository.FetchAsync<ResultDetailModel>(Arg.Any<GetResultDetailEarlyCriteria>()).Returns(listResult);
        fetchDataService.GetEarlyTicketDetails(Arg.Any<GetResultDetailEarlyCriteria>())
            .Returns((new List<ResultDetailModel>(), new TicketCounts()));

        var match = await service.GetMatch(1);
        var resultDetail = match.ResultDetail[0];

        Assert.Single(match.ResultDetail);
        Assert.Equal(TicketStatus.NoTicket, resultDetail.TicketStatus);
    }

    [Fact]
    public async Task GetMatch_Always_GenerateBetTypeName()
    {
        const int betType = 381;
        const string resourceId = "381000";
        var listResult = new List<ResultDetailModel>
        {
            new()
            {
                InRunning = 0,
                InWaiting = 0,
                BetMarkedCount = 0,
                BetCount = 0,
                ResourceId = "318000"
            },
            new()
            {
                InRunning = 0,
                InWaiting = 0,
                BetMarkedCount = 0,
                BetCount = 0,
                ResourceId = resourceId
            }
        };

        repository.GetAsync<MatchDetail>(Arg.Any<GetMatchDetailEarlyCriteria>()).Returns(new MatchDetail());
        repository.FetchAsync<ResultDetailModel>(Arg.Any<GetResultDetailEarlyCriteria>()).Returns(listResult);
        fetchDataService.GetEarlyTicketDetails(Arg.Any<GetResultDetailEarlyCriteria>())
            .Returns((new List<ResultDetailModel>(), new TicketCounts()));
        earlyBetTypeNameService.GetGroupMap(betType, resourceId).Returns(1);
        earlyBetTypeNameService.GetBetTypeName(betType, resourceId).Returns("betTypeName");

        var match = await service.GetMatch(1);
        var resultDetail = match.ResultDetail[0];

        Assert.Equal(TicketStatus.NoTicket, resultDetail.TicketStatus);
        Assert.Equal(1, resultDetail.Map);
        Assert.Equal(betType.ToString(), resultDetail.BetType);
        Assert.Equal("betTypeName", resultDetail.BetTypeName);
        earlyBetTypeNameService.Received(1).GetGroupMap(betType, resourceId);
        earlyBetTypeNameService.Received(1).GetBetTypeName(betType, resourceId);
    }
}