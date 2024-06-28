using Newtonsoft.Json;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.ESport;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.ESport;

public class ResultDetailMapperServiceTests
{
    [Fact]
    public void Decorate_NotEarlyResource_Nothing()
    {
        var service = new ResultDetailMapperServiceImp();

        var resultDetails = new List<ResultDetail>
            {
                new() { ResourceId = "1" }
            };

        var expectedResultDetails = new List<ResultDetail>
            {
                new() { ResourceId = "1", HomeValue = null, AwayValue = null }
            };

        // Act
        service.Decorate(resultDetails);

        Assert.Equal(JsonConvert.SerializeObject(resultDetails), JsonConvert.SerializeObject(expectedResultDetails));
    }
}