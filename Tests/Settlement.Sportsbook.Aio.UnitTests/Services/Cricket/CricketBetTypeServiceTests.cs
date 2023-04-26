using Fanex.Data.Repository;
using Settlement.ResourceName.Services;
using Settlement.Sportsbook.Aio.Criteria.Cricket;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Cricket;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Cricket;

public class CricketBetTypeServiceTests
{
    private readonly ICricketBetTypeService service;

    private readonly IResourceNameService resourceNameService;

    public CricketBetTypeServiceTests()
    {
        var repository = Substitute.For<IDynamicRepository>();
        resourceNameService = Substitute.For<IResourceNameService>();
        var groupNameService = new GroupNameServiceImp();
        var inputTypeService = new InputTypeServiceImp();
        repository.Fetch<InputOption>(Arg.Any<GetPlayerInfoCriteria>()).Returns(GenerateInputData());
        service = new CricketBetTypeService(repository, resourceNameService, groupNameService, inputTypeService);
    }

    private static IEnumerable<InputOption> GenerateInputData()
    {
        var data = new List<InputOption>
        {
            new() { ResourceId = "96801001", OddsInfo = "10001,Test1"},
            new() { ResourceId = "96622001", OddsInfo = "10002,Test2"},
            new() { ResourceId = "96622001", OddsInfo = "10003,Test3"},
            new() { ResourceId = "96711001", OddsInfo = "10004,Test4"},
            new() { ResourceId = "96711001", OddsInfo = "10005,Test5"},
            new() { ResourceId = "96711001", OddsInfo = "10006,Test6"}
        };

        return data;
    }

    [Theory]
    [InlineData("9400", 1, 0, null)]
    [InlineData("9446", 6, 3, null)]
    [InlineData("9453", 6, 2, null)]
    [InlineData("96801001", 2, 9, "Test1")]
    [InlineData("96622001", 4, 5, "Test2")]
    [InlineData("96711001", 3, 6, null)]
    [InlineData("94511", 6, 3, null)]
    [InlineData("97091", 1, 2, null)]
    [InlineData("94352003", 5, 1, null)]
    [InlineData("9490100203", 2, 4, null)]
    [InlineData("96372001", 5, 7, null)]
    [InlineData("96241002", 2, 8, null)]
    public void GroupBetTypesAndGenerateNames_Always_SetCorrectBetTypeInfo(string resourceId, int groupId, int inputType, string homeName)
    {
        var resultDetail = new ResultDetail { ResourceId = resourceId };
        var resultDetails = new List<ResultDetail> { resultDetail };
        resourceNameService.GetResourceName(Arg.Any<string>(), Arg.Any<string>()).Returns("MockBetType");

        service.GroupBetTypesAndGenerateNames(resultDetails);

        Assert.Equal(groupId, resultDetail.GroupId);
        Assert.Equal(inputType, resultDetail.InputType);
        Assert.Equal(homeName, resultDetail.HomeName);
        Assert.Equal("MockBetType", resultDetail.BetTypeName);
    }
}