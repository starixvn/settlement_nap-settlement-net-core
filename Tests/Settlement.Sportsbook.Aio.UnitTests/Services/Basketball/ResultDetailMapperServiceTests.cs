using Newtonsoft.Json;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Basketball;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Basketball;

public class ResultDetailMapperServiceTests
{
    [Fact]
    public void Decorate_CallsCheckValue_OnQuarterListItems()
    {
        var service = new ResultDetailMapperServiceImp();

        var resultDetails = new List<ResultDetail>
        {
            new ResultDetail { ResourceId = "12" },
        };

        var expectedResultDetails = new List<ResultDetail>
        {
            new ResultDetail { ResourceId = "12", HomeValue = "", AwayValue = "" },
        };

        // Act
        service.Decorate(resultDetails);

        Assert.Equal(JsonConvert.SerializeObject(resultDetails), JsonConvert.SerializeObject(expectedResultDetails));
    }
}