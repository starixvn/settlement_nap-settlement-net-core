using AutoMapper;
using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Moq;
using Moq.Protected;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Setting.Models.Notification;
using Settlement.Setting.Services;
using Settlement.ThirdPartyProducts.Constants;
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

    private readonly List<VoidBetInfo> listVoidBetInfos = new() { new VoidBetInfo { TransId = "123" } };

    private readonly VoidBetRequest request = new() { MatchId = 123, VoidBetInfos = new List<VoidBetInfo> { new() { TransId = "123" } }, Action = "UNDO" };

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
            JackTimeResult = "https://www.google.com/"
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
    public async Task GetTicketInfo_ActionUndoAndStatusNotRefund_NotReturnThisItem()
    {
        var listTicket = new List<VoidBetInfo>
        {
            new()
            {
                StatusId = 102
            }
        };

        repository.FetchAsync<VoidBetInfo>(Arg.Any<GetTicketInfoCriteria>()).Returns(listTicket);

        var result = await service.GetTicketInfo(new GetTicketInfo { SelectedResources = new List<string> { "Q1" }, Action = "UNDO" });

        Assert.Empty(result);
    }

    [Fact]
    public async Task VoidBetApi_3rdAPIFailed_SendMail()
    {
        var mockHttpMessageHandler = new Mock<HttpMessageHandler>();
        mockHttpMessageHandler.Protected()
            .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage { StatusCode = HttpStatusCode.BadGateway });
        repository.FetchAsync<VoidBetInfo>(Arg.Any<GetTicketInfoCriteria>()).Returns(listVoidBetInfos);
        var httpClient = new HttpClient(mockHttpMessageHandler.Object);
        httpClientFactory.CreateClient().Returns(httpClient);

        await service.VoidBet(CashOutAction.VoidBet, request);

        sendMailService.Received().SendMail(Arg.Any<NotificationModel>());
    }

    [Fact]
    public async Task VoidBetApi_3rdAPISuccess_NotSendMail()
    {
        var mockHttpMessageHandler = new Mock<HttpMessageHandler>();
        mockHttpMessageHandler.Protected()
            .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage { StatusCode = HttpStatusCode.OK });
        var httpClient = new HttpClient(mockHttpMessageHandler.Object);
        httpClientFactory.CreateClient().Returns(httpClient);
        repository.FetchAsync<VoidBetInfo>(Arg.Any<GetTicketInfoCriteria>()).Returns(listVoidBetInfos);

        await service.VoidBet(CashOutAction.VoidBet, request);

        sendMailService.DidNotReceive().SendMail(Arg.Any<NotificationModel>());
    }
}