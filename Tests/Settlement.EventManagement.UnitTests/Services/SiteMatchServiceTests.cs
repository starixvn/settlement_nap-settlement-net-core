using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.EventManagement.Models;
using Settlement.EventManagement.Services;
using Match = Settlement.EventManagement.Models.MultiSports.Match;

namespace Settlement.EventManagement.UnitTests.Services
{
    public class SiteMatchServiceTests
    {
        private readonly SiteMatchService service;

        public SiteMatchServiceTests()
        {
            service = new SiteMatchServiceImp();
        }

        [Theory]
        [InlineData(true, false, true)]
        [InlineData(false, true, true)]
        [InlineData(false, false, false)]
        public void IsExistMarkedTicketsSingle_Always_ReturnCorrect(bool main, bool site, bool expected)
        {
            var match = new BaseMatch
            {
                IsExistMarkedTicket = main,
                SiteMatch = new List<SiteMatch>
                {
                    new () { IsExistMarkedTicket = site }
                }
            };

            var result = service.IsExistMarkedTicketsSingle(match);

            Assert.Equal(expected, result);
        }

        [Theory]
        [InlineData(true, false, true)]
        [InlineData(false, true, true)]
        [InlineData(false, false, false)]
        public void IsExistMarkedTicketParlay_Always_ReturnCorrect(bool main, bool site, bool expected)
        {
            var match = new BaseMatch
            {
                IsExistMarkedTicketParlay = main,
                SiteMatch = new List<SiteMatch>
                {
                    new () { IsExistMarkedTicketParlay = site }
                }
            };

            var result = service.IsExistMarkedTicketParlay(match);

            Assert.Equal(expected, result);
        }

        [Theory]
        [InlineData(true, false, true)]
        [InlineData(false, true, true)]
        [InlineData(false, false, false)]
        public void IsExistRunningTickets_Always_ReturnCorrect(bool main, bool site, bool expected)
        {
            var match = new BaseMatch
            {
                IsExistRunningTicket = main,
                SiteMatch = new List<SiteMatch>
                {
                    new () { IsExistRunningTicket = site }
                }
            };

            var result = service.IsExistRunningTickets(match);

            Assert.Equal(expected, result);
        }

        [Theory]
        [InlineData(true, false, true)]
        [InlineData(false, true, true)]
        [InlineData(false, false, false)]
        public void IsExistRunningTicketParlay_Always_ReturnCorrect(bool main, bool site, bool expected)
        {
            var match = new BaseMatch
            {
                IsExistRunningTicketParlay = main,
                SiteMatch = new List<SiteMatch>
                {
                    new () { IsExistRunningTicketParlay = site }
                }
            };

            var result = service.IsExistRunningTicketParlay(match);

            Assert.Equal(expected, result);
        }

        [Theory]
        [InlineData(true, false, true)]
        [InlineData(false, true, true)]
        [InlineData(false, false, false)]
        public void IsExistsConfirmedEarly_Always_ReturnCorrect(bool main, bool site, bool expected)
        {
            var match = new Match
            {
                IsExistsConfirmedEarly = main,
                SiteMatch = new List<SiteMatch>
                {
                    new () { IsExistsConfirmedEarly = site }
                }
            };

            var result = service.IsExistsConfirmedEarly(match);

            Assert.Equal(expected, result);
        }

        [Theory]
        [InlineData(true, false, false, false, true)]
        [InlineData(false, true, false, false, true)]
        [InlineData(false, false, true, false, true)]
        [InlineData(false, false, false, true, true)]
        [InlineData(false, false, false, false, false)]
        public void IsExistMarkedTickets_Always_ReturnCorrect(bool main, bool site, bool mainParlay, bool siteParlay, bool expected)
        {
            var match = new Match
            {
                IsExistMarkedTicket = main,
                IsExistMarkedTicketParlay = mainParlay,
                SiteMatch = new List<SiteMatch>
                {
                    new () { IsExistMarkedTicket = site, IsExistMarkedTicketParlay = siteParlay}
                }
            };

            var result = service.IsExistMarkedTickets(match);

            Assert.Equal(expected, result);
        }

