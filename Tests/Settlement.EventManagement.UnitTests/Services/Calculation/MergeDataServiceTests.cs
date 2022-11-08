using NSubstitute;
using Settlement.Core.Models;
using Settlement.EventManagement.Services.Calculation;
using System.Collections.Generic;
using Xunit;
using Match = Settlement.EventManagement.Models.Calculation.Match;

namespace Settlement.EventManagement.UnitTests.Services.Calculation
{
    public class MergeDataServiceTests
    {
        private readonly CompareMatchService compareMatchService;

        private readonly MergeDataService service;

        public MergeDataServiceTests()
        {
            compareMatchService = Substitute.For<CompareMatchService>();
            service = new MergeDataServiceImp(compareMatchService);
        }

        [Fact]
        public void MergeMatches_Always_ReturnCorrectListMatch()
        {
            var baseMatches = new List<Match>
            {
                new () { MatchId = 123 }
            };

            var siteMatches = new List<Match>
            {
                new () { MatchId = 123 },
                new () {MatchId = 456}
            };

            compareMatchService.GetDifferentMatchSiteInfo(Arg.Any<Match>(), Arg.Any<List<Match>>())
                .Returns(new SiteMatch { IsCalculatingSingle = 1 });

            var listMatch = service.MergeMatches(baseMatches, siteMatches);

            Assert.Equal(2, listMatch.Count);
            Assert.Equal(1, listMatch[0].SiteMatch[0].IsCalculatingSingle);
        }
    }
}