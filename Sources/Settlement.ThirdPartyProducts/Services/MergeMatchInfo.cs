using Settlement.Core.Constants;
using Settlement.ThirdPartyProducts.Models;

namespace Settlement.ThirdPartyProducts.Services;

public interface MergeMatchInfo
{
    string ParlayStatus(MatchDetailModel match, int totalTicketsCentral = 0, int totalTicketRunningCentral = 0);

    int QueueStatus(MatchDetailModel match, int queueStatusCentral = 2);

    void AddSiteMatch(List<MatchDetailModel> matches, List<Models.SiteMatch> siteMatches);

    void MergeStatusTicket(List<ResourceSelectionItemModel> baseList, List<ResourceSelectionItemModel> siteList);

    List<MatchDetailModel> MergeMatches(List<MatchDetailModel> baseMatches, List<MatchDetailModel> siteMatches);
}

public class MergeMatchInfoImp : MergeMatchInfo
{
    public void AddSiteMatch(List<MatchDetailModel> matches, List<SiteMatch> siteMatches)
    {
        matches.ForEach(item =>
        {
            var siteMatch = siteMatches.FirstOrDefault(match => match.MatchId == item.MatchId);
            if (siteMatch != null && (item.SiteMatch.Count == 0 || IsChangedOnTicket(item.SiteMatch.First(), siteMatch)))
            {
                item.SiteMatch.Add(siteMatch);
            }
        });
    }

    public string ParlayStatus(MatchDetailModel match, int totalTicketsCentral = 0, int totalTicketRunningCentral = 0)
    {
        var totalTickets = totalTicketsCentral + match.SiteMatch.Select(x => x.TotalTickets).Sum();
        var totalTicketRunning = totalTicketRunningCentral + match.SiteMatch.Select(x => x.TotalTicketsRunning).Sum();
        if (totalTickets == 0)
        {
            return TicketStatus.NoTicket;
        }

        return totalTicketRunning > 0 ? TicketStatus.Running : TicketStatus.Completed;
    }

    public int QueueStatus(MatchDetailModel match, int queueStatusCentral = 2)
    {
        if (queueStatusCentral == CalculateStatus.IsWaiting || match.SiteMatch.FirstOrDefault(i => i.QueueStatus == CalculateStatus.IsWaiting) != null)
        {
            return CalculateStatus.IsWaiting;
        }

        return queueStatusCentral == CalculateStatus.IsCalculating
               || match.SiteMatch.FirstOrDefault(i => i.QueueStatus == CalculateStatus.IsCalculating) != null ? CalculateStatus.IsCalculating : CalculateStatus.IsSuccess;
    }

    public void MergeStatusTicket(List<ResourceSelectionItemModel> baseList, List<ResourceSelectionItemModel> siteList)
    {
        foreach (var item in baseList)
        {
            var siteItem = siteList.FirstOrDefault(i => i.MarketId == item.MarketId);
            if (siteItem != null)
            {
                item.IsRunning = item.IsRunning || siteItem.IsRunning;
            }
        }
    }

    public List<MatchDetailModel> MergeMatches(List<MatchDetailModel> baseMatches, List<MatchDetailModel> siteMatches)
    {
        var peekNewMatches = siteMatches.Except(baseMatches).ToList();
        baseMatches.AddRange(peekNewMatches);

        AddSiteInfo(baseMatches, siteMatches);

        return baseMatches;
    }

    private void AddSiteInfo(List<MatchDetailModel> baseMatches, List<MatchDetailModel> siteMatches)
    {
        foreach (var match in baseMatches)
        {
            var matchSiteInfo = GetDifferentMatchSiteInfo(match, siteMatches);
            if (matchSiteInfo != null)
            {
                match.SiteMatch.Add(matchSiteInfo);
            }
        }
    }

    private SiteMatch GetDifferentMatchSiteInfo(MatchDetailModel match, List<MatchDetailModel> siteMatches)
    {
        var siteMatch = siteMatches.FirstOrDefault(m => m.MatchId == match.MatchId);
        if (siteMatch != null && (match.TotalTickets != siteMatch.TotalTickets ||
                                  match.TotalTicketsRunning != siteMatch.TotalTicketsRunning
                                  || match.QueueStatus != siteMatch.QueueStatus))
        {
            return new SiteMatch
            {
                TotalTickets = siteMatch.TotalTickets,
                TotalTicketsRunning = siteMatch.TotalTicketsRunning,
                QueueStatus = siteMatch.QueueStatus,
            };
        }

        return null;
    }

    private static bool IsChangedOnTicket(SiteMatch match, SiteMatch siteMatch)
    {
        return match.TotalTickets != siteMatch.TotalTickets
            || match.TotalTicketsRunning != siteMatch.TotalTicketsRunning
            || match.QueueStatus != siteMatch.QueueStatus;
    }
}