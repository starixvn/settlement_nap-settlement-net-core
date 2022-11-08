using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.AspNetCore.Http;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;

namespace Settlement.ThirdPartyProducts.UnitTests.Services;

public class BetBuilderCalculateServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly XmlConvertService xmlConvertService;

    private readonly INapSession currentSession;

    private readonly IHttpContextAccessor accessor;

    private readonly ScaleOutSettleService scaleOutSettleService;

    private readonly BetBuilderCalculateService service;

    public BetBuilderCalculateServiceTests()
    {
        var accessor = Substitute.For<IHttpContextAccessor>();
        var context = new DefaultHttpContext
        {
            Connection =
                {
                    RemoteIpAddress = new System.Net.IPAddress(1)
                }
        };
        accessor.HttpContext = context;
        repository = Substitute.For<IDynamicRepository>();
        xmlConvertService = Substitute.For<XmlConvertService>();
        scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
        currentSession = Substitute.For<INapSession>();
        service = new BetBuilderCalculateServiceImp(repository, xmlConvertService, currentSession, accessor,
            scaleOutSettleService);
    }

    [Fact]
    public void UpdateMatchInfo_Always_CallLibrary()
    {
        service.UpdateMatchInfo(new CalculationCriteria(), "");

        scaleOutSettleService.Received().UpdateMatchInfo(Arg.Any<UpdateMatchInfoRequest>());
    }

    [Fact]
    public void CreateResources_Always_ReturnXmlResources()
    {
        xmlConvertService.Serialize(Arg.Any<Resources<ResourcesItemModel>>()).Returns("Test");

        var result = service.CreateResources(new List<ResourcesItemModel>());

        Assert.Equal("Test", result);
    }

    [Fact]
    public void CreateCriteria_Always_ReturnCriteria()
    {
        var result = service.CreateCriteria(1, "Test", "Test2");

        Assert.True(result.Action == "Test" && result.MatchId == 1 && result.SelectedSelection == "Test2");
    }

    [Fact]
    public async Task GetInfoMarket_Always_ReturnXmlResources()
    {
        repository.FetchAsync<string>(Arg.Any<GetMarketIdCriteria>()).Returns(new List<string> { "1", "2" });
        var xml = new XmlConvertServiceImp();
        var serviceTemp =
            new BetBuilderCalculateServiceImp(repository, xml, currentSession, accessor, scaleOutSettleService);

        var result = await serviceTemp.GetInfoMarket(new CalculationCriteria());

        Assert.Equal("<Resources><rsc m=\"1\" /><rsc m=\"2\" /></Resources>", result);
    }
}