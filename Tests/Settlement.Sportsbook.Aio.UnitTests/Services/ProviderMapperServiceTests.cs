using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Services;

namespace Settlement.Sportsbook.Aio.UnitTests.Services;

public class ProviderMapperServiceTests
{
    private readonly ProviderMapperService service = new();

    [Fact]
    public void Decorate_Always_FetchCorrectResultsAndGroupThem()
    {
        var fakeList = new List<ExternalResultDetailModel>
        {
            new(),
            new(),
            new()
        };
        var input = new Tuple<List<ExternalResultDetailModel>, List<ExternalResultModel>>(fakeList, []);

        service.Decorate(input);

        Assert.Single(input.Item2);
    }
}