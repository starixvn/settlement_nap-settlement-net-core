using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using NSubstitute;
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

    public FilterServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        balanceUpService = Substitute.For<IBalanceUpService>();
        var permissionService = Substitute.For<OutrightPermissionService>();
        var refDataService = Substitute.For<IRefDataService>();

        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<OutrightMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);

        var appSettingKey = new AppSettingsKey { SiteDbServer = new List<string> { "01", "02" } };
        var option = Options.Create(appSettingKey);

        service = new FilterServiceImp(repository, balanceUpService, mapper, permissionService, refDataService, option);
    }

    [Fact]
    public async Task GetLeague_Always_ReturnLeague()
    {
        repository.FetchAsync<League>(Arg.Any<GetOutrightLeaguesCriteria>()).Returns(new List<League>
        {
            new()
        });
        var actual = await service.GetLeague(new LeagueRequest());
        Assert.Single(actual);
    }

    [Fact]
    public async Task GetFilterView_Always_ReturnNotNull()
    {
        repository.Fetch<Sport>(Arg.Any<GetSportListCriteria>()).Returns(new List<Sport> { new() });
        repository.FetchAsync<League>(Arg.Any<GetOutrightLeaguesCriteria>()).Returns(new List<League> { new() });
        balanceUpService.GetBalanceUpDay().Returns(new BalanceUp { MoveBetsDay = DateTime.Today });

        var actual = await service.GetFilterView();

        Assert.NotNull(actual);
        Assert.Single(actual.Leagues);
        Assert.Single(actual.Sports);
        Assert.Equal(actual.ToDate, DateTime.Today);
        Assert.Equal(actual.MoveBetsDay, DateTime.Today.AddDays(1));
    }

    [Fact]
    public async Task Filter_Always_ReturnLeagueOfMatch()
    {
        var teamOne = new Team { LeagueId = 1 };
        var teamTwo = new Team { LeagueId = 1 };
        var teamThree = new Team { LeagueId = 2 };
        repository.FetchAsync<Team>(Arg.Any<GetOutrightDetailCriteria>()).Returns(new List<Team> { teamOne, teamTwo, teamThree });
        repository.FetchAsync<TeamTicketModel>(Arg.Any<GetTeamTicketCountCriteria>())
            .Returns(new List<TeamTicketModel>());

        var actual = await service.Filter(new FilterRequest());

        Assert.Equal(2, actual.LeagueMatch.Count());
    }

    [Fact]
    public async Task Filter_Always_ReturnLeagueOfMatchWithTicketCount()
    {
        var teamOne = new Team { LeagueId = 1, BetCount = 1, OrId = 1 };
        var teamTwo = new Team { LeagueId = 1, OrId = 2 };
        repository.FetchAsync<Team>(Arg.Any<GetOutrightDetailCriteria>()).Returns(new List<Team> { teamOne, teamTwo });
        repository.FetchAsync<TeamTicketModel>(Arg.Any<GetTeamTicketCountCriteria>())
            .Returns(new List<TeamTicketModel>
            {
                new TeamTicketModel
                {
                    OrId = 1,
                    TotalTicket = 2
                }
            });

        var actual = await service.Filter(new FilterRequest());

        Assert.Equal(1, actual.LeagueMatch.Count());
        Assert.Equal(actual.LeagueMatch.FirstOrDefault()!.Teams.FirstOrDefault()!.BetCount, 4);
    }
}