using Fanex.Caching;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Handlers;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using Settlement.Sportsbook.Aio.Services;
using Settlement.Sportsbook.Aio.Services.Cricket;

namespace Settlement.Sportsbook.Aio.UnitTests.Handlers;

public class AioHandlerTests
{
    private readonly AioHandler handler;

    private readonly PermissionService permission;

    private readonly IAioService service;
    private readonly ResultAmendmentService resultAmendmentService;

    public AioHandlerTests()
    {
        service = Substitute.For<IAioService>();
        var napSession = Substitute.For<INapSession>();
        var cacheService = Substitute.For<ICacheService>();
        napSession.UserId = 1;
        cacheService.GetOrSet(Arg.Any<string>(), Arg.Any<Func<Permission>>(), Arg.Any<CacheItemOptions>()).Returns(new Permission());
        permission = Substitute.For<PermissionService>(napSession, null, cacheService, null);
        var appSettings = new AppSettingsKey { EnableVerifyingRunningOdds = true };
        var appSettingsOptions = Options.Create(appSettings);
        resultAmendmentService = Substitute.For<ResultAmendmentService>();
        handler = new AioHandler(service, permission, resultAmendmentService, appSettingsOptions);
    }

    [Fact]
    public async Task HandleGetMatchRequest_Always_ReturnCorrectResult()
    {
        var result = new AioMatch();
        service.GetMatch(Arg.Any<GetMatchRequest>()).Returns(result);

        var actual = await handler.Handle(new GetMatchRequest(), new CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleSettleRequest_Always_ReturnCorrectResult()
    {
        var result = new Result();
        service.Settle(Arg.Any<SettleRequest>()).Returns(result);

        var actual = await handler.Handle(new SettleRequest(), new CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleGetRecalResultRequest_Always_ReturnCorrectResult()
    {
        var result = new List<Models.ResultDetail>();
        service.GetRecalResult(Arg.Any<GetRecalResultRequest>()).Returns(result);

        var actual = await handler.Handle(new GetRecalResultRequest(), new CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleCheckMarkedTicketsRequest_Always_ReturnCorrectResult()
    {
        var result = new MarkedTickets();
        service.CheckMarkedTickets(Arg.Any<CheckMarkedTicketsRequest>()).Returns(result);

        var actual = await handler.Handle(new CheckMarkedTicketsRequest(), new CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleCheckRunningOddsRequest_Always_ReturnCorrectResult()
    {
        var result = new Result { ErrCode = 1 };
        service.VerifyNoRunningOdds(Arg.Any<CheckRunningOddsRequest>()).Returns(result);

        var actual = await handler.Handle(new CheckRunningOddsRequest(), new CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleCheckRunningOddsRequest_TurnOffConfig_ReturnNewResult()
    {
        var appSettings = new AppSettingsKey { EnableVerifyingRunningOdds = false };
        var appSettingsOptions = Options.Create(appSettings);
        var handlerTemp = new AioHandler(service, permission, resultAmendmentService, appSettingsOptions);
        var actual = await handlerTemp.Handle(new CheckRunningOddsRequest(), new CancellationToken());

        Assert.True(actual.IsSuccessful);
        await service.DidNotReceive().VerifyNoRunningOdds(Arg.Any<CheckRunningOddsRequest>());
    }

    [Fact]
    public async Task HandleSaveScoreRequest_Always_ReturnCorrectResult()
    {
        var result = new Result();
        service.SaveScore(Arg.Any<SaveScoreRequest>()).Returns(result);

        var actual = await handler.Handle(new SaveScoreRequest(), new CancellationToken());

        Assert.Equal(result, actual);
    }

    [Fact]
    public async Task HandleSettleChildMatchRequest_Always_ReturnCorrectResult()
    {
        var result = new Result();
        service.SettleChildMatch(Arg.Any<SettleChildMatchRequest>()).Returns(result);

        var actual = await handler.Handle(new SettleChildMatchRequest(), new CancellationToken());

        Assert.Equal(result, actual);
    }
}