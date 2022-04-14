using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using NSubstitute;
using Settlement.Core.Models;
using Settlement.FastMarkets.Criteria;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Requests;
using Settlement.FastMarkets.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Settlement.FastMarkets.UnitTests.Services
{
    public class FastMarketServiceTests
    {
        private readonly IFastMarketService service;
        private readonly IDynamicRepository repository;
        private readonly IFastMarketResultService fastMarketResultService;
        private readonly IFastMarketBetTypeService fastMarketBetTypeService;
        private readonly IEventCounterService eventCounterService;
        private readonly INapSession currentSession;
        private readonly IHttpContextAccessor accessor;

        public FastMarketServiceTests()
        {
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<FastMarketAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);

            repository = Substitute.For<IDynamicRepository>();
            fastMarketResultService = Substitute.For<IFastMarketResultService>();
            fastMarketBetTypeService = Substitute.For<IFastMarketBetTypeService>();
            eventCounterService = Substitute.For<IEventCounterService>();
            currentSession = Substitute.For<INapSession>();
            accessor = Substitute.For<IHttpContextAccessor>();
            var context = new DefaultHttpContext();
            context.Connection.RemoteIpAddress = new System.Net.IPAddress(1);
            accessor.HttpContext = context;
            service = new FastMarketServiceImp(repository,
                fastMarketResultService,
                fastMarketBetTypeService,
                eventCounterService,
                mapper,
                currentSession,
                accessor);
        }

        [Fact]
        public async Task Query_Always_ReturnsTrue()
        {
            // Arrange
            const int matchId = 100;
            var groupFastMasrketByBetType = new List<BetType>();
            var result = new IEnumerable<object>[5];

            result[0] = new List<EventCounter> { new EventCounter { Position = 1 } };
            result[1] = new List<string> { "a" };
            result[2] = new List<FastMarketResult> { new FastMarketResult { Position = 1 } };
            result[3] = new List<TicketCounts> { new TicketCounts { GroupId = 1 } };
            result[4] = new List<ResultDetail> { new ResultDetail { ResourceId = "1" } };

            repository
                .FetchMultipleAsync(Arg.Is<GetFastMarketMatchDetailCriteria>(x => x.MatchId == matchId), Arg.Any<Type[]>())
                .Returns(result);

            fastMarketBetTypeService.BetTypesList(Arg.Any<List<FastMarketResult>>(), Arg.Any<string>()).Returns(groupFastMasrketByBetType);

            // Act
            var viewModel = await service.Query(matchId);

            // Assert
            Assert.True(viewModel.TicketCount.GroupId == 1
                && viewModel.HandicapValue.Length == 1
                && viewModel.EventCounters.Count == 1
                && viewModel.BetTypes.Count == 0);
        }

        [Theory]
        [InlineData(0, "", true)]
        [InlineData(1000, "Error Message", false)]
        public async Task Calculate_Always_CallRepositoryExecuteWithResultsFromFastMarketResultService(int errorCode, string errorMessage, bool expected)
        {
            // Arrange
            var query = new SettleRequest();
            var results = "Results";
            fastMarketResultService.Result(query.BetTypes, "CAL").Returns(results);
            repository.ExecuteAsync(Arg.Do<PushFastMarketResultCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMessage;
            })).Returns(1);

            // Act
            var result = await service.Calculate(query);

            // Assert
            Assert.Equal(expected, result.IsSuccessful);
        }
    }
}