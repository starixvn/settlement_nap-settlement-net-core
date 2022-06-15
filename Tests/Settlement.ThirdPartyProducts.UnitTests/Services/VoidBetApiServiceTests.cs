using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Kaden.XmlConverter;
using Microsoft.Extensions.Configuration;
using Moq;
using NSubstitute;
using Moq.Protected;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Setting.Models.Notification;
using Settlement.Setting.Services;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.ThirdPartyProducts.Services;
using Xunit;
using IConfiguration = Microsoft.Extensions.Configuration.IConfiguration;

namespace Settlement.ThirdPartyProducts.UnitTests.Services
{
    public class VoidBetApiServiceTests
    {
        private readonly IDynamicRepository repository;

        private readonly IConfiguration configuration;

        private readonly XmlConvertService xmlConvertService;

        private readonly SendMailService sendMailService;

        private readonly IRefDataService refDataService;

        private readonly IVoidBetApiService service;

        private readonly IHttpClientFactory httpClientFactory;

        private HttpClient httpClient;

        private readonly List<VoidBetInfo> listVoidBetInfos = new List<VoidBetInfo>
            { new VoidBetInfo { TransId = "123" } };

        private readonly VoidBetRequest request = new VoidBetRequest
        { MatchId = 123, VoidBetInfos = new List<VoidBetInfo> { new VoidBetInfo { TransId = "123" } }, Action = "UNDO" };

        public VoidBetApiServiceTests()
        {
            repository = Substitute.For<IDynamicRepository>();
            xmlConvertService = Substitute.For<XmlConvertService>();
            sendMailService = Substitute.For<SendMailService>();
            refDataService = Substitute.For<IRefDataService>();
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<ThirdPartyProductsAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);
            var inMemorySettings = new Dictionary<string, string> {
                {"ThirdPartyJackTimeUrl", "https://www.google.com/"}
            };
            httpClientFactory = Substitute.For<IHttpClientFactory>();
            configuration = new ConfigurationBuilder().AddInMemoryCollection(inMemorySettings).Build();
            service = new VoidBetApiServiceImp(repository, configuration, xmlConvertService, mapper, sendMailService,
                refDataService, httpClientFactory);
        }

        [Fact]
        public async Task GetTicketInfo_Always_CallSP()
        {
            await service.GetTicketInfo(new GetTicketInfo { SelectedResources = new List<string> { "Q1" }, Action = "REFUND" });

            await repository.Received().FetchAsync<VoidBetInfo>(Arg.Any<GetTicketInfoCriteria>());
        }

        [Fact]
        public async Task GetTicketInfo_AtionUndoAndStatusNotRefund_NotReturnThisItem()
        {
            var listTicket = new List<VoidBetInfo>
            {
                new VoidBetInfo
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
            httpClient = new HttpClient(mockHttpMessageHandler.Object);
            httpClientFactory.CreateClient().Returns(httpClient);

            await service.VoidBetApi(request);

            sendMailService.Received().SendMail(Arg.Any<NotificationModel>());
        }

        [Fact]
        public async Task VoidBetApi_3rdAPISuccess_NotSendMail()
        {
            var mockHttpMessageHandler = new Mock<HttpMessageHandler>();
            mockHttpMessageHandler.Protected()
                .Setup<Task<HttpResponseMessage>>("SendAsync", ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage { StatusCode = HttpStatusCode.OK });
            httpClient = new HttpClient(mockHttpMessageHandler.Object);
            httpClientFactory.CreateClient().Returns(httpClient);
            repository.FetchAsync<VoidBetInfo>(Arg.Any<GetTicketInfoCriteria>()).Returns(listVoidBetInfos);

            await service.VoidBetApi(request);

            sendMailService.DidNotReceive().SendMail(Arg.Any<NotificationModel>());
        }
    }
}