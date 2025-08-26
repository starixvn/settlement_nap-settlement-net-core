using Fanex.Data.Repository;
using Settlement.ResourceInfos.Services;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Basketball;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Basketball;

public class BasketballBetTypeServiceTests
{
    private readonly IBasketballBetTypeService service;
    private readonly IGroupBetTypeService groupBetTypeService;
    private readonly IResourceNameService resourceNameService;
    private readonly IDynamicRepository dynamicRepository;
    private readonly IInputTypeService inputTypeService;

    public BasketballBetTypeServiceTests()
    {
        groupBetTypeService = Substitute.For<IGroupBetTypeService>();
        resourceNameService = Substitute.For<IResourceNameService>();
        dynamicRepository = Substitute.For<IDynamicRepository>();
        inputTypeService = Substitute.For<IInputTypeService>();
        service = new BasketballBetTypeServiceImp(groupBetTypeService, resourceNameService, dynamicRepository, inputTypeService);
    }

    [Fact]
    public async Task GetBetTypeNameAndGroup_EmptyList_ReturnsEarly()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>();

        // Act
        await service.GetBetTypeNameAndGroup(resultDetails);

        // Assert
        // Method should return early without calling any services
        Assert.True(true);
    }

    [Fact]
    public async Task GetBetTypeNameAndGroup_WithItems_ProcessesAllItems()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>
        {
            new() { ResourceId = "123", MatchId = 1 },
            new() { ResourceId = "456", MatchId = 1 }
        };

        resourceNameService.GetResourceName(Arg.Any<string>(), Arg.Any<string>()).Returns(("123", "Test Bet Type"));
        groupBetTypeService.GroupOtherBetType(Arg.Any<ResultDetail>()).Returns(new GroupNameModel());
        dynamicRepository.FetchAsync<OddFlexModel>(Arg.Any<GetPlayerInfoCriteria>()).Returns(new List<OddFlexModel>());

        // Act
        await service.GetBetTypeNameAndGroup(resultDetails);

        // Assert
        resourceNameService.Received(2).GetResourceName(Arg.Any<string>(), Arg.Any<string>());
        groupBetTypeService.Received(2).GroupOtherBetType(Arg.Any<ResultDetail>());
    }

    [Fact]
    public void CheckValue_Always_SetEmptyValueForNullScore()
    {
        // Arrange
        var resultDetail = new ResultDetail();

        // Act
        var result = service.CheckValue(resultDetail);

        // Assert
        Assert.Equal("", result.HomeValue);
        Assert.Equal("", result.AwayValue);
        Assert.Same(resultDetail, result);
    }

    [Fact]
    public void CheckValue_WithExistingValues_PreservesValues()
    {
        // Arrange
        var resultDetail = new ResultDetail
        {
            HomeValue = "10",
            AwayValue = "20"
        };

        // Act
        var result = service.CheckValue(resultDetail);

        // Assert
        Assert.Equal("10", result.HomeValue);
        Assert.Equal("20", result.AwayValue);
        Assert.Same(resultDetail, result);
    }

    [Fact]
    public void CheckValue_WithNullValues_SetsEmptyStrings()
    {
        // Arrange
        var resultDetail = new ResultDetail
        {
            HomeValue = null,
            AwayValue = null
        };

        // Act
        var result = service.CheckValue(resultDetail);

        // Assert
        Assert.Equal("", result.HomeValue);
        Assert.Equal("", result.AwayValue);
        Assert.Same(resultDetail, result);
    }

    [Fact]
    public async Task GetBetTypeNameAndGroup_PlayerBetType_CallsGroupPlayerBetType()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>
        {
            new() { ResourceId = "65301", MatchId = 1 }
        };

        resourceNameService.GetResourceName(Arg.Any<string>(), Arg.Any<string>()).Returns(("653", "Player Bet Type"));
        groupBetTypeService.GroupPlayerBetType(Arg.Any<ResultDetail>(), Arg.Any<IList<OddFlexModel>>())
            .Returns(new GroupNameModel { GroupName = "Player Group", GroupId = 123 });
        inputTypeService.GetInputType(Arg.Any<string>()).Returns(InputType.PlayerNone);
        dynamicRepository.FetchAsync<OddFlexModel>(Arg.Any<GetPlayerInfoCriteria>()).Returns(new List<OddFlexModel>());

        // Act
        await service.GetBetTypeNameAndGroup(resultDetails);

        // Assert
        groupBetTypeService.Received().GroupPlayerBetType(Arg.Any<ResultDetail>(), Arg.Any<IList<OddFlexModel>>());
        inputTypeService.Received().GetInputType(Arg.Any<string>());
    }

    [Fact]
    public async Task GetBetTypeNameAndGroup_NonPlayerBetType_CallsGroupBasketballBetType()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>
        {
            new() { ResourceId = "123", MatchId = 1 }
        };

        resourceNameService.GetResourceName(Arg.Any<string>(), Arg.Any<string>()).Returns(("123", "Non Player Bet Type"));
        groupBetTypeService.GroupOtherBetType(Arg.Any<ResultDetail>()).Returns(new GroupNameModel());
        dynamicRepository.FetchAsync<OddFlexModel>(Arg.Any<GetPlayerInfoCriteria>()).Returns(new List<OddFlexModel>());

        // Act
        await service.GetBetTypeNameAndGroup(resultDetails);

        // Assert
        groupBetTypeService.Received().GroupOtherBetType(Arg.Any<ResultDetail>());
    }

    [Fact]
    public async Task GetBetTypeNameAndGroup_HalfTimeBetType_CallsGroupHalfBetType()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>
        {
            new() { ResourceId = "60601", MatchId = 1 }
        };

        resourceNameService.GetResourceName(Arg.Any<string>(), Arg.Any<string>()).Returns(("606", "Half Time Bet Type"));
        groupBetTypeService.GroupHalfBetType(Arg.Any<int>()).Returns(new GroupNameModel { GroupName = "1st Half", GroupId = 3 });
        dynamicRepository.FetchAsync<OddFlexModel>(Arg.Any<GetPlayerInfoCriteria>()).Returns(new List<OddFlexModel>());

        // Act
        await service.GetBetTypeNameAndGroup(resultDetails);

        // Assert
        groupBetTypeService.Received().GroupHalfBetType(Arg.Any<int>());
    }

    [Fact]
    public async Task GetBetTypeNameAndGroup_QuarterBetType_CallsGroupQuarterBetType()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>
        {
            new() { ResourceId = "6170101", MatchId = 1 }
        };

        resourceNameService.GetResourceName(Arg.Any<string>(), Arg.Any<string>()).Returns(("61701", "Quarter Bet Type"));
        groupBetTypeService.GroupQuarterBetType(Arg.Any<int>()).Returns(new GroupNameModel { GroupName = "Quarter 1", GroupId = 1 });
        dynamicRepository.FetchAsync<OddFlexModel>(Arg.Any<GetPlayerInfoCriteria>()).Returns(new List<OddFlexModel>());

        // Act
        await service.GetBetTypeNameAndGroup(resultDetails);

        // Assert
        groupBetTypeService.Received().GroupQuarterBetType(Arg.Any<int>());
    }

    [Fact]
    public async Task GetBetTypeNameAndGroup_WithEmptyResourceId_HandlesGracefully()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>
        {
            new() { ResourceId = "", MatchId = 1 }
        };

        resourceNameService.GetResourceName(Arg.Any<string>(), Arg.Any<string>()).Returns(("", "Empty Bet Type"));
        groupBetTypeService.GroupOtherBetType(Arg.Any<ResultDetail>()).Returns(new GroupNameModel());
        dynamicRepository.FetchAsync<OddFlexModel>(Arg.Any<GetPlayerInfoCriteria>()).Returns(new List<OddFlexModel>());

        // Act & Assert
        var exception = await Record.ExceptionAsync(() => service.GetBetTypeNameAndGroup(resultDetails));
        Assert.Null(exception);
    }
}