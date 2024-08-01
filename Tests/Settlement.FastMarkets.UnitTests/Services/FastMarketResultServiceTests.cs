using Fanex.Data.Repository;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Models.BetTypeModels;
using Settlement.FastMarkets.Services;

namespace Settlement.FastMarkets.UnitTests.Services;

public class FastMarketResultServiceTests
{
    private readonly IBetTypeElementService betTypeElementService;

    private readonly XmlConvertService xmlConvertService;

    private readonly IFastMarketResultService service;

    public FastMarketResultServiceTests()
    {
        betTypeElementService = Substitute.For<IBetTypeElementService>();
        xmlConvertService = Substitute.For<XmlConvertService>();
        var repository = Substitute.For<IDynamicRepository>();
        service = new FastMarketResultServiceImp(betTypeElementService, xmlConvertService, repository);
    }

    [Fact]
    public void Result_Always_ReturnXMLResult()
    {
        betTypeElementService.GetBetTypes(Arg.Any<List<BetType>>(), Arg.Any<string>()).Returns([]);
        xmlConvertService.Serialize(Arg.Any<BetTypesRoot>()).Returns("XML");

        var result = service.Result([], "");

        Assert.Equal("XML", result);
    }
}