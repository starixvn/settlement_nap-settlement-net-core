using Settlement.EventManagement.Services.MultiSports;
using MultiSportMatch = Settlement.EventManagement.Models.MultiSports.Match;

namespace Settlement.EventManagement.UnitTests.Services.MultiSports;

public class CompareMatchServiceTests
{
    private readonly CompareMatchService service;

    public CompareMatchServiceTests()
    {
        service = new CompareMatchServiceImp();
    }

    [Theory]
    [InlineData(true, false, null)]
    [InlineData(false, false, null)]
    [InlineData(false, true, null)]
    [InlineData(false, false, 1)]
    public void GetDifferentMatchSiteInfo_ExistSiteMatchWithDiffInfoTicket_ReturnSiteMatch(bool isExistRunningTicket, bool isExistMarkedTicket, int? isCalculatingSingle)
    {
        var siteMatch = new MultiSportMatch
        {
            MatchId = 1,
            IsExistRunningTicket = isExistRunningTicket,
            IsExistMarkedTicket = isExistMarkedTicket,
            IsCalculatingSingle = isCalculatingSingle
        };

        var match = new MultiSportMatch { MatchId = 1 };

        var actual = service.GetDifferentMatchSiteInfo(match, new List<MultiSportMatch> { siteMatch });

        Assert.NotNull(actual);
    }

    [Theory]
    [InlineData(true, false, false)]
    [InlineData(false, true, false)]
    [InlineData(false, false, true)]
    [InlineData(false, false, false)]
    public void GetDifferentMatchSiteInfo_ExistSiteMatchWithDiffInfoBetType_ReturnSiteMatch(bool isExistEarlyBetTypes,
        bool isRunningEarlyBetTypes, bool isWaitingEarlyBetTypes)
    {
        var siteMatch = new MultiSportMatch
        {
            MatchId = 1,
            IsExistEarlyBetTypes = isExistEarlyBetTypes,
            IsRunningEarlyBetTypes = isRunningEarlyBetTypes,
            IsWaitingEarlyBetTypes = isWaitingEarlyBetTypes,
        };

        var match = new MultiSportMatch { MatchId = 1 };

        var actual = service.GetDifferentMatchSiteInfo(match, new List<MultiSportMatch> { siteMatch });

        Assert.NotNull(actual);
    }

    [Fact]
    public void GetDifferentMatchSiteInfo_NotExistSiteMatchWithDiffInfo_ReturnNull()
    {
        var siteMatch = new MultiSportMatch { MatchId = 1 };
        var match = new MultiSportMatch { MatchId = 1 };

        var actual = service.GetDifferentMatchSiteInfo(match, new List<MultiSportMatch> { siteMatch });

        Assert.Null(actual);
    }

    [Fact]
    public void GetDifferentMatchSiteInfo_NotExistSiteMatchSameID_ReturnNull()
    {
        var siteMatch = new MultiSportMatch { MatchId = 2 };
        var match = new MultiSportMatch { MatchId = 1 };

        var actual = service.GetDifferentMatchSiteInfo(match, new List<MultiSportMatch> { siteMatch });

        Assert.Null(actual);
    }
}