        [Theory]
        [InlineData(CalculateStatus.IsWaiting, null, CalculateStatus.IsWaiting)]
        [InlineData(null, CalculateStatus.IsWaiting, CalculateStatus.IsWaiting)]
        [InlineData(CalculateStatus.IsCalculating, null, CalculateStatus.IsCalculating)]
        [InlineData(null, CalculateStatus.IsCalculating, CalculateStatus.IsCalculating)]
        [InlineData(CalculateStatus.IsFailed, null, CalculateStatus.IsFailed)]
        [InlineData(null, CalculateStatus.IsFailed, CalculateStatus.IsFailed)]
        [InlineData(CalculateStatus.IsSuccess, CalculateStatus.IsSuccess, CalculateStatus.IsSuccess)]
        [InlineData(null, CalculateStatus.IsSuccess, null)]
        [InlineData(CalculateStatus.IsSuccess, null, null)]
        [InlineData(CalculateStatus.IsWaiting, CalculateStatus.IsCalculating, CalculateStatus.IsWaiting)]
        [InlineData(CalculateStatus.IsWaiting, CalculateStatus.IsFailed, CalculateStatus.IsWaiting)]
        [InlineData(CalculateStatus.IsWaiting, CalculateStatus.IsSuccess, CalculateStatus.IsWaiting)]
        [InlineData(CalculateStatus.IsCalculating, CalculateStatus.IsFailed, CalculateStatus.IsCalculating)]
        [InlineData(CalculateStatus.IsCalculating, CalculateStatus.IsSuccess, CalculateStatus.IsCalculating)]
        [InlineData(CalculateStatus.IsFailed, CalculateStatus.IsSuccess, CalculateStatus.IsFailed)]
        [InlineData(null, null, null)]
        public void IsCalculating_Always_ReturnCorrect(int? mainStatus, int? siteStatus, int? expected)
        {
            var match = new Match
            {
                IsCalculatingSingle = mainStatus,
                SiteMatch = new List<SiteMatch>
                {
                    new() { IsCalculatingSingle = siteStatus }
                }
            };

            var result = service.IsCalculating(match.IsCalculatingSingle, match.SiteMatch.Select(i => i.IsCalculatingSingle).ToList());

            Assert.Equal(expected, result);
        }

        [Theory]
        [InlineData(true, false, Background.WhiteBlinking)]
        [InlineData(true, true, Background.PinkBlinking)]
        [InlineData(false, true, Background.Pink)]
        [InlineData(false, false, "")]
        public void GetBackgroundCompletedStatus_Always_ReturnCorrect(bool markedTicket, bool runningTicket, string expected)
        {
            var match = new Match
            {
                IsExistMarkedTicket = markedTicket,
                IsExistRunningTicket = runningTicket
            };

            var result = service.GetBackgroundCompletedStatus(match);

            Assert.Equal(expected, result);
        }

        [Theory]
        [InlineData(true, false, false, false, false, false, TicketStatus.Completed)]
        [InlineData(false, true, false, false, false, false, TicketStatus.Completed)]
        [InlineData(false, true, true, false, false, false, TicketStatus.Running)]
        [InlineData(true, false, false, true, false, false, TicketStatus.Running)]
        [InlineData(false, false, false, false, true, false, TicketStatus.NoTicket)]
        [InlineData(false, false, false, false, false, true, TicketStatus.NoTicket)]
        [InlineData(false, false, false, false, false, false, TicketStatus.Normal)]
        public void FastMarketStatus_Always_ReturnCorrect(bool mainIsExistFastMarket, bool siteIsExistFastMarket,
            bool mainIsRunningFastMarket, bool siteIsRunningFastMarket,
            bool mainIsExistFastMarketResult, bool siteIsExistFastMarketResult, string expected)
        {
            var match = new Models.Calculation.Match
            {
                IsExistFastMarket = mainIsExistFastMarket,
                IsRunningFastMarket = mainIsRunningFastMarket,
                IsExistFastMarketResult = mainIsExistFastMarketResult,
                SiteMatch = new List<SiteMatch>
                {
                    new()
                    {
                        IsExistFastMarket = siteIsExistFastMarket,
                        IsRunningFastMarket = siteIsRunningFastMarket,
                        IsExistFastMarketResult = siteIsExistFastMarketResult,
                    }
                }
            };

            var result = service.FastMarketStatus(match);

            Assert.Equal(expected, result);
        }

        [Theory]
        [InlineData(true, false, true)]
        [InlineData(false, true, true)]
        [InlineData(false, false, false)]
        public void IsExistFgLg_Always_ReturnCorrect(bool main, bool site, bool expected)
        {
            var match = new Models.Calculation.Match
            {
                IsExistFgLg = main,
                SiteMatch = new List<SiteMatch>
                {
                    new () { IsExistFgLg = site }
                }
            };

            var result = service.IsExistFgLg(match);

            Assert.Equal(expected, result);
        }

        [Theory]
        [InlineData(true, false, true)]
        [InlineData(false, true, true)]
        [InlineData(false, false, false)]
        public void IsExistHtFgLg_Always_ReturnCorrect(bool main, bool site, bool expected)
        {
            var match = new Models.Calculation.Match
            {
                IsExistHtFgLg = main,
                SiteMatch = new List<SiteMatch>
                {
                    new () { IsExistHtFgLg = site }
                }
            };

            var result = service.IsExistHtFgLg(match);

            Assert.Equal(expected, result);
        }
    }
}