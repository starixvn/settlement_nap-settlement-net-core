using NSubstitute;
using Settlement.Core.Services;
using Settlement.Outright.Criteria;
using Settlement.Outright.Models;
using Settlement.Outright.Requests;
using Settlement.Outright.Services;

namespace Settlement.Sportsbook.Outright.UnitTests.services;

public class OutrightLogProcessServiceTests
{
    private readonly OutrightLogQueryService outrightLogQueryService;

    private readonly OutrightLogProcessService service;

    public OutrightLogProcessServiceTests()
    {
        outrightLogQueryService = Substitute.For<OutrightLogQueryService>();
        var refDataService = Substitute.For<IRefDataService>();
        service = new OutrightLogProcessServiceImp(outrightLogQueryService, refDataService);
    }

    [Fact]
    public async Task GetOutrightLogByOutrightId_NotExistLog_ReturnsEmptyList()
    {
        // Arrange
        outrightLogQueryService.GetOutrightLog(Arg.Any<GetLogRequest>()).Returns(new OutrightLog());

        // Act
        var actualOutrightLogs = await service.GetOutrightLogByOutrightId(new GetLogRequest());

        // Assert
        Assert.Empty(actualOutrightLogs);
    }

    [Fact]
    public async Task GetOutrightLogByOutrightId_ExistLogButNotExistLogDetail_ReturnsEmptyList()
    {
        // Arrange
        outrightLogQueryService.GetOutrightLogs(Arg.Any<GetLogRequest>()).Returns(new List<OutrightLog>());
        outrightLogQueryService.GetOutrightLog(Arg.Any<GetLogRequest>()).Returns(new OutrightLog());
        outrightLogQueryService.GetOutrightLogDetails(Arg.Any<GetOutrightLogDetailCriteria>())
            .Returns(new List<OutrightLogDetail>());

        // Act
        var actualOutrightLogs = await service.GetOutrightLogByOutrightId(new GetLogRequest());

        // Assert
        Assert.Empty(actualOutrightLogs);
    }

    [Fact]
    public async Task GetOutrightLogByOutrightId_ExistLogAndLogDetail_ReturnsListLog()
    {
        // Arrange
        const int teamId = 1000;
        var outrightLog = new OutrightLog { OrId = 1, TeamId = teamId };
        var logDetails = new List<OutrightLogDetail> { new() };
        outrightLogQueryService.GetOutrightLog(Arg.Any<GetLogRequest>()).Returns(outrightLog);
        outrightLogQueryService.GetOutrightLogDetails(Arg.Any<GetOutrightLogDetailCriteria>())
            .Returns(logDetails);

        // Act
        var actualOutrightLogs = await service.GetOutrightLogByOutrightId(new GetLogRequest());

        // Assert
        Assert.Equal(outrightLog, actualOutrightLogs.FirstOrDefault());
        Assert.Equal(logDetails, outrightLog.OutrightLogDetails);
        Assert.True(logDetails.All(x => x.TeamId == teamId));
    }

    [Fact]
    public async Task GetOutrightLogByMatchCode_NotExistLog_ReturnsEmptyList()
    {
        // Arrange
        outrightLogQueryService.GetOutrightLogs(Arg.Any<GetLogRequest>()).Returns(new List<OutrightLog>());

        // Act
        var actualOutrightLogs = await service.GetOutrightLogByMatchCode(new GetLogRequest());

        // Assert
        Assert.Empty(actualOutrightLogs);
    }

    [Fact]
    public async Task GetOutrightLogByMatchCode_ExistLogButNotExistLogDetail_ReturnsEmptyList()
    {
        // Arrange
        var outrightLogs = new List<OutrightLog> { new() };
        outrightLogQueryService.GetOutrightLogs(Arg.Any<GetLogRequest>()).Returns(outrightLogs);

        outrightLogQueryService.GetOutrightLog(Arg.Any<GetLogRequest>()).Returns(new OutrightLog());

        // Act
        var actualOutrightLogs = await service.GetOutrightLogByMatchCode(new GetLogRequest());

        // Assert
        Assert.Empty(actualOutrightLogs);
    }

    [Fact]
    public async Task GetOutrightLogByMatchCode_ExistLogAndLogDetail_ReturnsNotEmptyList()
    {
        // Arrange

        var outrightLogs = new List<OutrightLog> { new() };
        var outrightLog = new OutrightLog { OrId = 1, TeamId = 1000 };
        var logDetails = new List<OutrightLogDetail> { new() };
        outrightLogQueryService.GetOutrightLogs(Arg.Any<GetLogRequest>()).Returns(outrightLogs);
        outrightLogQueryService.GetOutrightLog(Arg.Any<GetLogRequest>()).Returns(outrightLog);
        outrightLogQueryService.GetOutrightLogDetails(Arg.Any<GetOutrightLogDetailCriteria>())
            .Returns(logDetails);

        // Act
        var actualOutrightLogs = await service.GetOutrightLogByMatchCode(new GetLogRequest());

        // Assert
        Assert.True(actualOutrightLogs.Count > 0);
    }
}