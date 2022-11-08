using Fanex.Data.Repository;
using Settlement.Sportsbook.Aio.Criteria.Cricket;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Cricket;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Cricket
{
    public class CricketBetTypeServiceTests
    {
        private readonly ICricketBetTypeService service;

        public CricketBetTypeServiceTests()
        {
            var repository = Substitute.For<IDynamicRepository>();
            var betTypeNameService = new BetTypeNameServiceImp();
            var groupNameService = new GroupNameServiceImp();
            var inputTypeService = new InputTypeServiceImp();
            repository.Fetch<InputOption>(Arg.Any<GetPlayerInfoCriteria>()).Returns(GenerateInputData());
            service = new CricketBetTypeService(repository, betTypeNameService, groupNameService, inputTypeService);
        }

        private static IEnumerable<InputOption> GenerateInputData()
        {
            var data = new List<InputOption>
            {
                new InputOption { ResourceId = "96801001", OddsInfo = "10001,Test1"},
                new InputOption { ResourceId = "96622001", OddsInfo = "10002,Test2"},
                new InputOption { ResourceId = "96622001", OddsInfo = "10003,Test3"},
                new InputOption { ResourceId = "96711001", OddsInfo = "10004,Test4"},
                new InputOption { ResourceId = "96711001", OddsInfo = "10005,Test5"},
                new InputOption { ResourceId = "96711001", OddsInfo = "10006,Test6"},
            };

            return data;
        }

        [Theory]
        [InlineData("9400", "Super Over Winner", 1, 0, null)]
        [InlineData("9446", "Match Fours", 6, 3, null)]
        [InlineData("9453", "Highest Over Score", 6, 2, null)]
        [InlineData("96801001", "1st Inns Batsman Runs", 2, 9, "Test1")]
        [InlineData("96622001", "2nd Inns Next Man Out", 4, 5, "Test2")]
        [InlineData("96711001", "1st Inns Prematch Top Batsman", 3, 6, null)]
        [InlineData("94511", "Match Dot Ball", 6, 3, null)]
        [InlineData("97091", "1st Inns Highest Over Score", 1, 2, null)]
        [InlineData("94352003", "2nd Inns Wicket 3 Method of Dismissal (2-way)", 5, 1, null)]
        [InlineData("9490100203", "1st Inns Over 2 Ball 3 Exact Runs", 2, 4, null)]
        [InlineData("96372001", "2nd Inns Wicket 1 Method of Dismissal (6-way)", 5, 7, null)]
        [InlineData("96241002", "1st Inns Over 2 Has Boundary Four?", 2, 8, null)]
        public void GroupBetTypesAndGenerateNames_Always_SetCorrectBetTypeInfo(string resourceId, string betTypeName, int groupId, int inputType, string homeName)
        {
            var resultDetail = new ResultDetail { ResourceId = resourceId };
            var resultDetails = new List<ResultDetail> { resultDetail };

            service.GroupBetTypesAndGenerateNames(resultDetails);

            Assert.Equal(betTypeName, resultDetail.BetTypeName);
            Assert.Equal(groupId, resultDetail.GroupId);
            Assert.Equal(inputType, resultDetail.InputType);
            Assert.Equal(homeName, resultDetail.HomeName);
        }
    }
}