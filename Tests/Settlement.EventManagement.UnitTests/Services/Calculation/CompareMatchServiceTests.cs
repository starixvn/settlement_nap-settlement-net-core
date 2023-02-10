using Settlement.EventManagement.Models.Calculation;
using Settlement.EventManagement.Services.Calculation;
using System.Collections.Generic;
using Xunit;

namespace Settlement.EventManagement.UnitTests.Services.Calculation;

public class CompareMatchServiceTests
{
    private readonly CompareMatchService service;

    public CompareMatchServiceTests()
    {
        service = new CompareMatchServiceImp();
    }

    [Theory]
    [InlineData(true, false, false, false, false, false, null)]
    [InlineData(false, true, false, false, false, false, null)]
    [InlineData(false, false, true, false, false, false, null)]
    [InlineData(false, false, false, true, false, false, null)]
    [InlineData(false, false, false, true, true, false, null)]
    [InlineData(false, false, false, true, false, true, null)]
    [InlineData(false, false, false, false, false, false, 1)]
    public void GetDifferentMatchSiteInfo_ExistSiteMatchWithDiffInfoTicket_ReturnSiteMatch(bool isExistRunningTicket,
        bool isExistRunningTicketParlay, bool isExistMarkedTicket, bool isExistMarkedTicketParlay, bool isExistFgLg, bool isExistHtFgLg, int? isCalculatingSingle)
    {
        var siteMatch = new Match
        {
            MatchId = 1,
            IsExistRunningTicket = isExistRunningTicket,
            IsExistRunningTicketParlay = isExistRunningTicketParlay,
            IsExistMarkedTicket = isExistMarkedTicket,
            IsExistMarkedTicketParlay = isExistMarkedTicketParlay,
            IsCalculatingSingle = isCalculatingSingle,
            IsExistFgLg = isExistFgLg,
            IsExistHtFgLg = isExistHtFgLg
        };

        var match = new Match { MatchId = 1 };

        var actual = service.GetDifferentMatchSiteInfo(match, new List<Match> { siteMatch });

        Assert.NotNull(actual);
    }

    [Theory]
    [InlineData(true, false, false, false, false, false, false)]
    [InlineData(false, true, false, false, false, false, false)]
    [InlineData(false, false, true, false, false, false, false)]
    [InlineData(false, false, false, true, false, false, false)]
    [InlineData(false, false, false, false, true, false, false)]
    [InlineData(false, false, false, false, false, true, false)]
    [InlineData(false, false, false, false, false, false, true)]
    public void GetDifferentMatchSiteInfo_ExistSiteMatchWithDiffInfoBetType_ReturnSiteMatch(bool isExistEarlyBetTypes,
        bool isRunningEarlyBetTypes, bool isWaitingEarlyBetTypes, bool isExistRunningTicketParlay, bool isExistFastMarket, bool isExistFastMarketResult, bool isRunningFastMarket)
    {
        var siteMatch = new Match
        {
            MatchId = 1,
            IsExistEarlyBetTypes = isExistEarlyBetTypes,
            IsRunningEarlyBetTypes = isRunningEarlyBetTypes,
            IsWaitingEarlyBetTypes = isWaitingEarlyBetTypes,
            IsExistRunningTicketParlay = isExistRunningTicketParlay,
            IsExistFastMarket = isExistFastMarket,
            IsExistFastMarketResult = isExistFastMarketResult,
            IsRunningFastMarket = isRunningFastMarket
        };

        var match = new Match { MatchId = 1 };

        var actual = service.GetDifferentMatchSiteInfo(match, new List<Match> { siteMatch });

        Assert.NotNull(actual);
    }

    [Fact]
    public void GetDifferentMatchSiteInfo_NotExistSiteMatchWithDiffInfo_ReturnNull()
    {
        var siteMatch = new Match { MatchId = 1, };
        var match = new Match { MatchId = 1 };

        var actual = service.GetDifferentMatchSiteInfo(match, new List<Match> { siteMatch });

        Assert.Null(actual);
    }

    [Fact]
    public void GetDifferentMatchSiteInfo_NotExistSiteMatchSameID_ReturnNull()
    {
        var siteMatch = new Match { MatchId = 2, };
        var match = new Match { MatchId = 1 };

        var actual = service.GetDifferentMatchSiteInfo(match, new List<Match> { siteMatch });

        Assert.Null(actual);
    }
}