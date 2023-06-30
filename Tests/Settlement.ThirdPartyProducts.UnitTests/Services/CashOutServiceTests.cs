using AutoMapper;
using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Moq;
using Moq.Protected;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Setting.Models.Notification;
using Settlement.Setting.Services;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.ThirdPartyProducts.Requests.CashOut;
using System.Net;

namespace Settlement.ThirdPartyProducts.UnitTests.Services;

public class CashOutServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly SendMailService sendMailService;

    private readonly IVoidBetApiService service;

    private readonly IHttpClientFactory httpClientFactory;

    public CashOutServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        var xmlConvertService = Substitute.For<XmlConvertService>();
        sendMailService = Substitute.For<SendMailService>();
        var refDataService = Substitute.For<IRefDataService>();
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<ThirdPartyProductsAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);

        httpClientFactory = Substitute.For<IHttpClientFactory>();
        var thirdPartySettingKeys = new ThirdPartySettingKeys
        {
            JackTimeResult = "https://www.google.com/",
            JackTimeTicket = "https://www.google.com/"
        };

        var appSetting = new AppSettingsKey { ThirdPartyUri = thirdPartySettingKeys, SiteDbServer = new List<string> { "01", "02" } };
        var option = Options.Create(appSetting);
        service = new VoidBetApiServiceImp(repository, xmlConvertService, mapper, sendMailService,
            refDataService, httpClientFactory, option);
    }

    [Fact]
    public async Task GetTicketInfo_Always_CallSP()
    {
        await service.GetTicketInfo(new GetTicketInfo { SelectedResources = new List<string> { "Q1" }, Action = "REFUND" });

        await repository.Received(2).FetchAsync<VoidBetInfo>(Arg.Any<GetTicketInfoCriteria>());
    }

    [Fact]
    public async Task VoidBetApi_VoidBetInfosIsEmptied_NotCallAnyMethod()
    {
        var request = new VoidBetRequest() { MatchId = 123, VoidBetInfos = new List<VoidBetInfo>() };
        repository.FetchAsync<VoidBetInfo>(Arg.Any<GetTicketInfoCriteria>()).Returns(new List<VoidBetInfo>());
        await service.VoidBet(request);

        httpClientFactory.DidNotReceive().CreateClient();
        sendMailService.DidNotReceive().SendMail(Arg.Any<NotificationModel>());
    }

    [Fact]
    public async Task VoidBetApi_HaveTwoActionNameOnListVoidBetInfo_CreateClientTwoTimes()
    {
        var request = new VoidBetRequest()
        {
            MatchId = 123,
            VoidBetInfos = new List<VoidBetInfo> {
                 new() { TransId = "123", Action = "Undo"},
                 new() { TransId = "1234", Action = "Void" }
            }
        };

        var mockHttpMessageHandler = new Mock<HttpMessageHandler>();
        mockHttpMessageHandler.Protected()
            .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage { StatusCode = HttpStatusCode.OK });
        var httpClient = new HttpClient(mockHttpMessageHandler.Object);
        httpClientFactory.CreateClient().Returns(httpClient);

        await service.VoidBet(request);
        httpClientFactory.Received(2).CreateClient();
        sendMailService.DidNotReceive().SendMail(Arg.Any<NotificationModel>());
    }

    [Fact]
    public async Task VoidBetApi_3rdAPIFailed_SendMail()
    {
        var request = new VoidBetRequest()
        {
            MatchId = 123,
            VoidBetInfos = new List<VoidBetInfo> {
                new() { TransId = "1234", Action = "Void" }
            }
        };
        var mockHttpMessageHandler = new Mock<HttpMessageHandler>();
        mockHttpMessageHandler.Protected()
            .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage { StatusCode = HttpStatusCode.BadGateway });
        var httpClient = new HttpClient(mockHttpMessageHandler.Object);
        httpClientFactory.CreateClient().Returns(httpClient);

        await service.VoidBet(request);
        httpClientFactory.Received(1).CreateClient();
        sendMailService.Received(1).SendMail(Arg.Any<NotificationModel>());
    }
}