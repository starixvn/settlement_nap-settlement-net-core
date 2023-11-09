using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.Settlement.ScaleOut.Criteria.Normal;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.MoveTickets.Criteria;
using Settlement.Sportsbook.MoveTickets.Models;
using Settlement.Sportsbook.MoveTickets.Requests;

namespace Settlement.Sportsbook.MoveTickets.UnitTests.Services;

public class MoveActionServiceTests
{
    private readonly IDynamicRepository repository;
    private readonly LogService logService;
    private readonly MoveActionService service;

    public MoveActionServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        var currentSession = Substitute.For<INapSession>();
        logService = Substitute.For<LogService>();
        var accessor = Substitute.For<IHttpContextAccessor>();
        var context = new DefaultHttpContext
        {
            Connection =
            {
                RemoteIpAddress = new System.Net.IPAddress(1)
            }
        };
        accessor.HttpContext = context;
        var appSettings = new AppSettingsKey { SiteDbServer = new List<string> { "01", "02" } };
        var options = Options.Create(appSettings);
        service = new MoveActionServiceImp(repository, currentSession, accessor, logService,
            options);
    }

    [Fact]
    public async Task MoveTicket_ValidateEventFailed_WriteLogFailAndStop()
    {
        await repository.ExecuteAsync(Arg.Do<ValidateEventCriteria>(c =>
        {
            c.ErrCode = 1;
            c.ErrMsg = "error";
        }));
        var result = await service.MoveTicket(new MoveTicketRequest { MatchId = 100 });

        await logService.Received().ActionLog(100, "error", 81026);
        Assert.Equal("error", result.ErrMsg);
    }

    [Fact]
    public async Task MoveTicket_NotExistTicketMoved_WriteLogFailAndStop()
    {
        repository.GetAsync<MoveTicketInfo>(Arg.Any<GetMoveTicketInfoCriteria>()).Returns(new MoveTicketInfo());
        await repository.ExecuteAsync(Arg.Any<MoveTicketCriteria>());
        var result = await service.MoveTicket(new MoveTicketRequest { MatchId = 100 });

        await logService.Received().ActionLog(100, "WARNING! Cannot continue due to current has no valid ticket to move.", 81026);
        Assert.Equal("WARNING! Cannot continue due to current has no valid ticket to move.", result.ErrMsg);
    }

    [Fact]
    public async Task MoveTicket_MoveFailed_WriteLogFailAndStop()
    {
        repository.GetAsync<MoveTicketInfo>(Arg.Any<GetMoveTicketInfoCriteria>()).Returns(new MoveTicketInfo());
        await repository.ExecuteAsync(Arg.Do<MoveTicketCriteria>(c =>
        {
            c.ErrCode = 1;
            c.ErrMsg = "error";
        }));
        var result = await service.MoveTicket(new MoveTicketRequest { MatchId = 100 });

        await logService.Received().ActionLog(100, "error", 81026);
        Assert.Equal("error", result.ErrMsg);
    }

    [Fact]
    public async Task MoveTicket_ValidatePassed_ExecuteAll()
    {
        repository.GetAsync<MoveTicketInfo>(Arg.Any<GetMoveTicketInfoCriteria>()).Returns(new MoveTicketInfo());
        await repository.ExecuteAsync(Arg.Do<MoveTicketCriteria>(c =>
        {
            c.TicketCount = 1;
        }));
        var result = await service.MoveTicket(new MoveTicketRequest());

        await logService.Received(1).WriteLog(Arg.Any<int>(), Arg.Any<string>());
        await logService.Received(1).ActionLog(Arg.Any<int>(), Arg.Any<string>(), 81025);
        await repository.Received(2).ExecuteAsync(Arg.Any<MoveTicketCriteria>());
        await repository.Received(1).ExecuteAsync(Arg.Any<UpdateChildMatchCriteria>());
        await repository.Received(1).ExecuteAsync(Arg.Any<UpdateChildMatchRemarkCriteria>());
        Assert.Equal(0, result.ErrCode);
    }
}