using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using NSubstitute;
using Settlement.Core.Models;
using Settlement.Outright.Criteria;
using Settlement.Outright.Models;
using Settlement.Outright.Services;

namespace Settlement.Sportsbook.Outright.UnitTests.services;

public class OutrightTicketServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly OutrightTicketService service;

    public OutrightTicketServiceTests()
    {
        var appSettingKey = new AppSettingsKey { SiteDbServer = ["01", "02"] };
        var option = Options.Create(appSettingKey);
        repository = Substitute.For<IDynamicRepository>();
        service = new OutrightTicketServiceImp(repository, option);
    }

    [Fact]
    public async Task GetTeamsTicketCount_Always_SumTicketCountOnAllSiteAsync()
    {
        var teamOne = new Team { OrId = 1 };
        var teamTwo = new Team { OrId = 2 };
        var teams = new List<Team> { teamOne, teamTwo };

        repository.FetchAsync<TeamTicketModel>(Arg.Any<GetTeamTicketCountCriteria>()).Returns(new List<TeamTicketModel>
        {
            new ()
            {
                OrId = 1,
                TotalCal = 1,
                TotalRunning = 2,
                TotalHide = 3,
                TotalTicket = 4
            },

            new ()
            {
                OrId = 2,
                TotalCal = 2,
                TotalRunning = 3,
                TotalHide = 4,
                TotalTicket = 5
            }
        });

        var results = (await service.GetTeamsTicketCount(teams)).ToList();

        Assert.True(results[0].TotalCal == 2 && results[0].TotalRunning == 4 && results[0].TotalHide == 6 && results[0].TotalTicket == 8);
        Assert.True(results[1].TotalCal == 4 && results[1].TotalRunning == 6 && results[1].TotalHide == 8 && results[1].TotalTicket == 10);
    }
}