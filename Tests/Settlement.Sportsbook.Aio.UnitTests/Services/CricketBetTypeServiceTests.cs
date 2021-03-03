using Settlement.Sportsbook.Aio.Cricket;
using Settlement.Sportsbook.Aio.Models;
using System.Collections.Generic;
using System.Linq;
using Xunit;

namespace Settlement.Sportsbook.Aio.UnitTests.Services
{
    public class CricketBetTypeServiceTests
    {
        [Theory]
        [InlineData("9400", 1, 0, "Super Over Winner")]
        [InlineData("9446", 6, 2, "Match Fours")]
        [InlineData("9449", 6, 3, "Match Wickets")]
        [InlineData("94841001", 2, 2, "1st Innings Over 1 Exact Runs")]
        [InlineData("9491100102", 3, 4, "1st Innings Over 1 Ball 2 Exact Runs")]
        [InlineData("94842001", 4, 2, "2nd Innings Over 1 Exact Runs")]
        [InlineData("94852001", 5, 2, "2nd Innings Over 1 Exact Runs")]
        [InlineData("94341001", 2, 1, "1st Innings Wicket 1 Method of Dismissal")]
        public void GroupBetTypesAndGenerateNames_Always_GroupAndGenerateCorrectBetTypeName(string resourceId, int group, int inputType, string betTypeName)
        {
            var service = new CricketBetTypeService();
            var resultDetails = new List<MatchResultDetail>
            {
                new MatchResultDetail
                {
                    ResourceId = resourceId,
                }
            };

            service.GroupBetTypesAndGenerateNames(resultDetails);

            var resultDetail = resultDetails.FirstOrDefault();
            Assert.Equal(betTypeName, resultDetail.BetTypeName);
            Assert.Equal(group, resultDetail.GroupId);
            Assert.Equal(inputType, resultDetail.InputType);
        }
    }
}
