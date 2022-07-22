using Settlement.Core.Models;
using System.Collections.Generic;
using System.Linq;
using Settlement.Sportsbook.Soccer.Models;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface IMergeDataService
    {
        public List<TicketCounts> MergeTicketCounts(List<SiteMatch> matches);

        public SiteMatchDetail MergeSiteMatch(List<SiteMatchDetail> siteMatches, List<TicketCounts> ticketCounts);

        public List<ChildMatchModel> MergeDataChildMatches(List<ChildMatchModel> childMatches, List<SiteMatch> siteMatches);
    }

    public class MergeDataServiceImp : IMergeDataService
    {
        private const int HalfTimeGroupId = 1;

        private const int FullTimeGroupId = 2;

        public SiteMatchDetail MergeSiteMatch(List<SiteMatchDetail> siteMatches, List<TicketCounts> ticketCounts)
        {
            var siteMatch = new SiteMatchDetail
            {
                IsExistResultAndFirstTeamScore = siteMatches.Any(match => match.IsExistResultAndFirstTeamScore),
                IsExistFgNg = siteMatches.Any(match => match.IsExistFgNg),
                IsExistHtFgLg = siteMatches.Any(match => match.IsExistHtFgLg),
                IsExistFgLg = siteMatches.Any(match => match.IsExistFgLg),
                IsEnabledGoalRecordHt = siteMatches.Any(match => match.IsEnabledGoalRecordHt),
                IsEnabledGoalRecordFt = siteMatches.Any(match => match.IsEnabledGoalRecordFt),
                IsHtOnly = siteMatches.Any(match => match.IsHtOnly),
                HtStatus = GetStatus(ticketCounts.First(item => item.GroupId == HalfTimeGroupId)),
                FtStatus = GetStatus(ticketCounts.First(item => item.GroupId == FullTimeGroupId))
            };
            return siteMatch;
        }

        public List<TicketCounts> MergeTicketCounts(List<SiteMatch> matches)
        {
            var isBaseMatch = true;
            var baseTicketCount = new List<TicketCounts>();
            matches.ForEach(match =>
            {
                if (isBaseMatch)
                {
                    baseTicketCount = match.TicketCounts;
                    isBaseMatch = false;
                }
                else
                {
                    SumTicket(baseTicketCount, match);
                }
            });
            return baseTicketCount;
        }

        private void SumTicket(List<TicketCounts> baseTicketCounts, SiteMatch match)
        {
            baseTicketCounts.ForEach(item =>
            {
                var ticketCount = match.TicketCounts.FirstOrDefault(count => count.GroupId == item.GroupId);
                if (ticketCount != null)
                {
                    item.BetRunningCount += ticketCount.BetRunningCount;
                    item.BetMarkedCount += ticketCount.BetMarkedCount;
                    item.BetSettledCount += ticketCount.BetSettledCount;
                    item.BetWaitingCount += ticketCount.BetWaitingCount;
                    item.BetCount += ticketCount.BetCount;
                }
            });
        }

        private string GetStatus(TicketCounts ticketCount)
        {
            if (ticketCount.BetCount == 0)
            {
                return "No Ticket";
            }

            if (ticketCount.BetRunningCount > 0)
            {
                return "Running";
            }

            if (ticketCount.BetMarkedCount > 0)
            {
                return "Marked";
            }

            if (ticketCount.BetWaitingCount > 0 && ticketCount.BetWaitingCount == ticketCount.BetCount)
            {
                return "Waiting";
            }

            return "Calculated";
        }

        public List<ChildMatchModel> MergeDataChildMatches(List<ChildMatchModel> childMatches, List<SiteMatch> siteMatches)
        {
            childMatches.ForEach(match =>
            {
                var listSiteChildMatch = new List<ChildMatchTicketInfos>();
                siteMatches.ForEach(item => listSiteChildMatch.Add(item.SiteChildMatches.First(siteMatch => siteMatch.MatchId == match.MatchId)));
                match.IsExistMarkedTicket = match.IsExistMarkedTicket ||
                                            (listSiteChildMatch.Count > 0 && listSiteChildMatch.Any(m => m.IsExistMarkedTicket));
                match.IsExistRunningTicket = match.IsExistRunningTicket
                                             || (listSiteChildMatch.Count > 0 && listSiteChildMatch.Any(m => m.IsExistRunningTicket));
            });

            return childMatches;
        }
    }
}