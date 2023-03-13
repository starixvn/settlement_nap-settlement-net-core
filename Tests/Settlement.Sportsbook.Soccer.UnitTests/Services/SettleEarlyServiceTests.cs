using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Models;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Soccer.Criteria;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services;

public class SettleEarlyServiceTests
{
    private readonly ICreateCriteriaService createCriteriaService;

    private readonly IDynamicRepository repository;

    private readonly ScaleOutSettleService scaleOutSettleService;

    private readonly SettleEarlyService service;

    private readonly LogDirectlyService logDirectlyService;

    private readonly XmlConvertService xmlConvertService;

    public SettleEarlyServiceTests()
    {
        createCriteriaService = Substitute.For<ICreateCriteriaService>();
        repository = Substitute.For<IDynamicRepository>();
        scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
        var appSettings = new AppSettingsKey { SiteDbServer = new List<string> { "DB01", "DB02" } };
        var appSettingsOptions = Options.Create(appSettings);
        service = new SettleEarlyServiceImp(createCriteriaService, appSettingsOptions, repository, scaleOutSettleService, logDirectlyService, xmlConvertService);
    }

    [Fact]
    public async Task CalculateEarly_ExistError_StopProcess()
    {
        //arrange
        createCriteriaService.CreateCalculateEarlyCriteria(Arg.Any<SettleEarlyRequest>())
            .Returns(new CalculateEarlyCriteria());
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>())
            .Returns(new ResultMessage { ErrorCode = 1, ErrorMessage = "1" });

        //act
        var result = await service.CalculateEarly(new SettleEarlyRequest());

        //assert
        Assert.True(result.ErrCode == 1 && result.ErrMsg == "1");
        await scaleOutSettleService.DidNotReceive().UpdateMatchInfo(Arg.Any<UpdateMatchInfoRequest>());
    }

    [Fact]
    public async Task CalculateEarly_NotExistError_UpdateAndSettlematch()
    {
        //arrange
        createCriteriaService.CreateCalculateEarlyCriteria(Arg.Any<SettleEarlyRequest>())
            .Returns(new CalculateEarlyCriteria());
        scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>())
            .Returns(new ResultMessage());

        //act
        var result = await service.CalculateEarly(new SettleEarlyRequest());

        //assert
        Received.InOrder(() =>
        {
            scaleOutSettleService.Received().UpdateMatchInfo(Arg.Any<UpdateMatchInfoRequest>());
            repository.Received().ExecuteAsync(Arg.Any<CalculateEarlyCriteria>());
            repository.Received().ExecuteAsync(Arg.Any<CalculateEarlyCriteria>());
        });
    }
}