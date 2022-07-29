using Settlement.Core.Models;
using System.Collections.Generic;
using System.Linq;
using Settlement.Sportsbook.Soccer.Models;
using Match = Settlement.Core.Models.Match;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface IMergeDataService
    {
        public List<TicketCounts> MergeTicketCounts(List<SiteMatch> siteMatches);

        public Models.MatchDetail MergeSiteMatch(Models.MatchDetail matchDetail, List<TicketCounts> ticketCounts);

        public List<ChildMatchModel> MergeDataChildMatches(List<ChildMatchModel> childMatches, List<SiteMatch> siteMatches);

        public BetDaq MergeBetDaq(BetDaq baseBetDaq, List<BetDaq> nodeBetDaqs);

        public BetFair MergeBetFair(BetFair baseBetDaq, List<BetFair> nodeBetDaqs);
    }

    public class MergeDataServiceImp : IMergeDataService
    {
        private const int HalfTimeGroupId = 1;

        private const int FullTimeGroupId = 2;

        public Models.MatchDetail MergeSiteMatch(Models.MatchDetail matchDetail, List<TicketCounts> ticketCounts)
        {
            var siteMatches = matchDetail.SiteMatch;
            matchDetail.IsExistResultAndFirstTeamScore = siteMatches.Exists(match => match.IsExistResultAndFirstTeamScore);
            matchDetail.IsExistFgNg = siteMatches.Exists(match => match.IsExistFgNg);
            matchDetail.IsExistHtFgLg = siteMatches.Exists(match => match.IsExistHtFgLg);
            matchDetail.IsExistFgLg = siteMatches.Exists(match => match.IsExistFgLg);
            matchDetail.IsEnabledGoalRecordHt = siteMatches.Exists(match => match.IsEnabledGoalRecordHt);
            matchDetail.IsEnabledGoalRecordFt = siteMatches.Exists(match => match.IsEnabledGoalRecordFt);
            matchDetail.IsLive = siteMatches.Exists(match => match.IsLive);
            matchDetail.HtStatus = GetStatus(ticketCounts.First(item => item.GroupId == HalfTimeGroupId));
            matchDetail.FtStatus = GetStatus(ticketCounts.First(item => item.GroupId == FullTimeGroupId));

            return matchDetail;
        }

        public List<TicketCounts> MergeTicketCounts(List<SiteMatch> siteMatches)
        {
            foreach (var match in siteMatches.Skip(1))
            {
                SumTicket(siteMatches[0].TicketCounts, match);
            }

            return siteMatches[0].TicketCounts;
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
                var listSiteChildMatch = GetChildMachInfo(siteMatches, match.MatchId);
                match.IsExistMarkedTicket = match.IsExistMarkedTicket ||
                                            (listSiteChildMatch.Count > 0 && listSiteChildMatch.Exists(m => m.IsExistMarkedTicket));
                match.IsExistRunningTicket = match.IsExistRunningTicket
                                             || (listSiteChildMatch.Count > 0 && listSiteChildMatch.Exists(m => m.IsExistRunningTicket));
            });

            return childMatches;
        }

        private List<ChildMatchTicketInfos> GetChildMachInfo(List<SiteMatch> siteMatches, int matchId)
        {
            var listSiteChildMatch = new List<ChildMatchTicketInfos>();
            siteMatches.ForEach(item =>
            {
                if (item.SiteChildMatches.Count > 0)
                {
                    var childMatch = item.SiteChildMatches.Find(siteMatch => siteMatch.MatchId == matchId);
                    if (childMatch != null)
                    {
                        listSiteChildMatch.Add(childMatch);
                    }
                }
            });

            return listSiteChildMatch;
        }

        public BetDaq MergeBetDaq(BetDaq baseBetDaq, List<BetDaq> nodeBetDaqs)
        {
            baseBetDaq.IsExcludeBetDaq = nodeBetDaqs.Any(betDaq => betDaq.IsExcludeBetDaq) || baseBetDaq.IsExcludeBetDaq;
            baseBetDaq.IsMoveBetDaq = nodeBetDaqs.Any(betDaq => betDaq.IsExcludeBetDaq) || baseBetDaq.IsExcludeBetDaq;
            baseBetDaq.IsRefundRunningBetDaq = nodeBetDaqs.Any(betDaq => betDaq.IsExcludeBetDaq) || baseBetDaq.IsExcludeBetDaq;
            baseBetDaq.IsSettleAbandonedMatchBetDaq = nodeBetDaqs.Any(betDaq => betDaq.IsExcludeBetDaq) || baseBetDaq.IsExcludeBetDaq;

            return baseBetDaq;
        }

        public BetFair MergeBetFair(BetFair baseBetDaq, List<BetFair> nodeBetDaqs)
        {
            baseBetDaq.IsExcludeBetFair = nodeBetDaqs.Any(betDaq => betDaq.IsExcludeBetFair) || baseBetDaq.IsExcludeBetFair;
            baseBetDaq.IsMoveBetFair = nodeBetDaqs.Any(betDaq => betDaq.IsMoveBetFair) || baseBetDaq.IsMoveBetFair;
            baseBetDaq.IsRefundRunningBetFair = nodeBetDaqs.Any(betDaq => betDaq.IsRefundRunningBetFair) || baseBetDaq.IsRefundRunningBetFair;
            baseBetDaq.IsSettleAbandonedMatchBetFair = nodeBetDaqs.Any(betDaq => betDaq.IsSettleAbandonedMatchBetFair) || baseBetDaq.IsSettleAbandonedMatchBetFair;

            return baseBetDaq;
        }
    }
}