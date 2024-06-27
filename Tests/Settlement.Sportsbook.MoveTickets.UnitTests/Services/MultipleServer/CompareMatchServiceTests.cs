using Settlement.Core.Models;

namespace Settlement.Sportsbook.MoveTickets.UnitTests.Services.MultipleServer;

using MoveTickets.Services.MultipleServer;

public class CompareMatchServiceTests
{
    private readonly CompareMatchService service = new CompareMatchServiceImp();

    [Theory]
    [InlineData(true, false, 1)]
    [InlineData(false, true, 1)]
    [InlineData(false, false, 2)]
    public void GetDifferentMatchSiteInfo_ExistMatchDifferentTicketInfo_ReturnSiteMatch(bool isExistRunningTicket,
        bool isExistMarkedTicket, int isCalculatingSingle)
    {
        var match = new Match
        {
            IsCalculatingSingle = 1
        };

        var siteMatch = new Match
        {
            IsExistRunningTicket = isExistRunningTicket,
            IsExistMarkedTicket = isExistMarkedTicket,
            IsCalculatingSingle = isCalculatingSingle
        };

        var result = service.GetDifferentMatchSiteInfo(match, [siteMatch]);

        Assert.NotNull(result);
    }

    [Theory]
    [InlineData(true, false, false)]
    [InlineData(false, true, false)]
    [InlineData(false, false, true)]
    [InlineData(false, false, false)]
    public void GetDifferentMatchSiteInfo_ExistMatchDifferentBetTypeInfo_ReturnSiteMatch(
        bool isExistEarlyBetTypes,
        bool isRunningEarlyBetTypes,
        bool isWaitingEarlyBetTypes)
    {
        var match = new Match
        {
            IsCalculatingSingle = 1
        };

        var siteMatch = new Match
        {
            IsExistEarlyBetTypes = isExistEarlyBetTypes,
            IsRunningEarlyBetTypes = isRunningEarlyBetTypes,
            IsWaitingEarlyBetTypes = isWaitingEarlyBetTypes
        };

        var result = service.GetDifferentMatchSiteInfo(match, [siteMatch]);

        Assert.NotNull(result);
    }
}