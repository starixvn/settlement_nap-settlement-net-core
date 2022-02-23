using Settlement.Sportsbook.Aio.Services.Cricket;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Cricket
{
    public class GroupNameServiceTests
    {
        private readonly IGroupNameService service;

        public GroupNameServiceTests()
        {
            service = new GroupNameServiceImp();
        }

        [Theory]
        [InlineData("96801001", 9680, 2)]
        [InlineData("96622001", 9662, 4)]
        [InlineData("96711001", 9671, 3)]
        [InlineData("94511", 9451, 6)]
        [InlineData("97091", 9709, 1)]
        [InlineData("94352003", 9435, 5)]
        public void GroupInnsBetType_Always_GetCorrectGroupForBetType(string resourceId, int betTypeId, int groupId)
        {
            var actual = service.GroupInnsBetType(betTypeId, resourceId);

            Assert.Equal(groupId, actual.GroupId);
        }

        [Theory]
        [InlineData(9400, 1)]
        [InlineData(9446, 6)]
        public void GroupNonInnsBetType_Always_GetCorrectGroupForBetType(int betTypeId, int groupId)
        {
            var actual = service.GroupNonInnsBetType(betTypeId);

            Assert.Equal(groupId, actual.GroupId);
        }
    }
}
