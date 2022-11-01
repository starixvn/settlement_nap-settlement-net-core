using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Settlement.Core.Services;
using Settlement.Setting.Criteria.OutsideSourceManager;
using Settlement.Setting.Models.OutsideSourceManager;
using Settlement.Setting.Requests;
using Settlement.Setting.Requests.OutsideSourceManager;

namespace Settlement.Setting.UnitTests.Services
{
    public class OutsideSourceSettingServiceTests
    {
        private readonly OutsideSourceSettingService service;

        private readonly IDynamicRepository repository;

        private readonly IRefDataService refDataService;

        public OutsideSourceSettingServiceTests()
        {
            repository = Substitute.For<IDynamicRepository>();
            var xmlConvertService = Substitute.For<XmlConvertService>();
            refDataService = Substitute.For<IRefDataService>();

            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<SettingAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);

            service = new OutsideSourceSettingServiceImp(repository, xmlConvertService, refDataService, mapper);
        }

        [Fact]
        public async Task GetOutsideSource_Always_FetchAndGroupOutsideSources()
        {
            var fakeSources = new List<QueryResultModel>
            {
                new QueryResultModel { SourceId = 1, GameType = 1, SportType = 5 },
                new QueryResultModel { SourceId = 1, GameType = 2, SportType = 5 },
                new QueryResultModel { SourceId = 1, GameType = 3, SportType = 5 },
                new QueryResultModel { SourceId = 2, GameType = 1, SportType = 5 },
                new QueryResultModel { SourceId = 2, GameType = 2, SportType = 5 },
                new QueryResultModel { SourceId = 2, GameType = 3, SportType = 5 },
            };

            const string sportName = "e-sports";

            var request = new GetOutsideSourceRequest();
            repository.FetchAsync<QueryResultModel>(Arg.Any<GetOutsideSourceCriteria>()).Returns(fakeSources);
            refDataService.GetSportName(Arg.Any<int>()).Returns(sportName);

            var result = await service.GetOutsideSource(request);

            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task GetLeagueOutsideSource_Always_ReturnTwoOutsideSourceLists()
        {
            var fakeData = new ValueTuple<IEnumerable<LeagueOutSideSourceResourceItem>, IEnumerable<LeagueOutSideSourceResourceItem>>();
            var outsideSources = new List<LeagueOutSideSourceResourceItem>
            {
                new LeagueOutSideSourceResourceItem { PGid = 1, SourceName = "fake1" },
                new LeagueOutSideSourceResourceItem { PGid = 2, SourceName = "fake2" },
                new LeagueOutSideSourceResourceItem { PGid = 3, SourceName = "fake3" },
                new LeagueOutSideSourceResourceItem { PGid = 4, SourceName = "fake4" },
            };
            var sortedOutsideSources = new List<LeagueOutSideSourceResourceItem>
            {
                new LeagueOutSideSourceResourceItem {PGid = 1, SourceName = "fake1", OrderNo = 1},
                new LeagueOutSideSourceResourceItem {PGid = 2, SourceName = "fake2", OrderNo = 2},
                new LeagueOutSideSourceResourceItem {PGid = 4, SourceName = "fake4", OrderNo = 3},
            };
            fakeData.Item1 = outsideSources;
            fakeData.Item2 = sortedOutsideSources;

            repository.FetchMultipleAsync<LeagueOutSideSourceResourceItem, LeagueOutSideSourceResourceItem>(Arg.Any<GetLeagueOutsideSourceCriteria>()).Returns(fakeData);

            var result = await service.GetLeagueOutsideSource(new GetLeagueOutsideSourceRequest());

            Assert.True(result.OutsideSourceList.Count > 0);
            Assert.True(result.OutsideSourceSort.Count > 0);
        }

        [Theory]
        [InlineData(0, "", true)]
        [InlineData(1000, "Error Message", false)]
        public async Task AddOutsideSource_Always_ReturnsResultFromRepositoryExecute(int errorCode, string errorMessage, bool expected)
        {
            // Arrange
            await repository.ExecuteAsync(Arg.Do<AddOutsideSourceCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMessage;
            }));

            // Act
            var actualModel = await service.AddOutsideSource(new AddOutsideSourceRequest());

            // Assert
            Assert.Equal(expected, actualModel.IsSuccessful);
        }

        [Theory]
        [InlineData(0, "", true)]
        [InlineData(1000, "Error Message", false)]
        public async Task UpdateOutsideSource_Always_ReturnsResultFromRepositoryExecute(int errorCode, string errorMessage, bool expected)
        {
            // Arrange
            await repository.ExecuteAsync(Arg.Do<UpdateOutsideSourceCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMessage;
            }));

            // Act
            var actualModel = await service.UpdateOutsideSource(new UpdateOutsideSourceRequest());

            // Assert
            Assert.Equal(expected, actualModel.IsSuccessful);
        }

        [Theory]
        [InlineData(0, "", true)]
        [InlineData(1000, "Error Message", false)]
        public async Task UpdateLeagueOutsideSource_Always_ReturnsResultFromRepositoryExecute(int errorCode, string errorMessage, bool expected)
        {
            // Arrange
            await repository.ExecuteAsync(Arg.Do<UpdateLeagueOutsideSourceCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMessage;
            }));

            // Act
            var actualModel = await service.UpdateLeagueOutsideSource(new UpdateLeagueOutsideSourceRequest());

            // Assert
            Assert.Equal(expected, actualModel.IsSuccessful);
        }
    }
}