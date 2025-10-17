using Fanex.Settlement.ScaleOut.Constants;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;
using System.Globalization;

namespace Settlement.ThirdPartyProducts.UnitTests.Services;

public class BetBuilderCalculateServiceTests
{
    private readonly BetBuilderGenerateService betBuilderGenerateService;
    private readonly XmlConvertService xmlConvertService;
    private readonly Settlement.Core.Services.LogService logService;
    private readonly IBetbuilderResultAmendmentService amendmentService;
    private readonly BetBuilderCalculateService service;

    public BetBuilderCalculateServiceTests()
    {
        betBuilderGenerateService = Substitute.For<BetBuilderGenerateService>();
        xmlConvertService = Substitute.For<XmlConvertService>();
        logService = Substitute.For<Settlement.Core.Services.LogService>();
        amendmentService = Substitute.For<IBetbuilderResultAmendmentService>();

        service = new BetBuilderCalculateServiceImp(
            betBuilderGenerateService,
            xmlConvertService,
            logService,
            amendmentService
        );
    }

    private static CalculateRequest CreateRequest(string action = ActionType.CalculateAll, int matchId = 1, int sportType = 2, long sessionId = 999)
        => new()
        {
            ActionName = action,
            MatchId = matchId,
            SportType = sportType,
            Resources =
            [
                new ResourcesItemModel { SelectionType = 101, Result = "H" },
            new ResourcesItemModel { SelectionType = 202, Result = "A" }
            ]
        };

    [Fact]
    public async Task Calculate_SelectedMarketEmpty_EarlyReturnAfterUpdateAndLog()
    {
        // Arrange
        var request = CreateRequest();
        betBuilderGenerateService.SelectedSection(request.Resources).Returns("S1");
        betBuilderGenerateService.GetInfoMarket(request, "S1").Returns(("", [""])); // empty market

        // Act
        var result = await service.Calculate(request);

        // Assert
        Assert.NotNull(result);
        await betBuilderGenerateService.Received(1).UpdateMatchInfo(request, "", "S1");
        await betBuilderGenerateService.Received(1).WriteLog(request, "S1");
        await betBuilderGenerateService.DidNotReceive().Execute(Arg.Any<CalculateRequest>(), Arg.Any<string>(), Arg.Any<string>());
        await amendmentService.DidNotReceive().GetResultChanged(Arg.Any<CalculateRequest>(), Arg.Any<string>());
        await amendmentService.DidNotReceive().PublishResultAmendment(Arg.Any<CalculateRequest>(), Arg.Any<List<Fanex.Settlement.MessageBridge.ResultAmendment.ResourceItem>>(), Arg.Any<List<Fanex.Settlement.MessageBridge.ResultAmendment.ResultChanged>>());
        await logService.DidNotReceive().WriteLog(Arg.Any<InsertLogCriteria>());
        xmlConvertService.DidNotReceive().Serialize(Arg.Any<Core.Models.Resources<Core.Models.ResourceItem>>());
    }

