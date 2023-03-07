using Settlement.Core.Models;
using Settlement.EventManagement.Services.Calculation;
using Match = Settlement.EventManagement.Models.Calculation.Match;

namespace Settlement.EventManagement.UnitTests.Services.Calculation;

public class MergeDataServiceTests
{
    private readonly CompareMatchService compareMatchService;

    private readonly MergeDataService service;

    public MergeDataServiceTests()
    {
        compareMatchService = Substitute.For<CompareMatchService>();
        service = new MergeDataServiceImp(compareMatchService);
    }

    [Fact]
    public void AddInfoMatch_Always_ReturnCorrectListMatch()
    {
        var baseMatches = new List<Match>
        {
            new () { MatchId = 123 }
        };

        var siteMatches = new List<Match>
        {
            new () { MatchId = 123 },
        };

        compareMatchService.GetDifferentMatchSiteInfo(Arg.Any<Match>(), Arg.Any<List<Match>>())
            .Returns(new SiteMatch { IsCalculatingSingle = 1 });

        service.AddSiteInfo(baseMatches, siteMatches);

        Assert.Equal(1, baseMatches[0].SiteMatch[0].IsCalculatingSingle);
    }
}