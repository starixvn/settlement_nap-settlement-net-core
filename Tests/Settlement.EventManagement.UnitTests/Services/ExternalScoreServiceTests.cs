using System.Collections.Generic;
using Settlement.Core.Models;
using Settlement.EventManagement.Services;
using Match = Settlement.EventManagement.Models.Match;
using Xunit;

namespace Settlement.EventManagement.UnitTests.Services
{
    public class ExternalScoreServiceTests
    {
        private readonly IExternalScoreService service;

        public ExternalScoreServiceTests()
        {
            service = new ExternalScoreServiceImp();
        }

        [Fact]
        public void LoadExternalResultForOtherSports_SportSupportFullTimeOnly_SetExResult()
        {
            var match = new Match();
            match.MatchId = 12345;
            match.SuspenderFullTime = "testing";
            match.FinalHomeScore = 1;
            match.FinalAwayScore = 2;
            var listResultDetail = new List<ResultDetail>
            {
                new ResultDetail { MatchId = 12345, ResourceId = "01", HomeValue = "1", AwayValue = "1", SourceId = 1, SourceName = "SBO"},
                new ResultDetail { MatchId = 12345, ResourceId = "00", HomeValue = "1", AwayValue = "2", SourceId = 1, SourceName = "SBO"},
            };

            service.LoadExternalResultForOtherSports(match, listResultDetail, false);

            Assert.Equal(listResultDetail[1], match.ExFTResult);
        }

        [Fact]
        public void LoadExternalResultForOtherSports_SportSupportFullTimeAndHalfTime_SetExResult()
        {
            var match = new Match();
            match.MatchId = 12345;
            match.SuspenderFullTime = "testing";
            match.FinalHomeScore = 1;
            match.FinalAwayScore = 2;
            match.HalfTimeHomeScore = 3;
            match.HalfTimeAwayScore = 4;
            var listResultDetail = new List<ResultDetail>
            {
                new ResultDetail { MatchId = 12345, ResourceId = "01", HomeValue = "1", AwayValue = "1", SourceId = 1, SourceName = "SBO"},
                new ResultDetail { MatchId = 12345, ResourceId = "00", HomeValue = "1", AwayValue = "2", SourceId = 1, SourceName = "SBO"},
            };

            service.LoadExternalResultForOtherSports(match, listResultDetail, true);

            Assert.Equal(listResultDetail[1], match.ExFTResult);
            Assert.Equal(listResultDetail[0], match.ExHTResult);
        }

        [Fact]
        public void LoadExternalResultForBeachVolleyball_ExternalResultIsNotNull__SetExScoreOfMatch()
        {
            var match = new Match();
            match.MatchId = 12345;
            var listResultDetail = new List<ResultDetail>
            {
                new ResultDetail { MatchId = 12345, ResourceId = "00", HomeValue = "1", AwayValue = "2", SourceId = 1, SourceName = "SBO"},
            };

            // Act
            service.LoadExternalResultForVolleyball(match, listResultDetail);

            // Assert
            Assert.Equal(match.ExFTResult, listResultDetail[0]);
        }
    }
}