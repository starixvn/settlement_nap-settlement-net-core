using Fanex.Caching;
using Fanex.NAP.Client;
using Fanex.NAP.Client.Configuration;
using Fanex.NAP.Client.Services;
using MassTransit;
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

    private readonly IFastMarketService fastMarketService;

    private readonly FastMarketHandler handler;

    private readonly ISettingService settingService;
    private readonly IPublishEndpoint publishEndpoint;

    public FastMarketHandlerTests()
    {
        var napSession = Substitute.For<INapSession>();
        napSession.UserId = 1;

        var cacheService = Substitute.For<ICacheService>();
        var napSettings = Substitute.For<INapSettings>();
        var userService = Substitute.For<IUserService>();
        cacheService.GetOrSet(Arg.Any<string>(), Arg.Any<Func<Permission>>(), Arg.Any<CacheItemOptions>()).Returns(new Permission());
        var permissionService = Substitute.For<PermissionService>(napSession, userService, napSettings);
        permissionService.Permission.Returns(new Permission());
        matchDetailService = Substitute.For<IMatchDetailService>();
        fastMarketService = Substitute.For<IFastMarketService>();
        settingService = Substitute.For<ISettingService>();
        publishEndpoint = Substitute.For<IPublishEndpoint>();

        handler = new FastMarketHandler(matchDetailService, permissionService, fastMarketService, settingService, napSession, publishEndpoint);
    }

    [Fact]
    public async Task Handle_Always_ReturnResult()
    {
        var result = new Result();
        settingService.UpdateWaterBreakSetting(Arg.Any<UpdateWaterBreakSettingRequest>()).Returns(result);

        var actual = await handler.Handle(new UpdateWaterBreakSettingRequest(), CancellationToken.None);

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleSettleRequest_Always_ReturnCorrectResult()
    {
        var result = new Result();
        fastMarketService.Calculate(Arg.Any<SettleRequest>()).Returns(result);

        var actual = await handler.Handle(new SettleRequest(), CancellationToken.None);

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleCheckingMarkedTicketsRequest_Always_ReturnCorrectResult()
    {
        var result = new MarkedTickets();
        matchDetailService.CheckingMarkedTickets(Arg.Any<CheckingMarkedTicketsRequest>()).Returns(result);

        var actual = await handler.Handle(new CheckingMarkedTicketsRequest(), CancellationToken.None);

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

        var actual = await handler.Handle(new MatchDetailRequest(), CancellationToken.None);

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleGetBetType_Always_ReturnFastMarketModel()
    {
        var result = new FastMarketModel();
        var permission = new Permission();
        result.Permission = permission;
        fastMarketService.Query(Arg.Any<int>()).Returns(result);

        var actual = await handler.Handle(new BetTypeIntervalRequest(), CancellationToken.None);

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleGetLatestResultRequest_Always_ReturnCorrectResult()
    {
        var result = new List<FastMarketResult>();
        fastMarketService.GetLatestResult(Arg.Any<GetLatestResultRequest>()).Returns(result);

        var actual = await handler.Handle(new GetLatestResultRequest(), CancellationToken.None);

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleGetTimeMachineResultRequest_Always_ReturnCorrectResult()
    {
        var result = new List<TimeMachineResult>();
        fastMarketService.GetTimeMachineResult(Arg.Any<GetTimeMachineResultRequest>()).Returns(result);

        var actual = await handler.Handle(new GetTimeMachineResultRequest(), CancellationToken.None);

        Assert.Equal(result, actual);
    }
}