    [Fact]
    public async Task Calculate_Successful_NoAmendment_WritesLogs_Executes_SetsSessionId()
    {
        // Arrange
        var request = CreateRequest(ActionType.CalculateFullTime, sessionId: 12345);
        betBuilderGenerateService.SelectedSection(request.Resources).Returns("S1");
        betBuilderGenerateService.GetInfoMarket(request, "S1").Returns(("MKT1", ["extra"]));
        xmlConvertService.Serialize(Arg.Any<Core.Models.Resources<Core.Models.ResourceItem>>()).Returns("<xml/>");
        amendmentService.GetResultChanged(request, "<xml/>").Returns(Array.Empty<Fanex.Settlement.MessageBridge.ResultAmendment.ResultChanged>());
        betBuilderGenerateService.Execute(request, "MKT1", "S1").Returns(new Result());

        // Act
        var result = await service.Calculate(request);

        // Assert
        Assert.NotNull(result);
        Assert.False(result.HasResultAmendment);

        await betBuilderGenerateService.Received(1).UpdateMatchInfo(request, "MKT1", "S1");
        await betBuilderGenerateService.Received(1).WriteLog(request, "S1");
        xmlConvertService.Received(1).Serialize(Arg.Is<Core.Models.Resources<Core.Models.ResourceItem>>(r =>
            r.ResourceItems.Count == request.Resources.Count
            && r.ResourceItems[0].ResourceId == request.Resources[0].SelectionType.ToString(CultureInfo.InvariantCulture)
            && r.ResourceItems[0].HomeValue == request.Resources[0].Result
        ));

        await logService.Received(1).WriteLog(Arg.Is<InsertLogCriteria>(c =>
            c.MatchId == request.MatchId &&
            c.Action == request.ActionName &&
            c.Mode == Mode.BetBuilder &&
            c.Sporttype == request.SportType &&
            c.IsAuto == false &&
            !string.IsNullOrEmpty(c.SelectedResources)
        ));

        //await amendmentService.Received(1).GetResultChanged(request, "<xml/>");
        await amendmentService.DidNotReceive().PublishResultAmendment(Arg.Any<CalculateRequest>(), Arg.Any<List<Fanex.Settlement.MessageBridge.ResultAmendment.ResourceItem>>(), Arg.Any<List<Fanex.Settlement.MessageBridge.ResultAmendment.ResultChanged>>());
        await betBuilderGenerateService.Received(1).Execute(request, "MKT1", "S1");
    }

    [Fact]
    public async Task Calculate_CalculateAll_WithResultChanged_PublishesAmendment_SetsFlag()
    {
        // Arrange
        var request = CreateRequest(ActionType.CalculateAll);
        betBuilderGenerateService.SelectedSection(request.Resources).Returns("S1");
        betBuilderGenerateService.GetInfoMarket(request, "S1").Returns(("MKT2", [""]));
        xmlConvertService.Serialize(Arg.Any<Core.Models.Resources<Core.Models.ResourceItem>>()).Returns("<xml/>");

        var changes = new List<Fanex.Settlement.MessageBridge.ResultAmendment.ResultChanged>
    {
        new() { ResourceId = "101", HomeValue = "H" }
    };
        amendmentService.GetResultChanged(request, "<xml/>").Returns(changes);
        betBuilderGenerateService.Execute(request, "MKT2", "S1").Returns(new Result());

        // Act
        var result = await service.Calculate(request);

        // Assert
        Assert.True(result.HasResultAmendment);
        await amendmentService.Received(1).PublishResultAmendment(
            request,
            Arg.Is<List<Fanex.Settlement.MessageBridge.ResultAmendment.ResourceItem>>(list =>
                list.Count == request.Resources.Count &&
                list[0].ResourceId == request.Resources[0].SelectionType.ToString(CultureInfo.InvariantCulture) &&
                list[0].HomeValue == request.Resources[0].Result
            ),
            changes
        );
    }

    [Fact]
    public async Task Calculate_CalculateAll_NoResultChanged_DoesNotPublish()
    {
        // Arrange
        var request = CreateRequest(ActionType.CalculateAll);
        betBuilderGenerateService.SelectedSection(request.Resources).Returns("S1");
        betBuilderGenerateService.GetInfoMarket(request, "S1").Returns(("MKT3", [""]));
        xmlConvertService.Serialize(Arg.Any<Core.Models.Resources<Core.Models.ResourceItem>>()).Returns("<xml/>");
        amendmentService.GetResultChanged(request, "<xml/>").Returns(Array.Empty<Fanex.Settlement.MessageBridge.ResultAmendment.ResultChanged>());
        betBuilderGenerateService.Execute(request, "MKT3", "S1").Returns(new Result());

        // Act
        var result = await service.Calculate(request);

        // Assert
        Assert.False(result.HasResultAmendment);
        await amendmentService.DidNotReceive().PublishResultAmendment(
            Arg.Any<CalculateRequest>(),
            Arg.Any<List<Fanex.Settlement.MessageBridge.ResultAmendment.ResourceItem>>(),
            Arg.Any<List<Fanex.Settlement.MessageBridge.ResultAmendment.ResultChanged>>()
        );
    }
}
