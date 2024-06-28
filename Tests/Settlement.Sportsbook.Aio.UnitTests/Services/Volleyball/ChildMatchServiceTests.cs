using Settlement.Constants;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Volleyball;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Volleyball;

public class ChildMatchServiceTests
{
    private readonly ChildMatchService service = new();

    private readonly ResultDetail resultDetail = new()
    {
        ResourceId = ResourceType.Final
    };

    [Fact]
    public void Decorate_Always_ReturnChildMatchRunningAndNotConfirmedRefund()
    {
        var list = new List<ChildMatchModel>
        {
            new() {EventStatus = EventStatus.Completed},
            new() {EventStatus = EventStatus.Running ,ResultSetting = 2},
            new() {EventStatus = EventStatus.Running}
        };

        var listResult = new List<ResultDetail> { resultDetail };
        var tuple = Tuple.Create(list, listResult);

        service.Decorate(tuple);

        Assert.Single(list);
    }

    [Fact]
    public void Decorate_Always_ReturnChildMatchRelatedSet()
    {
        var list = new List<ChildMatchModel>
        {
            new() {EventStatus = EventStatus.Running, ChildMatchType = 12},
            new() {EventStatus = EventStatus.Running, ChildMatchType = 11},
            new() {EventStatus = EventStatus.Running, ChildMatchType = 16}
        };
        resultDetail.HomeValue = "0";
        resultDetail.AwayValue = "2";
        resultDetail.ResultStatusId = 5;
        var listResult = new List<ResultDetail> { resultDetail };

        var tuple = Tuple.Create(list, listResult);

        service.Decorate(tuple);

        Assert.Equal(2, list.Count);
    }
}