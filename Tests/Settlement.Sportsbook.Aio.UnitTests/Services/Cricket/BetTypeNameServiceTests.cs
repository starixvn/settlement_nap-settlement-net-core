using Settlement.Sportsbook.Aio.Services.Cricket;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Cricket
{
    public class BetTypeNameServiceTests
    {
        private readonly IBetTypeNameService service;

        public BetTypeNameServiceTests()
        {
            service = new BetTypeNameServiceImp();
        }

        [Theory]
        [InlineData("97091", 9709, "1st Inns Highest Over Score")]
        [InlineData("94352003", 9435, "2nd Inns Wicket 3 Method of Dismissal (2-way)")]
        [InlineData("9490100203", 9490, "1st Inns Over 2 Ball 3 Exact Runs")]
        [InlineData("94511", 9451, "Match Dot Ball")]
        public void GetInnsBetTypeName_Always_ReturnCorrectBetTypeName(string resourceId, int betTypeId, string betTypeName)
        {
            var actual = service.GetInnsBetTypeName(betTypeId, resourceId);

            Assert.Equal(betTypeName, actual);
        }

        [Theory]
        [InlineData(9400, "Super Over Winner")]
        [InlineData(9999, "")]
        public void GetNonInnsBetTypeName_Always_ReturnCorrectBetTypeName(int betTypeId, string betTypeName)
        {
            var actual = service.GetNonInnsBetTypeName(betTypeId);

            Assert.Equal(betTypeName, actual);
        }
    }
}
