using Settlement.Sportsbook.Aio.Services.ESport;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.ESport;

using Settlement.Core.Models;

public class ProviderMapperServiceTests
{
    [Fact]
    public void Decorate_Should_AddExternalResultsToExternalResultModel()
    {
        // Arrange
        var service = new ProviderMapperService();
        var externalResultDetails = new List<ExternalResultDetailModel>
        {
            new() { SourceId = 1, SourceName = "Source 1", OrderNo = 1, Remark = "Remark 1" },
            new() { SourceId = 2, SourceName = "Source 2", OrderNo = 2, Remark = "Remark 2" },
            new() { SourceId = 3, SourceName = "Source 3", OrderNo = 3, Remark = "Remark 3" }
        };
        var externalResultModel = new List<ExternalResultModel>();

        var obj = new Tuple<List<ExternalResultDetailModel>, List<ExternalResultModel>>(externalResultDetails, externalResultModel);

        // Act
        service.Decorate(obj);

        // Assert
        Assert.Equal(3, externalResultModel.Count);
        Assert.Equal(1, externalResultModel[0].SourceId);
        Assert.Equal("Source 1", externalResultModel[0].SourceName);
        Assert.Equal(1, externalResultModel[0].OrderNo);
        Assert.Equal("Remark 1", externalResultModel[0].Remark);
        Assert.Equal(2, externalResultModel[1].SourceId);
        Assert.Equal("Source 2", externalResultModel[1].SourceName);
        Assert.Equal(2, externalResultModel[1].OrderNo);
        Assert.Equal("Remark 2", externalResultModel[1].Remark);
        Assert.Equal(3, externalResultModel[2].SourceId);
        Assert.Equal("Source 3", externalResultModel[2].SourceName);
        Assert.Equal(3, externalResultModel[2].OrderNo);
        Assert.Equal("Remark 3", externalResultModel[2].Remark);
    }
}