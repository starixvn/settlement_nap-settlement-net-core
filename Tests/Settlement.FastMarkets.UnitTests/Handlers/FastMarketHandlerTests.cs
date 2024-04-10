using Fanex.Caching;
using Fanex.NAP.Client.Helpers.Web;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.FastMarkets.Handlers;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Requests;
using Settlement.FastMarkets.Services;
using MatchDetail = Settlement.FastMarkets.Models.MatchDetail;

namespace Settlement.FastMarkets.UnitTests.Handlers;

public class FastMarketHandlerTests
{
    private readonly IMatchDetailService matchDetailService;

    private readonly PermissionService permissionService;

    private readonly IFastMarketService fastMarketService;

    private readonly FastMarketHandler handler;

    private readonly ISettingService settingService;

    public FastMarketHandlerTests()
    {
        var napSession = Substitute.For<INapSession>();
        var cacheService = Substitute.For<ICacheService>();
        napSession.UserId = 1;
        cacheService.GetOrSet(Arg.Any<string>(), Arg.Any<Func<Permission>>(), Arg.Any<CacheItemOptions>()).Returns(new Permission());
        permissionService = Substitute.For<PermissionService>(napSession, null, cacheService, null);
        matchDetailService = Substitute.For<IMatchDetailService>();
        fastMarketService = Substitute.For<IFastMarketService>();
        settingService = Substitute.For<ISettingService>();
        handler = new FastMarketHandler(matchDetailService, permissionService, fastMarketService, settingService, napSession);
    }

    [Fact]
    public async Task Handle_Always_ReturnResult()
    {
        var result = new Result();
        settingService.UpdateWaterBreakSetting(Arg.Any<UpdateWaterBreakSettingRequest>()).Returns(result);

        var actual = await handler.Handle(new UpdateWaterBreakSettingRequest(), new CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleSettleRequest_Always_ReturnCorrectResult()
    {
        var result = new Result();
        fastMarketService.Calculate(Arg.Any<SettleRequest>()).Returns(result);

        var actual = await handler.Handle(new SettleRequest(), new CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleCheckingMarkedTicketsRequest_Always_ReturnCorrectResult()
    {
        var result = new MarkedTickets();
        matchDetailService.CheckingMarkedTickets(Arg.Any<CheckingMarkedTicketsRequest>()).Returns(result);

        var actual = await handler.Handle(new CheckingMarkedTicketsRequest(), new CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleGetMatchRequest_Always_ReturnCorrectResult()
    {
        var result = new MatchDetail
        {
            AutoSettingIcon =
            {
                Disabled = true
            }
        };
        matchDetailService.MatchInfo(Arg.Any<int>()).Returns(result);

        var actual = await handler.Handle(new MatchDetailRequest(), new CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleGetBetType_Always_ReturnFastMarketModel()
    {
        var result = new FastMarketModel();
        var permission = new Permission();
        result.Permission = permission;
        fastMarketService.Query(Arg.Any<int>()).Returns(result);

        var actual = await handler.Handle(new BetTypeIntervalRequest(), new CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleGetLatestResultRequest_Always_ReturnCorrectResult()
    {
        var result = new List<FastMarketResult>();
        fastMarketService.GetLatestResult(Arg.Any<GetLatestResultRequest>()).Returns(result);

        var actual = await handler.Handle(new GetLatestResultRequest(), new CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleGetTimeMachineResultRequest_Always_ReturnCorrectResult()
    {
        var result = new List<TimeMachineResult>();
        fastMarketService.GetTimeMachineResult(Arg.Any<GetTimeMachineResultRequest>()).Returns(result);

        var actual = await handler.Handle(new GetTimeMachineResultRequest(), new CancellationToken());

        Assert.Equal(result, actual);
    }
}