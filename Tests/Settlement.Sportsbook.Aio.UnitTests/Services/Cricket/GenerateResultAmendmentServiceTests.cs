using Fanex.Settlement.Converter.Services;
using Settlement.Models;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Cricket;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Cricket;

public class GenerateResultAmendmentServiceTests
{
    private readonly GenerateResultAmendmentService generateResultAmendmentService;
    private readonly XmlConvertService xmlConvertService = Substitute.For<XmlConvertService>();
    public GenerateResultAmendmentServiceTests()
    {
        generateResultAmendmentService = new GenerateResultAmendmentServiceImp(xmlConvertService);
    }

    [Fact]
    public void CreateWrongActualResults_ResourceItemNotFound_ReturnNull()
    {
        // Arrange
        var resultsChanged = new List<ResultChanged>
        {
            new() { ResourceId = "1" },
            new() { ResourceId = "2" }
        };
        var selectedResources = new List<ResourceItem>();

        // Act
        var (wrongResults, actualResults) = generateResultAmendmentService.CreateWrongActualResults(resultsChanged, selectedResources);

        // Assert
        Assert.Null(wrongResults);
        Assert.Null(actualResults);
    }

    [Fact]
    public void CreateWrongActualResults_WithValidData_ReturnsSerializedResults()
    {
        // Arrange
        var resultsChanged = new List<ResultChanged>
            {
                new() { ResourceId = "123", HomeValue = "H", AwayValue = "A" },
                new() { ResourceId = "456", HomeValue = "A", AwayValue = "H" }
            };

        var selectedResources = new List<ResourceItem>
            {
                new() { ResourceId = "123", HomeValue = "H", AwayValue = "A" },
                new() { ResourceId = "456", HomeValue = "A", AwayValue = "H" }
            };

        var expectedWrongResults = new List<CricketResultItem>
            {
                new() { ResourceId = "123", Home = "H", Away = "A", RefBetTypeId = "123" },
                new() { ResourceId = "456", Home = "A", Away = "H", RefBetTypeId = "456" }
            };

        var expectedActualResults = new List<CricketResultItem>
            {
                new() { ResourceId = "123", Home = "H", Away = "A", RefBetTypeId = "123" },
                new() { ResourceId = "456", Home = "A", Away = "H", RefBetTypeId = "456" }
            };

        xmlConvertService.Serialize(Arg.Any<CricketResult>()).Returns("SerializedResult");

        // Act
        var (actualWrongResults, actualActualResults) = generateResultAmendmentService.CreateWrongActualResults(resultsChanged, selectedResources);

        // Assert
        Assert.Equal("SerializedResult", actualWrongResults);
        Assert.Equal("SerializedResult", actualActualResults);
        xmlConvertService.Received(2).Serialize(Arg.Any<CricketResult>());
    }

    [Fact]
    public void CreateWrongActualResults_WithNullResourceItem_ReturnsNull()
    {
        // Arrange
        var resultsChanged = new List<ResultChanged>
            {
                new() { ResourceId = "123", HomeValue = "H", AwayValue = "A" }
            };

        var selectedResources = new List<ResourceItem>();

        // Act
        var (actualWrongResults, actualActualResults) = generateResultAmendmentService.CreateWrongActualResults(resultsChanged, selectedResources);

        // Assert
        Assert.Null(actualWrongResults);
        Assert.Null(actualActualResults);
        xmlConvertService.DidNotReceive().Serialize(Arg.Any<CricketResult>());
    }

    [Fact]
    public void CreateExtraInfo_WithValidData_ReturnsSerializedExtraInfo()
    {
        // Arrange
        var resultsChanged = new List<ResultChanged>
            {
                new() { ResourceId = "123", LogDate = new DateTime(2022, 1, 1) },
                new() { ResourceId = "456", LogDate = new DateTime(2022, 1, 2) }
            };

        var expectedExtraInfoItems = new List<ExtraInfoItem>
            {
                new() { ResourceId = "123", CalcDateTime = "2022-01-01 00:00:00.000", ReCalcDateTime = "2022-01-01 00:00:00.000" },
                new() { ResourceId = "456", CalcDateTime = "2022-01-02 00:00:00.000", ReCalcDateTime = "2022-01-02 00:00:00.000" }
            };

        var expectedExtraInfo = new ExtraInfo { ExtraInfoItems = expectedExtraInfoItems };

        xmlConvertService.Serialize(Arg.Any<ExtraInfo>()).Returns("SerializedExtraInfo");

        // Act
        var actualExtraInfo = generateResultAmendmentService.CreateExtraInfo(resultsChanged);

        // Assert
        Assert.Equal("SerializedExtraInfo", actualExtraInfo);
        xmlConvertService.Received(1).Serialize(Arg.Any<ExtraInfo>());
    }
}