using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using NSubstitute;
using Settlement.Core.Models;
using Settlement.FastMarkets.Services;

namespace Settlement.FastMarkets.UnitTests.Services
{
    public class FastMarketServiceTests
    {
        private readonly IFastMarketService service;
        private readonly IDynamicRepository repository;
        private readonly IFastMarketBetTypeService fastMarketBetTypeService;
        private readonly ScaleOutSettleService scaleOutSettleService;
        private readonly MultipleServerFetcherService multipleServerFetcherService;
        private readonly CreateQueryService createQueryService;

        public FastMarketServiceTests()
        {
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<FastMarketAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);

            repository = Substitute.For<IDynamicRepository>();
            scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
            fastMarketBetTypeService = Substitute.For<IFastMarketBetTypeService>();
            multipleServerFetcherService = Substitute.For<MultipleServerFetcherService>();
            createQueryService = Substitute.For<CreateQueryService>();
            var appSettingKey = new AppSettingsKey();
            var option = Options.Create(appSettingKey);
            service = new FastMarketServiceImp(repository,
                fastMarketBetTypeService,
                mapper,
                multipleServerFetcherService,
                option,
                scaleOutSettleService,
                createQueryService);
        }

        //[Fact]
        //public async Task Query_Always_ReturnsTrue()
        //{
        //    // Arrange
        //    const int matchId = 100;
        //    var groupFastMasrketByBetType = new List<BetType>();
        //    var result = new IEnumerable<object>[5];

        //    result[0] = new List<EventCounter> { new EventCounter { Position = 1 } };
        //    result[1] = new List<string> { "a" };
        //    result[2] = new List<FastMarketResult> { new FastMarketResult { Position = 1 } };
        //    result[3] = new List<TicketCounts> { new TicketCounts { GroupId = 1 } };
        //    result[4] = new List<ResultDetail> { new ResultDetail { ResourceId = "1" } };

        //    repository
        //        .FetchMultipleAsync(Arg.Is<GetFastMarketMatchDetailCriteria>(x => x.MatchId == matchId), Arg.Any<Type[]>())
        //        .Returns(result);

        //    fastMarketBetTypeService.BetTypesList(Arg.Any<List<FastMarketResult>>(), Arg.Any<string>()).Returns(groupFastMasrketByBetType);

        //    // Act
        //    var viewModel = await service.Query(matchId);

        //    // Assert
        //    Assert.True(viewModel.TicketCount.GroupId == 1
        //        && viewModel.HandicapValue.Length == 1
        //        && viewModel.EventCounters.Count == 1
        //        && viewModel.BetTypes.Count == 0);
        //}

        //[Theory]
        //[InlineData(0, "", true)]
        //[InlineData(1000, "Error Message", false)]
        //public async Task Calculate_Always_CallRepositoryExecuteWithResultsFromFastMarketResultService(int errorCode, string errorMessage, bool expected)
        //{
        //    // Arrange
        //    var query = new SettleRequest();
        //    const string results = "Results";
        //    fastMarketResultService.Result(query.BetTypes, "CAL").Returns(results);
        //    await repository.ExecuteAsync(Arg.Do<PushFastMarketResultCriteria>(x =>
        //    {
        //        x.ErrCode = errorCode;
        //        x.ErrMsg = errorMessage;
        //    }));

        //    // Act
        //    var result = await service.Calculate(query);

        //    // Assert
        //    Assert.Equal(expected, result.IsSuccessful);
        //}
    }
}