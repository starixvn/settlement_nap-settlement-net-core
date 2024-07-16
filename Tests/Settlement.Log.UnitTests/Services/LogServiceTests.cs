using AutoMapper;
using Fanex.Data.Repository;
using Settlement.Core.Services;
using Settlement.Log.Models;
using Settlement.Log.Services;
using LogService = Settlement.Log.Services.LogService;

namespace Settlement.Log.UnitTests.Services;

public class LogServiceTests
{
    private readonly LogDetailService logDetailService;
    private readonly LogService service;

    public LogServiceTests()
    {
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<LogAutoMapper>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);

        logDetailService = Substitute.For<LogDetailService>();
        var repository = Substitute.For<IDynamicRepository>();
        var refDataService = Substitute.For<IRefDataService>();

        service = new Log.Services.LogServiceImp(repository, logDetailService, mapper, refDataService);
    }

    [Fact]
    public async Task GetLogDetail_ProductTypeIsResettle_CallTwoExpectedMethods()
    {
        // Arrange
        var logs = new List<LogModel>
        {
                new() { MatchId = 1}
        };

        // Act
        var logsDetail = await service.GetLogDetail(logs, "RES");

        // Assert
        await logDetailService.Received(1).GetLogDetailResettle(Arg.Any<int>(), Arg.Any<int>());
        await logDetailService.Received(1).GetPlayerNameCricket(Arg.Any<int>(), Arg.Any<int>());
        Assert.Single(logsDetail);
    }

    [Fact]
    public async Task GetLogDetail_ProductTypeIsNotResettle_CallOneExpectedMethods()
    {
        // Arrange
        var logs = new List<LogModel>
        {
            new() { MatchId = 1}
        };

        // Act
        var logsDetail = await service.GetLogDetail(logs, "FMK");

        // Assert
        await logDetailService.Received(1).GetLogDetailByMatchAndProduct(Arg.Any<int>(), Arg.Any<string>());
        Assert.Single(logsDetail);
    }
}