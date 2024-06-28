using NSubstitute;
using Settlement.Models;
using Settlement.Services;
using Settlement.Outright.Requests;
using Settlement.Outright.Services;

namespace Settlement.Sportsbook.Outright.UnitTests.services;

public class OutrightLogServiceTests
{
    private readonly OutrightLogProcessService outrightLogProcessService;

    private readonly IBalanceUpService balanceUpService;

    private readonly OutrightLogService service;

    public OutrightLogServiceTests()
    {
        outrightLogProcessService = Substitute.For<OutrightLogProcessService>();
        balanceUpService = Substitute.For<IBalanceUpService>();
        service = new OutrightLogServiceImp(outrightLogProcessService, balanceUpService);
    }

    [Fact]
    public async Task GetLogForView_RequestWithMatchId_CallGetLogByMatchId()
    {
        var request = new GetLogRequest
        {
            MatchId = 1
        };

        balanceUpService.GetBalanceUpDay().Returns(new BalanceUp { MoveBetsDay = DateTime.Today });

        await service.GetLogForView(request);

        await outrightLogProcessService.Received().GetOutrightLogByOutrightId(request);
    }

    [Fact]
    public async Task GetLogForView_RequestWithMatchIdIsNull_CallGetLogByMatchCode()
    {
        var request = new GetLogRequest
        {
            MatchCode = "123"
        };

        balanceUpService.GetBalanceUpDay().Returns(new BalanceUp { MoveBetsDay = DateTime.Today });

        await service.GetLogForView(request);

        await outrightLogProcessService.Received().GetOutrightLogByMatchCode(request);
    }
}