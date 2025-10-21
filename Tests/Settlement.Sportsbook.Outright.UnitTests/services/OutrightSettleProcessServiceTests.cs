using AutoMapper;
using Fanex.Data.Repository;
using Fanex.Settlement.Converter.Services;
using Fanex.Settlement.ScaleOut.Models;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using NSubstitute;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Outright;
using Settlement.Outright.Criteria;
using Settlement.Outright.Models;
using Settlement.Outright.Requests;
using Settlement.Outright.Services;

namespace Settlement.Sportsbook.Outright.UnitTests.Services;

public class OutrightSettleProcessServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly ScaleOutSettleThirdPartyService scaleOutSettleService;

    private readonly OutrightSettleProcessService service;

    private readonly IRefDataService refDataService;

    private readonly XmlConvertService xmlConvertService;

    public OutrightSettleProcessServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        scaleOutSettleService = Substitute.For<ScaleOutSettleThirdPartyService>();
        refDataService = Substitute.For<IRefDataService>();
        xmlConvertService = Substitute.For<XmlConvertService>();

        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<OutrightMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);

        var appSettingsKey = new AppSettingsKey { SiteDbServer = ["01", "02"] };
        var options = Options.Create(appSettingsKey);

        service = new OutrightSettleProcessServiceImp(repository, options, scaleOutSettleService, mapper, refDataService, xmlConvertService);
    }

    [Theory]
    [InlineData(1, false)]
    [InlineData(0, true)]
    public async Task ValidateDeployment_Always_ReturnValueFromLibrary(int errorCode, bool expectedResult)
    {
        scaleOutSettleService.GetDeploymentInfo(Arg.Any<GetDeploymentInfoRequest>())
            .Returns(new ResultMessage { ErrorCode = errorCode });

        var actual = await service.ValidateRequest("", new List<InfoValidate>());

        Assert.Equal(expectedResult, actual.IsSuccessful);
    }

    [Fact]
    public async Task ValidateDeployment_ExistMatchNotInMoveBetDay_ReturnError()
    {
        var listInfo = new List<InfoValidate>
        {
            new("1", "2"),
            new("2", "2")
        };
        scaleOutSettleService.GetDeploymentInfo(Arg.Any<GetDeploymentInfoRequest>()).Returns(new ResultMessage());
        scaleOutSettleService.ValidateMoveBetDay(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<DateTime?>()).Returns(new ResultMessage
        {
            ErrorMessage = "MockTest",
            ErrorCode = 1
        });
        refDataService.GetTeamName(Arg.Any<string>()).Returns("1", "2");

        var actual = await service.ValidateRequest("", listInfo);

        Assert.Equal("MockTest<br/>Team: 1, 2", actual.ErrMsg);
    }

    [Fact]
    public async Task UpdateResultUndo_Always_ExecuteSPAndGetResponse()
    {
        await repository.ExecuteAsync(Arg.Do<UpdateResultOutrightCriteria>(c =>
        {
            c.ErrCode = 1;
            c.ErrMsg = "one";
        }));

        var actual = await service.UpdateResultUndo(new OutrightSettleCriteria());

        Assert.False(actual.IsSuccessful);
    }

    [Fact]
    public async Task UpdateResultCalculate_Always_ExecuteSPAndGetResponse()
    {
        await repository.ExecuteAsync(Arg.Do<UpdateResultOutrightCriteria>(c =>
        {
            c.ErrCode = 1;
            c.ErrMsg = "one";
        }));

        var actual = await service.UpdateResultUndo(new OutrightSettleCriteria());

        Assert.False(actual.IsSuccessful);
    }

    [Fact]
    public async Task OutrightSettleMultiSite_ExecuteSucceeded_ExecuteEnoughTime()
    {
        await repository.ExecuteAsync(Arg.Do<OutrightSettleCriteria>(c =>
        {
            c.ErrCode = 0;
            c.ErrMsg = "";
        }));

        var actual = await service.OutrightSettleMultiSite(new OutrightSettleCriteria());

        Assert.True(actual.IsSuccessful);
        await repository.Received(2).ExecuteAsync(Arg.Any<OutrightSettleCriteria>());
    }

    [Fact]
    public async Task OutrightSettleMultiSite_ExecuteFailed_ReturnMessage()
    {
        await repository.ExecuteAsync(Arg.Do<OutrightSettleCriteria>(c =>
        {
            c.ErrCode = 1;
            c.ErrMsg = "Test";
        }));

        var actual = await service.OutrightSettleMultiSite(new OutrightSettleCriteria());

        Assert.False(actual.IsSuccessful);
        Assert.Equal("<br/>- Test<br/>- Test", actual.ErrMsg);
    }

    [Fact]
    public void CreateScoreResources_ValidTeams_ReturnSerializedXml()
    {
        // Arrange
        var teams = new List<TeamExternalResult>
        {
            new() { OrId = 1, TeamId = 101, LeagueId = 201, ScreenShot = "screenshot1" },
            new() { OrId = 2, TeamId = 102, LeagueId = 201, ScreenShot = "screenshot2" }
        };

        var expectedXml = "<Resources><Resource OrId=\"1\" TeamId=\"101\" Result=\"screenshot1\" /><Resource OrId=\"2\" TeamId=\"102\" Result=\"screenshot2\" /></Resources>";
        xmlConvertService.Serialize(Arg.Any<Resources<ResourcesOutright>>()).Returns(expectedXml);

        // Act
        var actual = service.CreateScoreResources(teams);

        // Assert
        Assert.Equal(expectedXml, actual);
        xmlConvertService.Received(1).Serialize(Arg.Is<Resources<ResourcesOutright>>(r =>
            r.ResourceItems.Count == 2 &&
            r.ResourceItems[0].OrId == 1 &&
            r.ResourceItems[0].TeamId == 101 &&
            r.ResourceItems[0].Result == "screenshot1" &&
            r.ResourceItems[1].OrId == 2 &&
            r.ResourceItems[1].TeamId == 102 &&
            r.ResourceItems[1].Result == "screenshot2"));
    }

    [Fact]
    public void CreateScoreResources_EmptyTeams_ReturnEmptyResourcesXml()
    {
        // Arrange
        var teams = new List<TeamExternalResult>();
        var expectedXml = "<Resources></Resources>";
        xmlConvertService.Serialize(Arg.Any<Resources<ResourcesOutright>>()).Returns(expectedXml);

        // Act
        var actual = service.CreateScoreResources(teams);

        // Assert
        Assert.Equal(expectedXml, actual);
        xmlConvertService.Received(1).Serialize(Arg.Is<Resources<ResourcesOutright>>(r =>
            r.ResourceItems.Count == 0));
    }


    [Fact]
    public void CreateResourceXmlByTeamResult_ReturnsSerializedXml_AndBuildsCorrectResourceItems()
    {
        // Arrange
        var teams = new List<TeamResult>
            {
                new() { OrId = 11, TeamId = 101, Result = "Win" },
                new() { OrId = 12, TeamId = 102, Result = "Lose" }
            };


        var resources = teams.Select(t => new DeadheatResourcesOutright
        {
            OrId = t.OrId,
            TeamId = t.TeamId,
            Result = t.Result,
            IsDeadheat = t.IsDeadheat,
            ResultStatusId = t.ResultStatusId
        }).ToList();

        Resources<DeadheatResourcesOutright> captured = null;
        xmlConvertService.Serialize(Arg.Do<Resources<DeadheatResourcesOutright>>(r => captured = r))
            .Returns("<xmlMock/>");

        // Act
        var xml = service.CreateResourceXmlByTeamResult(resources);

        // Assert
        Assert.Equal("<xmlMock/>", xml);
        Assert.NotNull(captured);
        Assert.NotNull(captured.ResourceItems);
        Assert.Equal(2, captured.ResourceItems.Count);

        Assert.Collection(
            captured.ResourceItems,
            first =>
            {
                Assert.Equal(11, first.OrId);
                Assert.Equal(101, first.TeamId);
                Assert.Equal("Win", first.Result);
            },
            second =>
            {
                Assert.Equal(12, second.OrId);
                Assert.Equal(102, second.TeamId);
                Assert.Equal("Lose", second.Result);
            });
    }

    [Fact]
    public void CreateResourceXmlByTeamResult_EmptyList_StillSerializesEmptyResources()
    {
        // Arrange
        var teams = new List<TeamResult>();

        var resources = teams.Select(t => new DeadheatResourcesOutright
        {
            OrId = t.OrId,
            TeamId = t.TeamId,
            Result = t.Result,
            IsDeadheat = t.IsDeadheat,
            ResultStatusId = t.ResultStatusId
        }).ToList();


        Resources<DeadheatResourcesOutright> captured = null;
        xmlConvertService.Serialize(Arg.Do<Resources<DeadheatResourcesOutright>>(r => captured = r))
            .Returns("<empty/>");

        // Act
        var xml = service.CreateResourceXmlByTeamResult(resources);

        // Assert
        Assert.Equal("<empty/>", xml);
        Assert.NotNull(captured);
        Assert.NotNull(captured.ResourceItems);
        Assert.Empty(captured.ResourceItems);
    }

    [Fact]
    public void CreateResourceXmlByTeamResult_NullResultValues_Handled()
    {
        // Arrange
        var teams = new List<TeamResult>
            {
                new() { OrId = 21, TeamId = 501, Result = null }
            };

        var resources = teams.Select(t => new DeadheatResourcesOutright
        {
            OrId = t.OrId,
            TeamId = t.TeamId,
            Result = t.Result,
            IsDeadheat = t.IsDeadheat,
            ResultStatusId = t.ResultStatusId
        }).ToList();

        Resources<DeadheatResourcesOutright> captured = null;
        xmlConvertService.Serialize(Arg.Do<Resources<DeadheatResourcesOutright>>(r => captured = r))
            .Returns("<withNull/>");

        // Act
        var xml = service.CreateResourceXmlByTeamResult(resources);

        // Assert
        Assert.Equal("<withNull/>", xml);
        Assert.Single(captured.ResourceItems);
        var item = captured.ResourceItems[0];
        Assert.Equal(21, item.OrId);
        Assert.Equal(501, item.TeamId);
        Assert.Null(item.Result);
    }

    [Fact]
    public async Task CheckOutrightVoidTicket_AllZero_ReturnsFalse()
    {
        // Arrange
        repository.GetAsync<int>(Arg.Any<OutrightVoidTicketCriteria>())
                  .Returns(_ => Task.FromResult(0));

        var request = new CheckOutrightVoidTicketRequest { Orid = 99 };

        // Act
        var result = await service.CheckOutrightVoidTicket(request);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task CheckOutrightVoidTicket_ContainsOneOnly_ReturnsTrue()
    {
        // Arrange
        repository.GetAsync<int>(Arg.Any<OutrightVoidTicketCriteria>())
                  .Returns(call =>
                  {
                      var criteria = call.Arg<OutrightVoidTicketCriteria>();
                      return Task.FromResult(criteria.DbServer switch
                      {
                          "01" => 1,
                          "02" => 1,
                          _ => 1
                      });
                  });

        var request = new CheckOutrightVoidTicketRequest { Orid = 50 };

        // Act
        var result = await service.CheckOutrightVoidTicket(request);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task CheckOutrightVoidTicket_NoOneButNonZeroValues_ReturnsFalse()
    {
        // Arrange
        repository.GetAsync<int>(Arg.Any<OutrightVoidTicketCriteria>())
                  .Returns(call =>
                  {
                      var criteria = call.Arg<OutrightVoidTicketCriteria>();
                      return Task.FromResult(criteria.DbServer switch
                      {
                          "s1" => 2,
                          "s2" => 3,
                          _ => 0
                      });
                  });

        var request = new CheckOutrightVoidTicketRequest { Orid = 77 };

        // Act
        var result = await service.CheckOutrightVoidTicket(request);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task CheckOutrightVoidTicket_EmptyServerList_ReturnsFalse()
    {
        // Arrange
        var request = new CheckOutrightVoidTicketRequest { Orid = 10 };

        // Act
        var result = await service.CheckOutrightVoidTicket(request);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task CheckOutrightVoidTicket_MixedOneAndOtherNonZero_ReturnsTrue()
    {
        // Arrange
        repository.GetAsync<int>(Arg.Any<OutrightVoidTicketCriteria>())
                  .Returns(call =>
                  {
                      var criteria = call.Arg<OutrightVoidTicketCriteria>();
                      return Task.FromResult(criteria.DbServer switch
                      {
                          "01" => 1,
                          "02" => 5,
                          _ => 0
                      });
                  });

        var request = new CheckOutrightVoidTicketRequest { Orid = 123 };

        // Act
        var result = await service.CheckOutrightVoidTicket(request);

        // Assert
        Assert.True(result);
    }
}