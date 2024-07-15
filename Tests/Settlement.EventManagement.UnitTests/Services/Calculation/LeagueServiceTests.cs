using AutoMapper;
using Fanex.Data.Repository;
using Settlement.Core.Services;
using Settlement.EventManagement.Criteria;
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Models.Calculation;
using Settlement.EventManagement.Requests;
using Settlement.EventManagement.Services.Calculation;

namespace Settlement.EventManagement.UnitTests.Services.Calculation;

public class LeagueServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly IRefDataService refDataService;

    private readonly LeagueService service;

    public LeagueServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        refDataService = Substitute.For<IRefDataService>();
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<EventManagementAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        service = new LeagueServiceImp(repository, mapper);
    }

    [Fact]
    public void Leagues_Always_ReturnFromRepository()
    {
        service.Leagues(new LeagueCalculationRequest());

        repository.Received().FetchAsync<LeagueTypeModel>(Arg.Any<LeagueCalculationCriteria>());
    }

    [Fact]
    public void Leagues_Always_ReturnListLeagueFromListMatch()
    {
        var matches = new List<Match>
        {
            new () {LeagueId = 1, RefDataService = refDataService},
            new () {LeagueId = 1, RefDataService = refDataService},
            new () {LeagueId = 2, RefDataService = refDataService},
            new () {LeagueId = 1, RefDataService = refDataService}
        };

        refDataService.GetLeagueName(Arg.Any<int>()).Returns(string.Empty);
        var result = service.Leagues(matches);

        Assert.Equal(3, result.Count);
    }
}