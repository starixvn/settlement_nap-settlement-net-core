using System.Collections.Generic;
using System.Threading.Tasks;
using NSubstitute;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.FastMarkets.Handlers;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Requests;
using Settlement.FastMarkets.Services;
using Xunit;
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
        matchDetailService = Substitute.For<IMatchDetailService>();
        permissionService = Substitute.For<PermissionService>(null, null, null, null);
        fastMarketService = Substitute.For<IFastMarketService>();
        settingService = Substitute.For<ISettingService>();
        handler = new FastMarketHandler(matchDetailService, permissionService, fastMarketService, settingService);
    }

    [Fact]
    public async Task Handle_Always_ReturnResult()
    {
        var result = new Result();
        settingService.UpdateWaterBreakSetting(Arg.Any<UpdateWaterBreakSettingRequest>()).Returns(result);

        var actual = await handler.Handle(new UpdateWaterBreakSettingRequest(), new System.Threading.CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleSettleRequest_Always_ReturnCorrectResult()
    {
        var result = new Result();
        fastMarketService.Calculate(Arg.Any<SettleRequest>()).Returns(result);

        var actual = await handler.Handle(new SettleRequest(), new System.Threading.CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleCheckingMarkedTicketsRequest_Always_ReturnCorrectResult()
    {
        var result = new MarkedTickets();
        matchDetailService.CheckingMarkedTickets(Arg.Any<CheckingMarkedTicketsRequest>()).Returns(result);

        var actual = await handler.Handle(new CheckingMarkedTicketsRequest(), new System.Threading.CancellationToken());

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
        permissionService.Permission.Returns(new Permission());

        var actual = await handler.Handle(new MatchDetailRequest(), new System.Threading.CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleGetBetType_Always_ReturnFastMarketModel()
    {
        var result = new FastMarketModel();
        var permission = new Permission();
        result.Permission = permission;
        fastMarketService.Query(Arg.Any<int>()).Returns(result);
        permissionService.Permission.Returns(permission);

        var actual = await handler.Handle(new BetTypeIntervalRequest(), new System.Threading.CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleGetLastestResultRequest_Always_ReturnCorrectResult()
    {
        var result = new List<FastMarketResult>();
        fastMarketService.GetLastestResult(Arg.Any<GetLastestResultRequest>()).Returns(result);
        permissionService.Permission.Returns(new Permission());

        var actual = await handler.Handle(new GetLastestResultRequest(), new System.Threading.CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleGetTimeMachineResultRequest_Always_ReturnCorrectResult()
    {
        var result = new List<TimeMachineResult>();
        fastMarketService.GetTimeMachineResult(Arg.Any<GetTimeMachineResultRequest>()).Returns(result);
        permissionService.Permission.Returns(new Permission());

        var actual = await handler.Handle(new GetTimeMachineResultRequest(), new System.Threading.CancellationToken());

        Assert.Equal(result, actual);
    }
}