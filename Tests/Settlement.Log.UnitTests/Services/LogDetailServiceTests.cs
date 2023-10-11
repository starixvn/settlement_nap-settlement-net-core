using Fanex.Data.Repository;
using Settlement.Log.Criteria;
using Settlement.Log.Models;
using Settlement.Log.Services;

namespace Settlement.Log.UnitTests.Services;

public class LogDetailServiceTests
{
    private readonly RemarkService remarkService;
    private readonly IDynamicRepository repository;

    private readonly LogDetailService service;

    public LogDetailServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        remarkService = Substitute.For<RemarkService>();
        var xmlConvertService = new XmlConvertServiceImp();
        var mergeLogService = new MergeLogServiceImp();
        service = new LogDetailServiceImp(repository, remarkService, xmlConvertService, mergeLogService);
    }

    [Fact]
    public async Task GetLogDetailByMatchAndProduct_Always_ReturnsListLogDetailsModels()
    {
        // Arrange
        var fakeList = new List<LogDetailsModels>
            {
                new() {  Action = "Cal"}
            };

        repository.FetchAsync<LogDetailsModels>(Arg.Any<GetLogDetailByMatchAndProductCriteria>()).Returns(fakeList);
        remarkService.IsFastMarketAction(Arg.Any<int>()).Returns(true);

        // Act
        var result = await service.GetLogDetailByMatchAndProduct(1, string.Empty);

        // Assert
        remarkService.Received().RemarkValue(Arg.Any<string>());
        Assert.Single(result);
    }

    [Fact]
    public async Task GetLogDetailByMatchAndProduct_Always_ReturnsCorrectLog()
    {
        // Arrange
        var fakeList = new List<LogDetailsModels>
        {
            new() {  Action = "Cal" , Remark = "<distinct>" +
                                               "<r n=\"Is Leader\" v=\"0\"/>" +
                                               "<r n=\"Recalc\" v=\"0\"/>" +
                                               "<r n=\"confirmed/provider\" v=\"no\"/>" +
                                               "</distinct>" +
                                               "<root>" +
                                               "<r t=\"n\" n=\"SiteDB\" v=\"0\"/>" +
                                               "<r t=\"dmin\" n=\"StartTime\" v=\"2023-08-18 06:00:40\"/>" +
                                               "<r t=\"dmax\" n=\"EndTime\" v=\"2023-08-18 06:00:40\"/>" +
                                               "<r t=\"max\" n=\"duration\" v=\"10ms\"/>" +
                                               "<r t=\"s\" n=\"TC\" v=\"10\"/>" +
                                               "</root>" +
                                               "<root>" +
                                               "<r t=\"n\" n=\"SiteDB\" v=\"1\"/>" +
                                               "<r t=\"dmin\" n=\"StartTime\" v=\"2023-08-18 06:00:42\"/>" +
                                               "<r t=\"dmax\" n=\"EndTime\" v=\"2023-08-18 06:00:42\"/>" +
                                               "<r t=\"max\" n=\"duration\" v=\"20ms\"/>" +
                                               "<r t=\"s\" n=\"TC\" v=\"0\"/></root>"}
        };

        repository.FetchAsync<LogDetailsModels>(Arg.Any<GetLogDetailByMatchAndProductCriteria>()).Returns(fakeList);

        // Act
        var result = await service.GetLogDetailByMatchAndProduct(1, string.Empty);

        // Assert
        Assert.Equal("Is Leader: 0; Recalc: 0; confirmed/provider: no; StartTime: 2023-08-18 06:00:40; EndTime: 2023-08-18 06:00:42; duration: 20ms; TC: 10", result[0].Remark);
    }
}