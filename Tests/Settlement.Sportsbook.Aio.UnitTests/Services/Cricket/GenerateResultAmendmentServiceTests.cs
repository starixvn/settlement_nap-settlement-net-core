using Fanex.Settlement.Converter.Services;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Cricket;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Cricket;

public class GenerateResultAmendmentServiceTests
{
    private readonly GenerateResultAmendmentService generateResultAmendmentService;

    public GenerateResultAmendmentServiceTests()
    {
        var xmlConvertService = Substitute.For<XmlConvertService>();
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
}