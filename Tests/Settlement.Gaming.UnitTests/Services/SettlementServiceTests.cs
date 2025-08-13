using Fanex.Data.Repository;
using Fanex.Settlement.Converter.Services;
using Fanex.Settlement.ScaleOut.Models;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using NSubstitute;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Gaming.Criteria.NumberGame;
using Settlement.Gaming.Models;
using Settlement.Gaming.Models.NumberGame;
using Settlement.Gaming.Requests;
using Settlement.Gaming.Services.NumberGame;

namespace Settlement.Gaming.UnitTests.Services;

public class SettlementServiceTests
{
    private readonly IDynamicRepository repository = Substitute.For<IDynamicRepository>();
    private readonly XmlConvertService xmlConvertService = Substitute.For<XmlConvertService>();
    private readonly IHttpContextAccessor accessor = Substitute.For<IHttpContextAccessor>();
    private readonly ScaleOutSettleThirdPartyService scaleOutSettleThirdPartyService = Substitute.For<ScaleOutSettleThirdPartyService>();
    private readonly ScaleOutSettleService scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
    private readonly IOptions<AppSettingsKey> appSettingsKey = Substitute.For<IOptions<AppSettingsKey>>();
    private readonly LogService logService = Substitute.For<LogService>();
    private readonly SettlementServiceImp service;

    public SettlementServiceTests()
    {
        var context = Substitute.For<HttpContext>();
        var connection = Substitute.For<ConnectionInfo>();
        connection.RemoteIpAddress.Returns(System.Net.IPAddress.Loopback);
        context.Connection.Returns(connection);
        accessor.HttpContext.Returns(context);
        appSettingsKey.Value.Returns(new AppSettingsKey { SiteDbServer = new List<string> { "db1" } });
        service = new SettlementServiceImp(
            repository,
            xmlConvertService,
            accessor,
            scaleOutSettleThirdPartyService,
            scaleOutSettleService,
            appSettingsKey,
            logService);
    }

    [Fact]
    public async Task Settle_ReturnsNoPermission_WhenNoPermission()
    {
        // Arrange
        var request = new NumberGameSettlementRequest
        {
            Permission = new Permission { CanCalculate = false, CanItAdmin = false }
        };

        // Act
        var result = await service.Settle(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1000, result.ErrCode);
        Assert.Contains("not authorized", result.ErrMsg, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Settle_CallsSettleWhenHavePermission_WhenHasPermission()
    {
        // Arrange
        var request = new NumberGameSettlementRequest
        {
            MatchId = 1,
            UserId = 2,
            Balls = new List<BallModel> { new BallModel { Seq = 1, NumberBall = 5 } },
            Action = ActionType.CalculateAll,
            Permission = new Permission { CanCalculate = true, CanItAdmin = false }
        };
        scaleOutSettleThirdPartyService.GetDeploymentInfo(Arg.Any<GetDeploymentInfoRequest>())
            .Returns(new ResultMessage { ErrorCode = 0 });
        await repository.ExecuteAsync(Arg.Any<UpdateResultCriteria>());
        await scaleOutSettleThirdPartyService.UpdateMatchInfo3rd(Arg.Any<UpdateMatchInfo3RdRequest>());
        xmlConvertService.Serialize(Arg.Any<BallResultsModel>()).Returns("<xml>ballresults</xml>");
        await repository.ExecuteAsync(Arg.Any<RecalculateNumberGameCriteria>());
        scaleOutSettleService.GetSiteGroupId(Arg.Any<string>()).Returns(1);

        // Act
        var result = await service.Settle(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(0, result.ErrCode);
    }

    [Fact]
    public async Task SettleWhenHavePermission_ReturnsError_WhenDeploymentFails()
    {
        // Arrange
        var request = new NumberGameSettlementRequest
        {
            MatchId = 1,
            UserId = 2,
            Balls = new List<BallModel> { new BallModel { Seq = 1, NumberBall = 5 } },
            Action = ActionType.CalculateAll,
            Permission = new Permission { CanCalculate = true, CanItAdmin = false }
        };
        scaleOutSettleThirdPartyService.GetDeploymentInfo(Arg.Any<GetDeploymentInfoRequest>())
            .Returns(new ResultMessage { ErrorCode = 999, ErrorMessage = "Deployment error" });

        // Act
        var result = await service.Settle(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(999, result.ErrCode);
        Assert.Equal("Deployment error", result.ErrMsg);
    }
}
