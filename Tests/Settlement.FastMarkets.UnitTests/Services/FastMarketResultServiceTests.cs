using Fanex.Data.Repository;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Models.BetTypeModels;
using Settlement.FastMarkets.Services;

namespace Settlement.FastMarkets.UnitTests.Services;

public class FastMarketResultServiceTests
{
    private readonly IBetTypeElementService betTypeElementService;

    private readonly XmlConvertService xmlConvertService;

    private readonly IDynamicRepository repository;

    private readonly IFastMarketResultService service;

    public FastMarketResultServiceTests()
    {
        betTypeElementService = Substitute.For<IBetTypeElementService>();
        xmlConvertService = Substitute.For<XmlConvertService>();
        repository = Substitute.For<IDynamicRepository>();
        service = new FastMarketResultServiceImp(betTypeElementService, xmlConvertService, repository);
    }

    [Fact]
    public void Result_Always_ReturnXMLResult()
    {
        betTypeElementService.GetBetTypes(Arg.Any<List<BetType>>(), Arg.Any<string>()).Returns(new List<BetTypeElement>());
        xmlConvertService.Serialize(Arg.Any<BetTypesRoot>()).Returns("XML");

        var result = service.Result(new List<BetType>(), "");

        Assert.Equal("XML", result);
    }
}