using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Log.Handlers;
using Settlement.Log.Models;
using Settlement.Log.Requests;
using LogService = Settlement.Log.Services.LogService;

namespace Settlement.Log.UnitTests.Handlers;

public class LogHandlerTests
{
    private readonly IBalanceUpService balanceUpService;
    private readonly LogService logService;
    private readonly LogHandler handler;

    public LogHandlerTests()
    {
        balanceUpService = Substitute.For<IBalanceUpService>();
        logService = Substitute.For<LogService>();
        handler = new LogHandler(logService, balanceUpService);
    }

    [Fact]
    public async Task Handle_FromDateGreaterThanBalanceUpDay_CallGetLogMethodAndReturnOneLogItem()
    {
        // Arrange
        var request = new LogRequest
        {
            FromDate = DateTime.Today
        };
        var balanceUp = new BalanceUp
        {
            BalanceUpDay = DateTime.Now.AddDays(-1)
        };
        var logs = new List<LogModel>
        {
            new LogModel { MatchId = 1 }
        };
        balanceUpService.GetBalanceUpDay().Returns(balanceUp);
        logService.GetLog(Arg.Any<LogRequest>()).Returns(logs);

        // Act
        await handler.Handle(request, new CancellationToken());

        // Assert
        Received.InOrder(() =>
        {
            logService.GetLog(Arg.Any<LogRequest>());
            logService.GetLogDetail(Arg.Is<List<LogModel>>(item => item.Count == 1), Arg.Any<string>());
        });
    }

    [Fact]
    public async Task Handle_FromDateLessThanBalanceUpDay_CallGetLogAndGetArchiveLogMethodAndReturnTwoLogItem()
    {
        // Arrange
        var request = new LogRequest
        {
            FromDate = DateTime.Today
        };
        var balanceUp = new BalanceUp
        {
            BalanceUpDay = DateTime.Now.AddDays(1)
        };
        var logs = new List<LogModel>
        {
            new LogModel { MatchId = 1 }
        };
        balanceUpService.GetBalanceUpDay().Returns(balanceUp);
        logService.GetLog(Arg.Any<LogRequest>()).Returns(logs);
        logService.GetArchiveLog(Arg.Any<LogRequest>()).Returns(logs);

        // Act
        await handler.Handle(request, new CancellationToken());

        // Assert
        Received.InOrder(() =>
        {
            logService.GetLog(Arg.Any<LogRequest>());
            logService.GetLogDetail(Arg.Is<List<LogModel>>(item => item.Count == 2), Arg.Any<string>());
        });
    }
}