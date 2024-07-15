using AutoMapper;
using Fanex.Data.Repository;
using NSubstitute;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Outright;
using Settlement.Outright.Criteria;
using Settlement.Outright.Models;
using Settlement.Outright.Requests;
using Settlement.Outright.Services;

namespace Settlement.Sportsbook.Outright.UnitTests.services;

public class FilterServiceTests
{
    private readonly IDynamicRepository repository;
    private readonly IBalanceUpService balanceUpService;
    private readonly FilterService service;
    private readonly IRefDataService refDataService;
    private readonly OutrightTicketService outrightTicketService;

    public FilterServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        balanceUpService = Substitute.For<IBalanceUpService>();
        refDataService = Substitute.For<IRefDataService>();
        outrightTicketService = Substitute.For<OutrightTicketService>();

        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<OutrightMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);

        service = new FilterServiceImp(repository, balanceUpService, mapper, refDataService, outrightTicketService);
    }

    private static List<League> FakeLeagues => new()
    {
        new League { SportType = SportType.Diving},
        new League { SportType = SportType.Badminton},
        new League { SportType = SportType.Soccer},
        new League { SportType = SportType.Soccer},
        new League { SportType = SportType.OtherSports }
    };

    [Fact]
    public async Task GetLeague_Always_ReturnLeague()
    {
        repository.FetchAsync<League>(Arg.Any<GetOutrightSportLeaguesCriteria>()).Returns(new List<League>
        {
            new()
        });
        var actual = await service.GetSportLeague(new SportLeagueRequest());
        Assert.Single(actual.Leagues);
    }

    [Fact]
    public void GetFilterView_Always_ReturnNotNull()
    {
        balanceUpService.GetBalanceUpDay().Returns(new BalanceUp { MoveBetsDay = DateTime.Today });

        var actual = service.GetFilterView();

        Assert.NotNull(actual);
        Assert.Equal(actual.ToDate, DateTime.Today);
        Assert.Equal(actual.MoveBetsDay, DateTime.Today.AddDays(1));
    }

    [Fact]
    public async Task Filter_Always_ReturnLeagueOfMatch()
    {
        var teamOne = new Team { LeagueId = 1, SportType = 1 };
        var teamTwo = new Team { LeagueId = 1, SportType = 1 };
        var teamThree = new Team { LeagueId = 2, SportType = 1 };
        repository.FetchMultipleAsync<DeadHeatSetting, Team>(Arg.Any<GetOutrightDetailCriteria>()).Returns((new List<DeadHeatSetting>(), new List<Team> { teamOne, teamTwo, teamThree }));
        repository.FetchAsync<TeamTicketModel>(Arg.Any<GetTeamTicketCountCriteria>())
            .Returns(new List<TeamTicketModel>());

        var actual = await service.Filter(new FilterRequest());

        Assert.Equal(2, actual.SportLeague.First().LeagueMatch.Count());
    }

    [Fact]
    public async Task Filter_Always_ReturnLeagueOfMatchWithTicketCount()
    {
        var teamOne = new Team { LeagueId = 1, BetCount = 4, OrId = 1 };
        var teamTwo = new Team { LeagueId = 1, OrId = 2 };
        var listTeam = new List<Team> { teamOne, teamTwo };
        repository.FetchMultipleAsync<DeadHeatSetting, Team>(Arg.Any<GetOutrightDetailCriteria>()).Returns((new List<DeadHeatSetting>(), listTeam));

        outrightTicketService.GetTeamsTicketCount(listTeam).Returns(new List<TeamTicketModel>
        {
            new TeamTicketModel
            {
                OrId = 1,
                TotalTicket = 4
            }
        });

        var actual = await service.Filter(new FilterRequest());

        Assert.Single(actual.SportLeague.First().LeagueMatch);
        Assert.Equal(4, actual.SportLeague.First().LeagueMatch.First().Teams[0]!.BetCount);
    }

    [Fact]
    public async Task Filter_Always_ReturnLeagueOfMatchWithDeadHeatSetting()
    {
        var teamOne = new Team { LeagueId = 1, SportType = 1 };
        var teamTwo = new Team { LeagueId = 1, SportType = 1 };
        var teamThree = new Team { LeagueId = 2, SportType = 1 };
        var deadHeadSetting = new DeadHeatSetting { DeadHeat = true, LeagueId = 1 };
        repository.FetchMultipleAsync<DeadHeatSetting, Team>(Arg.Any<GetOutrightDetailCriteria>()).Returns((new List<DeadHeatSetting> { deadHeadSetting }, new List<Team> { teamOne, teamTwo, teamThree }));
        repository.FetchAsync<TeamTicketModel>(Arg.Any<GetTeamTicketCountCriteria>())
            .Returns(new List<TeamTicketModel>());

        var actual = await service.Filter(new FilterRequest());

        Assert.True(actual.SportLeague.First().LeagueMatch.First().DeadHeat);
    }

    [Fact]
    public async Task GetSportLeague_Always_ReturnLeagueOrdered()
    {
        // Arrange
        var request = new SportLeagueRequest();
        repository.FetchAsync<League>(Arg.Any<GetOutrightSportLeaguesCriteria>()).Returns(FakeLeagues);
        refDataService.GetLeagueName(Arg.Any<int>()).Returns("D", "C", "A", "B", "F");
        refDataService.GetSportName(Arg.Any<int>()).Returns("Diving", "Badminton", "Soccer", "Soccer", "OtherSports");

        // Act
        var sportLeague = await service.GetSportLeague(request);
        var leagues = sportLeague.Leagues.ToList();

        // Assert

        Assert.Equal(SportType.Soccer, leagues[0].SportType);
        Assert.Equal("A", leagues[0].LeagueName);
        Assert.Equal("All Soccer Leagues", leagues[0].Group);
        Assert.Equal(SportType.Soccer, leagues[1].SportType);
        Assert.Equal("B", leagues[1].LeagueName);
        Assert.Equal(SportType.Badminton, leagues[2].SportType);
        Assert.Equal(SportType.Diving, leagues[3].SportType);
        Assert.Equal(SportType.OtherSports, leagues[4].SportType);
    }

    [Fact]
    public async Task GetSportLeague_Always_ReturnSportOrdered()
    {
        // Arrange
        var request = new SportLeagueRequest();
        repository.FetchAsync<League>(Arg.Any<GetOutrightSportLeaguesCriteria>()).Returns(FakeLeagues);
        refDataService.GetLeagueName(Arg.Any<int>()).Returns("D", "C", "A", "B", "F");
        refDataService.GetSportName(Arg.Any<int>()).Returns("Diving", "Badminton", "Soccer", "Soccer", "OtherSports");

        // Act
        var sportLeague = await service.GetSportLeague(request);
        var sports = sportLeague.Sports.ToList();

        // Assert

        Assert.Equal(SportType.Soccer, sports[0].SportType);
        Assert.Equal(SportGroup.PopularGroup, sports[0].Group);
        Assert.Equal(SportType.Badminton, sports[1].SportType);
        Assert.Equal(SportGroup.PopularGroup, sports[1].Group);
        Assert.Equal(SportType.Diving, sports[2].SportType);
        Assert.Equal(SportGroup.OtherGroup, sports[2].Group);
        Assert.Equal(SportType.OtherSports, sports[3].SportType);
        Assert.Equal(SportGroup.OtherGroup, sports[3].Group);
    }
}