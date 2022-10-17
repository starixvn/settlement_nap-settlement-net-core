using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using NSubstitute;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Services;
using System.Collections.Generic;

namespace Settlement.ThirdPartyProducts.UnitTests.Services
{
    public class MatchServiceTests
    {
        private readonly MatchService service;

        private readonly IDynamicRepository repository;

        private readonly IRefDataService refDataService;

        private readonly BetBuilderCalculateService betBuilderCalculateService;

        private readonly BetBuilderMatchesService betBuilderMatchesService;

        private readonly BetBuilderService betBuilderService;

        public MatchServiceTests()
        {
            repository = Substitute.For<IDynamicRepository>();
            refDataService = Substitute.For<IRefDataService>();
            betBuilderCalculateService = Substitute.For<BetBuilderCalculateService>();
            betBuilderMatchesService = Substitute.For<BetBuilderMatchesService>();
            betBuilderService = Substitute.For<BetBuilderService>();
            repository.Fetch<MatchDetailModel>(Arg.Any<CriteriaBase>()).Returns(new List<MatchDetailModel>());
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<ThirdPartyProductsAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);
            var appSetting = new AppSettingsKey();
            var option = Options.Create(appSetting);
            service = new MatchServiceImp(refDataService, mapper, repository, betBuilderCalculateService, betBuilderMatchesService, betBuilderService, option);
        }

        private MatchDetailModel CreateMatch(int matchId, string eventStatus)
        {
            return new MatchDetailModel
            {
                MatchId = matchId,
                SportType = 2,
                EventStatus = eventStatus,
                RefDataService = refDataService
            };
        }

        //[Fact]
        //public async Task Search_Always_ReturnsExpectedOrderMatch()
        //{
        //    // Arrange
        //    var resultDetail = new ResultDetail
        //    {
        //        MatchId = 1,
        //        ResourceId = "01"
        //    };
        //    var fakeMatches = new List<MatchDetailModel> {
        //        CreateMatch(2, "Completed"),
        //        CreateMatch(1, "Completed"),
        //        CreateMatch(3, "Result Pending"),
        //        CreateMatch(4, "Closed"),
        //        CreateMatch(5, "Refund FT"),
        //        CreateMatch(6, "Refund HT"),
        //        CreateMatch(7, "Refund"),
        //        CreateMatch(8, "Running"),
        //        CreateMatch(9, "Postponed"),
        //        CreateMatch(10, "Internal"),
        //    };

        //    var fakeData = new ValueTuple<IEnumerable<MatchDetailModel>, IEnumerable<ResultDetail>>
        //    {
        //        Item1 = fakeMatches,
        //        Item2 = new List<ResultDetail> { resultDetail }
        //    };

        //    repository.FetchMultipleAsync<MatchDetailModel, ResultDetail>(Arg.Any<ICriteria>()).Returns(fakeData);

        //    // Act
        //    var sportBooks = await service.Search(new FilterRequest());
        //    var actualMatches = sportBooks[0].Leagues[0].Matches;

        //    Assert.True(actualMatches.Count == 10);
        //}

        //[Fact]
        //public async Task GetMatch_Always_ReturnsIsExistedMatch()
        //{
        //    // Arrange
        //    var resultDetail = new ResultDetail
        //    {
        //        MatchId = 1,
        //        ResourceId = "01"
        //    };
        //    var fakeMatches = new List<MatchDetailModel> {
        //        CreateMatch(1, "Completed")
        //    };

        //    var fakeData = new ValueTuple<IEnumerable<MatchDetailModel>, IEnumerable<ResultDetail>>
        //    {
        //        Item1 = fakeMatches,
        //        Item2 = new List<ResultDetail> { resultDetail }
        //    };

        //    repository.FetchMultipleAsync<MatchDetailModel, ResultDetail>(Arg.Any<ICriteria>()).Returns(fakeData);

        //    // Act
        //    var actualMatch = await service.GetMatch(new MatchInfoRequest());

        //    Assert.NotNull(actualMatch);
        //}

        //[Fact]
        //public void MatchesWaiting_ShortCacheNotNull_ReturnsMatchesFromCacheService()
        //{
        //    // Arrange
        //    var request = new MatchesWaitingRequest();
        //    var data = new List<MatchDetailModel>
        //    {
        //        new MatchDetailModel()
        //    };
        //    cacheService.Get<List<MatchDetailModel>>(Arg.Any<string>()).Returns(data);

        //    // Act
        //    var actualMatches = service.RefreshMatches(request);

        //    // Assert
        //    Assert.NotNull(actualMatches);
        //}

        //[Fact]
        //public async Task MatchesWaiting_ShortCacheIsNull_ReturnsNumberMatchesFromRepository()
        //{
        //    //Arrange
        //    var request = new MatchesWaitingRequest();
        //    var match = new MatchDetailModel
        //    {
        //        MatchId = 700000,
        //        SportType = 2
        //    };
        //    var resultDetail = new ResultDetail
        //    {
        //        MatchId = 700000,
        //        ResourceId = "01"
        //    };
        //    var fakeData = new ValueTuple<IEnumerable<MatchDetailModel>, IEnumerable<ResultDetail>>
        //    {
        //        Item1 = new List<MatchDetailModel> { match },
        //        Item2 = new List<ResultDetail> { resultDetail }
        //    };
        //    repository.FetchMultipleAsync<MatchDetailModel, ResultDetail>(Arg.Any<ICriteria>()).Returns(fakeData);

        //    //Act
        //    var actualMatches = await service.RefreshMatches(request);

        //    //Assert
        //    Assert.NotNull(actualMatches);
        //}
    }
}