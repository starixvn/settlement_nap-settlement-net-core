using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Kaden.XmlConverter;
using Microsoft.AspNetCore.Http;
using NSubstitute;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Criterias;
using Settlement.Sportsbook.Core.Criterias;
using Settlement.Sportsbook.Cricket;
using Settlement.Sportsbook.Cricket.Criterias;
using Settlement.Sportsbook.Cricket.Models;
using Settlement.Sportsbook.Cricket.Requests;
using Settlement.Sportsbook.Cricket.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Settlement.Sportsbook.Aio.UnitTests.Services
{
    public class CricketServiceTests
    {
        private readonly IDynamicRepository repository;
        private readonly PermissionService permissionService;
        private readonly IRefDataService refDataService;
        private readonly XmlConvertService xmlConvertService;
        private readonly INapSession currentSession;
        private readonly ICricketBetTypeService cricketBetTypeService;
        private readonly IHttpContextAccessor accessor;
        private readonly ICricketService service;
        public CricketServiceTests()
        {
            repository = Substitute.For<IDynamicRepository>();
            permissionService = Substitute.For<PermissionService>(null, null, null, null);
            refDataService = Substitute.For<IRefDataService>();
            xmlConvertService = Substitute.For<XmlConvertService>();
            currentSession = Substitute.For<INapSession>();
            cricketBetTypeService = Substitute.For<ICricketBetTypeService>();
            accessor = Substitute.For<IHttpContextAccessor>();
            var context = new DefaultHttpContext();
            context.Connection.RemoteIpAddress = new System.Net.IPAddress(1);
            accessor.HttpContext = context;
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<SportsbookCricketAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);
            service = new CricketService(repository, permissionService, refDataService, xmlConvertService,
                currentSession, cricketBetTypeService, mapper, accessor);
        }
        [Fact]
        public async Task GetMatch_Always_ReturnCorrectMatch()
        {
            var request = new GetMatchRequest();
            repository.GetAsync<MatchDetail>(Arg.Any<GetMatchDetailCriteria>()).Returns(new MatchDetail { MatchId = 12345 });
            repository.FetchMultipleAsync<MatchResultDetail, TicketCounts>(Arg.Any<GetResultDetailCriteria>()).Returns((new List<MatchResultDetail>(), new List<TicketCounts>()));
            repository.GetAsync<HedgeMatchDetail>(Arg.Any<GetHedgeMatchCriteria>()).Returns(new HedgeMatchDetail());
            permissionService.Permission.Returns(new Permission());
            var expected = new AioMatch
            {
                MatchDetail = new MatchDetail { MatchId = 12345, RefDataService = refDataService },
                ResultDetails = new List<MatchResultDetail>(),
                TicketCounts = new TicketCounts(),
                Permission = new Permission(),
                HedgeMatchDetail = new HedgeMatchDetail()
            };

            var actual = await service.GetMatch(request);

            Assert.Equal(expected.MatchDetail.MatchId, actual.MatchDetail.MatchId);
        }

        [Fact]
        public async Task GetRecalResult_Always_ReturnResultDetailList()
        {
            var request = new GetRecalResultRequest();
            repository.FetchAsync<MatchResultDetail>(Arg.Any<GetRecalResultCriteria>()).Returns(new List<MatchResultDetail> { new MatchResultDetail() });

            var actual = await service.GetRecalResult(request);

            Assert.Single(actual);
        }

        [Theory]
        [InlineData(0, "", true, "100")]
        [InlineData(1, "Error", false, "")]
        public async Task Settle_Always_ReturnCorrectResult(int errorCode, string errorMsg, bool result, string childMatch)
        {
            repository.ExecuteAsync(Arg.Do<SettleCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMsg;
                x.ServiceCommand = "";
            })).Returns(1);

            var listChildMatch = new List<ChildMatch> { 
            
                new ChildMatch{matchId = 100}
            };
            repository.FetchAsync<ChildMatch>(Arg.Any<GetChildMatchCriteria>()).Returns(listChildMatch);
            var actual = await service.Settle(new SettleRequest());

            Assert.Equal(result, actual.IsSuccessful);
            Assert.Equal(childMatch, actual.ChildMatchIds);
        }

        [Theory]
        [InlineData(0, "", true)]
        [InlineData(1, "Error", false)]
        public async Task RefundParlay_Always_ReturnCorrectResult(int errorCode, string errorMsg, bool result)
        {
            repository.ExecuteAsync(Arg.Do<RefundParlayCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMsg;
            })).Returns(1);

            var actual = await service.RefundParlay(new RefundParlayRequest());

            Assert.Equal(result, actual.IsSuccessful);
        }

        [Theory]
        [InlineData(true)]
        [InlineData(false)]
        public async Task CheckMarkedTickets_Always_ReturnCorrectResult(bool result)
        {
            repository.ExecuteAsync(Arg.Do<CheckMarkedTicketsCriteria>(x =>
            {
                x.IsExistMarkedTicket = result;
            })).Returns(1);
            var request = new CheckMarkedTicketsRequest
            {
                MatchId = 12345,
                SelectedResources = new List<ResourceItem>
                {
                    new ResourceItem
                    {
                        ResourceId = "00"
                    }
                }
            };

            var actual = await service.CheckMarkedTickets(request);

            Assert.Equal(result, actual.IsExistMarkedTicket);
        }

        [Theory]
        [InlineData(true)]
        [InlineData(false)]
        public async Task CheckMarkedTicketsParlay_Always_ReturnCorrectResult(bool result)
        {
            repository.ExecuteAsync(Arg.Do<CheckMarkedTicketsParlayCriteria>(x =>
            {
                x.IsExistMarkedTicket = result;
            })).Returns(1);

            var actual = await service.CheckMarkedTicketsParlay(new CheckMarkedTicketsParlayRequest());

            Assert.Equal(result, actual.IsExistMarkedTicket);
        }
    }
}
