using Settlement.Core.Constants;
using Settlement.ThirdPartyProducts.Models;

namespace Settlement.ThirdPartyProducts.UnitTests.Services;

public class MergeMatchInfoTests
{
    private readonly MergeMatchInfo service = new MergeMatchInfoImp();

    [Theory]
    [InlineData(2, 0, 1)]
    [InlineData(0, 1, 1)]
    [InlineData(0, 0, 2)]
    public void AddSiteMatch_ExistMatchDifferentInfo_AddSiteMatchInfo(int totalTickets, int totalTicketRunning, int queueStatus)
    {
        var matches = new List<MatchDetailModel>
            {
                new()
                {
                    MatchId = 1,
                    SiteMatch = new List<SiteMatch>
                    {
                        new()
                        {
                            TotalTickets = 0,
                            TotalTicketsRunning = 0,
                            QueueStatus = 1,
                            MatchId = 1
                        },
                    }
                }
            };

        var siteMatches = new List<SiteMatch>
            {
                new()
                {
                    TotalTicketsRunning = totalTicketRunning,
                    TotalTickets = totalTickets,
                    QueueStatus = queueStatus,
                    MatchId = 1
                }
            };

        service.AddSiteMatch(matches, siteMatches);

        Assert.Equal(2, matches[0].SiteMatch.Count);
    }

    [Theory]
    [InlineData(1, 1, TicketStatus.Running)]
    [InlineData(1, 0, TicketStatus.Completed)]
    [InlineData(0, 0, TicketStatus.NoTicket)]
    public void ParlayStatus_Always_ReturnStatusCorrectly(int totalTicket, int totalTicketRunning, string expected)
    {
        var match = new MatchDetailModel()
        {
            SiteMatch = new List<SiteMatch>
                {
                    new()
                    {
                        TotalTicketsRunning = totalTicketRunning,
                        TotalTickets = totalTicket
                    }
                }
        };

        var result = service.ParlayStatus(match);

        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData(CalculateStatus.IsSuccess, 0, CalculateStatus.IsWaiting)]
    [InlineData(CalculateStatus.IsWaiting, 2, CalculateStatus.IsWaiting)]
    [InlineData(CalculateStatus.IsCalculating, 2, CalculateStatus.IsCalculating)]
    [InlineData(CalculateStatus.IsSuccess, 1, CalculateStatus.IsCalculating)]
    [InlineData(CalculateStatus.IsSuccess, 2, CalculateStatus.IsSuccess)]
    public void QueueStatus_Always_ReturnStatusCorrectly(int statusSite, int statusMain, int expected)
    {
        var match = new MatchDetailModel()
        {
            SiteMatch = new List<SiteMatch>
                {
                    new()
                    {
                        QueueStatus = statusSite
                    }
                }
        };

        var result = service.QueueStatus(match, statusMain);

        Assert.Equal(expected, result);
    }

    [Fact]
    public void MergeStatusTicket_ExistRunning_SetInfoRunning()
    {
        var listResources = new List<ResourceSelectionItemModel>
            {
                new()
                {
                    MarketId = 1,
                    IsRunning = false
                },
                new()
                {
                    MarketId = 2,
                    IsRunning = true
                }
            };

        var listResourcesSite = new List<ResourceSelectionItemModel>
            {
                new()
                {
                    MarketId = 1,
                    IsRunning = true
                }
            };

        service.MergeStatusTicket(listResources, listResourcesSite);

        Assert.True(listResources[0].IsRunning == true && listResources[1].IsRunning == true);
    }

    [Fact]
    public void MergeMatches_ExistSiteMatch_AddSiteMatch()
    {
        var listMatch = new List<MatchDetailModel>
            {
                new()
                {
                    MatchId = 1
                }
            };

        var listSiteMatch = new List<MatchDetailModel>
            {
                new()
                {
                    MatchId = 1,
                    QueueStatus = 2
                },
                new()
                {
                MatchId = 2
            }
            };

        var result = service.MergeMatches(listMatch, listSiteMatch);

        Assert.Equal(2, result.Count);
        Assert.Single(result[0].SiteMatch);
    }
}