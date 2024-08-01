using Fanex.Settlement.Converter.Services;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Cricket;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Cricket;

public class GenerateResultAmendmentServiceTests
{
    private readonly GenerateResultAmendmentService generateResultAmendmentService;
    private readonly XmlConvertService xmlConvertService;

    public GenerateResultAmendmentServiceTests()
    {
        xmlConvertService = Substitute.For<XmlConvertService>();
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
                new() { ResourceId = "9400", HomeValue = "H", AwayValue = "A" },
                new() { ResourceId = "9401", HomeValue = "A", AwayValue = "H" }
            };

        var selectedResources = new List<ResourceItem>
            {
                new () { ResourceId = "9400", HomeValue = "H", AwayValue = "A" },
                new () { ResourceId = "9401", HomeValue = "A", AwayValue = "H" }
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
    public void CreateWrongActualResults_MainFinalResult_ReturnsSerializedResults()
    {
        // Arrange
        var resultsChanged = new List<ResultChanged>
            {
                new() { ResourceId = "00", HomeValue = "1", AwayValue = "0" },
            };

        var selectedResources = new List<ResourceItem>
            {
                new () { ResourceId = "00", HomeValue = "2", AwayValue = "0" },
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
    public void CreateWrongActualResults_MainFinalInningResult_ReturnsSerializedResults()
    {
        // Arrange
        var resultsChanged = new List<ResultChanged>
            {
                new() { ResourceId = "H1", HomeValue = "1", AwayValue = "0" },
            };

        var selectedResources = new List<ResourceItem>
            {
                new () { ResourceId = "H1", HomeValue = "2", AwayValue = "0" },
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
    public void CreateWrongActualResults_EarlyTypeOneResult_ReturnsSerializedResults()
    {
        // Arrange
        var resultsChanged = new List<ResultChanged>
            {
                new() { ResourceId = "94421", HomeValue = "1", AwayValue = "0" },
            };

        var selectedResources = new List<ResourceItem>
            {
                new () { ResourceId = "94421", HomeValue = "2", AwayValue = "0" },
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
    public void CreateWrongActualResults_EarlyTypeTwoResult_ReturnsSerializedResults()
    {
        // Arrange
        var resultsChanged = new List<ResultChanged>
            {
                new() { ResourceId = "9446", HomeValue = "1", AwayValue = "0" },
            };

        var selectedResources = new List<ResourceItem>
            {
                new () { ResourceId = "9446", HomeValue = "2", AwayValue = "0" },
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
    public void CreateWrongActualResults_EarlyTypeFourResult_ReturnsSerializedResults()
    {
        // Arrange
        var resultsChanged = new List<ResultChanged>
            {
                new() { ResourceId = "97081", HomeValue = "1", AwayValue = "0" },
            };

        var selectedResources = new List<ResourceItem>
            {
                new () { ResourceId = "97081", HomeValue = "2", AwayValue = "0" },
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
    public void CreateWrongActualResults_EarlyTypeFiveResult_ReturnsSerializedResults()
    {
        // Arrange
        var resultsChanged = new List<ResultChanged>
            {
                new() { ResourceId = "96681", HomeValue = "1", AwayValue = "0",OtherInfo = "12" },
            };

        var selectedResources = new List<ResourceItem>
            {
                new () { ResourceId = "96681", HomeValue = "2", AwayValue = "0",OtherInfo = "12" },
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
    public void CreateWrongActualResults_EarlyTypeSixResult_ReturnsSerializedResults()
    {
        // Arrange
        var resultsChanged = new List<ResultChanged>
            {
                new() { ResourceId = "96761", HomeValue = "1", AwayValue = "0",OtherInfo = "12" },
            };

        var selectedResources = new List<ResourceItem>
            {
                new () { ResourceId = "96761", HomeValue = "2", AwayValue = "0",OtherInfo = "12" },
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
    public void CreateWrongActualResults_EarlyTypeSevenResult_ReturnsSerializedResults()
    {
        // Arrange
        var resultsChanged = new List<ResultChanged>
            {
                new() { ResourceId = "96621", HomeValue = "A", AwayValue = "0",OtherInfo = "12" },
            };

        var selectedResources = new List<ResourceItem>
            {
                new () { ResourceId = "96621", HomeValue = "N", AwayValue = "0",OtherInfo = "12" },
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
    public void CreateWrongActualResults_EarlyIncludedOversResult_ReturnsSerializedResults()
    {
        // Arrange
        var resultsChanged = new List<ResultChanged>
            {
                new() { ResourceId = "94841002", HomeValue = "A", AwayValue = "0",OtherInfo = "12" },
            };

        var selectedResources = new List<ResourceItem>
            {
                new () { ResourceId = "94841002", HomeValue = "N", AwayValue = "0",OtherInfo = "12" },
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
    public void CreateWrongActualResults_EarlyIncludedOversAndBalls_ReturnsSerializedResults()
    {
        // Arrange
        var resultsChanged = new List<ResultChanged>
            {
                new() { ResourceId = "9490100201", HomeValue = "A", AwayValue = "0",OtherInfo = "12" },
            };

        var selectedResources = new List<ResourceItem>
            {
                new () { ResourceId = "9490100201", HomeValue = "N", AwayValue = "0",OtherInfo = "12" },
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
                new() { ResourceId = "123", LogDate = new DateTimeOffset(2022, 1, 1, 1, 1, 0, new TimeSpan(5, 0, 0)) },
                new() { ResourceId = "456", LogDate = new DateTimeOffset(2022, 1, 2,1, 1, 0, new TimeSpan(5, 0, 0)) }
            };

        xmlConvertService.Serialize(Arg.Any<ExtraInfo>()).Returns("SerializedExtraInfo");

        // Act
        var actualExtraInfo = generateResultAmendmentService.CreateExtraInfo(resultsChanged);

        // Assert
        Assert.Equal("SerializedExtraInfo", actualExtraInfo);
        xmlConvertService.Received(1).Serialize(Arg.Any<ExtraInfo>());
    }
}