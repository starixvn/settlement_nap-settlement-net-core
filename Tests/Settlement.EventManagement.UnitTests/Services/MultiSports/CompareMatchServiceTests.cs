using Settlement.EventManagement.Services.MultiSports;
using System.Collections.Generic;
using Xunit;
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
    [InlineData(true, false, false, false, null)]
    [InlineData(false, true, false, false, null)]
    [InlineData(false, false, true, false, null)]
    [InlineData(false, false, false, true, null)]
    [InlineData(false, false, false, false, 1)]
    public void GetDifferentMatchSiteInfo_ExistSiteMatchWithDiffInfoTicket_ReturnSiteMatch(bool isExistRunningTicket,
        bool isExistRunningTicketParlay, bool isExistMarkedTicket, bool isExistMarkedTicketParlay, int? isCalculatingSingle)
    {
        var siteMatch = new MultiSportMatch
        {
            MatchId = 1,
            IsExistRunningTicket = isExistRunningTicket,
            IsExistRunningTicketParlay = isExistRunningTicketParlay,
            IsExistMarkedTicket = isExistMarkedTicket,
            IsExistMarkedTicketParlay = isExistMarkedTicketParlay,
            IsCalculatingSingle = isCalculatingSingle
        };

        var match = new MultiSportMatch { MatchId = 1 };

        var actual = service.GetDifferentMatchSiteInfo(match, new List<MultiSportMatch> { siteMatch });

        Assert.NotNull(actual);
    }

    [Theory]
    [InlineData(true, false, false, false, false, false)]
    [InlineData(false, true, false, false, false, false)]
    [InlineData(false, false, true, false, false, false)]
    [InlineData(false, false, false, true, false, false)]
    [InlineData(false, false, false, false, true, false)]
    [InlineData(false, false, false, false, false, true)]
    public void GetDifferentMatchSiteInfo_ExistSiteMatchWithDiffInfoBetType_ReturnSiteMatch(bool isExistEarlyBetTypes,
        bool isRunningEarlyBetTypes, bool isWaitingEarlyBetTypes, bool isExistEarlyBettypesParlay, bool isRunningEarlyBettypesParlay, bool isWaitingEarlyBettypesParlay)
    {
        var siteMatch = new MultiSportMatch
        {
            MatchId = 1,
            IsExistEarlyBetTypes = isExistEarlyBetTypes,
            IsRunningEarlyBetTypes = isRunningEarlyBetTypes,
            IsWaitingEarlyBetTypes = isWaitingEarlyBetTypes,
            IsExistEarlyBettypesParlay = isExistEarlyBettypesParlay,
            IsRunningEarlyBettypesParlay = isRunningEarlyBettypesParlay,
            IsWaitingEarlyBettypesParlay = isWaitingEarlyBettypesParlay
        };

        var match = new MultiSportMatch { MatchId = 1 };

        var actual = service.GetDifferentMatchSiteInfo(match, new List<MultiSportMatch> { siteMatch });

        Assert.NotNull(actual);
    }

    [Fact]
    public void GetDifferentMatchSiteInfo_NotExistSiteMatchWithDiffInfo_ReturnNull()
    {
        var siteMatch = new MultiSportMatch { MatchId = 1, };
        var match = new MultiSportMatch { MatchId = 1 };

        var actual = service.GetDifferentMatchSiteInfo(match, new List<MultiSportMatch> { siteMatch });

        Assert.Null(actual);
    }

    [Fact]
    public void GetDifferentMatchSiteInfo_NotExistSiteMatchSameID_ReturnNull()
    {
        var siteMatch = new MultiSportMatch { MatchId = 2, };
        var match = new MultiSportMatch { MatchId = 1 };

        var actual = service.GetDifferentMatchSiteInfo(match, new List<MultiSportMatch> { siteMatch });

        Assert.Null(actual);
    }
}