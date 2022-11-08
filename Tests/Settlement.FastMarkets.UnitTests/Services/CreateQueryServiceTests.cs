using AutoMapper;
using AutoMapper.Configuration;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Requests;
using Settlement.FastMarkets.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.FastMarkets.UnitTests.Services
{
    public class CreateQueryServiceTests
    {
        private readonly IFastMarketResultService fastMarketResultService;
        private readonly IEventCounterService eventCounterService;
        private readonly IMapper mapper;
        private readonly INapSession currentSession;
        private readonly IHttpContextAccessor accessor;

        private readonly CreateQueryService service;

        public CreateQueryServiceTests()
        {
            fastMarketResultService = Substitute.For<IFastMarketResultService>();
            eventCounterService = Substitute.For<IEventCounterService>();
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<FastMarketAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);
            currentSession = Substitute.For<INapSession>();
            accessor = Substitute.For<IHttpContextAccessor>();
            var context = new DefaultHttpContext();
            context.Connection.RemoteIpAddress = new System.Net.IPAddress(1);
            accessor.HttpContext = context;
            service = new CreateQueryServiceImp(fastMarketResultService, eventCounterService, mapper, currentSession,
                accessor);
        }

        [Fact]
        public async Task QuerySettle_Always_CallRelatedMethod()
        {
            fastMarketResultService.Result(Arg.Any<List<BetType>>(), Arg.Any<string>()).Returns("test");
            eventCounterService.Result(Arg.Any<SettleRequest>()).Returns("testEventCounter");
            fastMarketResultService.OldResults(Arg.Any<List<BetType>>(), Arg.Any<int>()).Returns("TestOldResult");

            var result = await service.QuerySettle(new SettleRequest());

            Assert.Equal("test", result.Results);
            Assert.Equal("testEventCounter", result.EventCounters);
            Assert.Equal("TestOldResult", result.OldResults);
        }
    }
}