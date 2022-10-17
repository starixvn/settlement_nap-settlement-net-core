using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using NSubstitute;
using Settlement.Core.Services;
using Settlement.Sportsbook.OtherSports.Services;

namespace Settlement.Sportsbook.OtherSports.UnitTests.Services
{
    public class SportsbookServiceTests
    {
        private readonly IDynamicRepository repository;

        private readonly MultipleServerService multipleServerService;

        private readonly SportsbookService service;

        public SportsbookServiceTests()
        {
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<OtherSportsAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);
            repository = Substitute.For<IDynamicRepository>();
            var refDataService = Substitute.For<IRefDataService>();
            var betStatusService = Substitute.For<IBetStatusService>();
            var multipleServerService = Substitute.For<MultipleServerService>();
            service = new SportsbookServiceImp(repository, refDataService, mapper, betStatusService, multipleServerService);
        }

        //[Fact]
        //public async Task GetMatch_Always_FetchAndReturnMatchDetailModel()
        //{
        //    var matchDetails = new List<MatchDetail> { new MatchDetail() };
        //    var fakeData = new ValueTuple<IEnumerable<MatchDetail>, IEnumerable<ResultDetail>, IEnumerable<TicketCounts>>(matchDetails, new List<ResultDetail>(), new List<TicketCounts>());
        //    repository.FetchMultipleAsync<MatchDetail, ResultDetail, TicketCounts>(Arg.Any<GetSportsbookMatchDetailCriteria>()).Returns(fakeData);

        //    var result = await service.GetMatch(new GetMatchRequest());

        //    Assert.IsType<MatchResultDetail>(result);
        //}
    }
}