using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.EventManagement.Criteria;
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Requests;
using Settlement.EventManagement.Services;

namespace Settlement.EventManagement.UnitTests.Services;

public class GetDateFilterServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly IRefDataService refDataService;

    private readonly GetDataFilterService service;

    public GetDateFilterServiceTests()
    {
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<EventManagementAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        repository = Substitute.For<IDynamicRepository>();
        refDataService = Substitute.For<IRefDataService>();
        service = new GetDataFilterServiceImp(mapper, repository, refDataService);
    }

    private static List<LeagueTypeModel> FakeLeagues => new()
    {
        new LeagueTypeModel { SportType = SportType.Diving},
        new LeagueTypeModel { SportType = SportType.Badminton},
        new LeagueTypeModel { SportType = SportType.Badminton},
        new LeagueTypeModel { SportType = SportType.OtherSports }
    };

    [Fact]
    public async Task GetSport_Always_ReturnSportSorted()
    {
        var popularSport = new Sport { SportType = SportType.Badminton };
        var otherSport = new Sport { SportType = SportType.OtherSports };
        var normalSport = new Sport { SportType = SportType.Diving };
        var listSport = new List<Sport> { otherSport, normalSport, popularSport };

        repository.FetchAsync<Sport>(Arg.Any<SportCriteria>()).Returns(listSport);
        refDataService.GetSportName(Arg.Any<int>()).Returns(string.Empty);

        var list = await service.GetSports(new SportRequest());

        Assert.Equal(SportType.Badminton, list[0].SportType);
        Assert.Equal(SportType.Diving, list[1].SportType);
        Assert.Equal(SportType.OtherSports, list.Last().SportType);
    }

    [Fact]
    public async Task GetLeagues_ExistOtherSportLeague_ReturnWithGroupOtherSportAtBottomList()
    {
        // Arrange
        var request = new LeagueRequest();
        repository.FetchAsync<LeagueTypeModel>(Arg.Any<LeagueCriteria>()).Returns(FakeLeagues);
        refDataService.GetLeagueName(Arg.Any<int>()).Returns("D", "C", "A", "B");
        refDataService.GetSportName(Arg.Any<int>()).Returns(string.Empty);

        // Act
        var leagues = await service.GetLeagues(request);

        // Assert

        Assert.Equal(SportType.Badminton, leagues.First().SportType);
        Assert.Equal("A", leagues.First().LeagueName);
        Assert.Equal("All  Leagues", leagues.First().Group);
        Assert.Equal(SportType.Badminton, leagues[1].SportType);
        Assert.Equal("C", leagues[1].LeagueName);
        Assert.Equal(SportType.Diving, leagues[2].SportType);
        Assert.Equal(SportType.OtherSports, leagues[3].SportType);
    }
}