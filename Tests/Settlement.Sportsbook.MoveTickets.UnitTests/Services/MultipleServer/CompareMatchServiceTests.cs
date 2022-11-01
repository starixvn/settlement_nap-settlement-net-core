using Settlement.Core.Models;

namespace Settlement.Sportsbook.MoveTickets.UnitTests.Services.MultipleServer;

public class CompareMatchServiceTests
{
    private readonly CompareMatchService service;

    public CompareMatchServiceTests()
    {
        service = new CompareMatchServiceImp();
    }

    [Theory]
    [InlineData(true, false, false, false, 1)]
    [InlineData(false, true, false, false, 1)]
    [InlineData(false, false, true, false, 1)]
    [InlineData(false, false, false, true, 1)]
    [InlineData(false, false, false, false, 2)]
    public void GetDifferentMatchSiteInfo_ExistMatchDifferentTicketInfo_ReturnSiteMatch(bool isExistRunningTicket,
        bool isExistRunningTicketParlay,
        bool isExistMarkedTicket, bool isExistMarkedTicketParlay, int isCalculatingSingle)
    {
        var match = new Match
        {
            IsCalculatingSingle = 1
        };

        var siteMatch = new Match
        {
            IsExistRunningTicket = isExistRunningTicket,
            IsExistRunningTicketParlay = isExistRunningTicketParlay,
            IsExistMarkedTicket = isExistMarkedTicket,
            IsExistMarkedTicketParlay = isExistMarkedTicketParlay,
            IsCalculatingSingle = isCalculatingSingle
        };

        var result = service.GetDifferentMatchSiteInfo(match, new List<Match> { siteMatch });

        Assert.NotNull(result);
    }

    [Theory]
    [InlineData(true, false, false, false, false, false)]
    [InlineData(false, true, false, false, false, false)]
    [InlineData(false, false, true, false, false, false)]
    [InlineData(false, false, false, true, false, false)]
    [InlineData(false, false, false, false, true, false)]
    [InlineData(false, false, false, false, false, true)]
    public void GetDifferentMatchSiteInfo_ExistMatchDifferentBetTypeInfo_ReturnSiteMatch(bool isExistEarlyBetTypes,
        bool isRunningEarlyBetTypes,
        bool isWaitingEarlyBetTypes, bool isExistEarlyBettypesParlay, bool isRunningEarlyBettypesParlay, bool isWaitingEarlyBettypesParlay)
    {
        var match = new Match
        {
            IsCalculatingSingle = 1
        };

        var siteMatch = new Match
        {
            IsExistEarlyBetTypes = isExistEarlyBetTypes,
            IsRunningEarlyBetTypes = isRunningEarlyBetTypes,
            IsWaitingEarlyBetTypes = isWaitingEarlyBetTypes,
            IsExistEarlyBettypesParlay = isExistEarlyBettypesParlay,
            IsRunningEarlyBettypesParlay = isRunningEarlyBettypesParlay,
            IsWaitingEarlyBettypesParlay = isWaitingEarlyBettypesParlay
        };

        var result = service.GetDifferentMatchSiteInfo(match, new List<Match> { siteMatch });

        Assert.NotNull(result);
    }
}