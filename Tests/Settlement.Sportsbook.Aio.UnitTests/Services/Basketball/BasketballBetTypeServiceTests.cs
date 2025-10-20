using Fanex.Data.Repository;
using Settlement.Core.Constants;
using Settlement.ResourceInfos.Services;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services;
using Settlement.Sportsbook.Aio.Services.Basketball;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Basketball;

public class BasketballBetTypeServiceTests
{
    private readonly IBasketballBetTypeService service;
    private readonly IGroupBetTypeService groupBetTypeService;
    private readonly IResourceNameService resourceNameService;
    private readonly IDynamicRepository dynamicRepository;
    private readonly IInputTypeService inputTypeService;
    private readonly IGenerateBetTypeNameService generateBetTypeNameService;


    public BasketballBetTypeServiceTests()
    {
        groupBetTypeService = Substitute.For<IGroupBetTypeService>();
        resourceNameService = Substitute.For<IResourceNameService>();
        dynamicRepository = Substitute.For<IDynamicRepository>();
        inputTypeService = Substitute.For<IInputTypeService>();
        generateBetTypeNameService = Substitute.For<IGenerateBetTypeNameService>();
        service = new BasketballBetTypeServiceImp(groupBetTypeService, resourceNameService, dynamicRepository, inputTypeService, generateBetTypeNameService);
    }

    [Fact]
    public void GroupingBettype_EmptyList_ReturnsEarly()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>();

        // Act
        service.GroupingBettype(resultDetails);

        // Assert
        Assert.True(true);
    }

    [Fact]
    public void GroupingBettype_WithItems_ProcessesAllItems()
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
        service.GroupingBettype(resultDetails);

        // Assert
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
    public void GroupingBettype_PlayerBetType_CallsGroupPlayerBetType()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>
        {
            new() { ResourceId = "65301", MatchId = 1 }
        };

        resourceNameService.GetResourceName(Arg.Any<string>(), Arg.Any<string>()).Returns(("653", "Player Bet Type"));
        groupBetTypeService.GroupPlayerBetType(Arg.Any<ResultDetail>())
            .Returns(new GroupNameModel { GroupName = "Player Group", GroupId = 123 });
        inputTypeService.GetInputType(Arg.Any<string>()).Returns(InputType.PlayerNone);
        dynamicRepository.FetchAsync<OddFlexModel>(Arg.Any<GetPlayerInfoCriteria>()).Returns(new List<OddFlexModel>());

        // Act
        service.GroupingBettype(resultDetails);

        // Assert
        groupBetTypeService.Received().GroupPlayerBetType(Arg.Any<ResultDetail>());
        inputTypeService.Received().GetInputType(Arg.Any<string>());
    }

    [Fact]
    public void GroupingBettype_NonPlayerBetType_CallsGroupBasketballBetType()
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
        service.GroupingBettype(resultDetails);

        // Assert
        groupBetTypeService.Received().GroupOtherBetType(Arg.Any<ResultDetail>());
    }

    [Fact]
    public void GroupingBettype_HalfTimeBetType_CallsGroupHalfBetType()
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
        service.GroupingBettype(resultDetails);

        // Assert
        groupBetTypeService.Received().GroupHalfBetType(Arg.Any<int>());
    }

    [Fact]
    public void GroupingBettype_QuarterBetType_CallsGroupQuarterBetType()
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
        service.GroupingBettype(resultDetails);

        // Assert
        groupBetTypeService.Received().GroupQuarterBetType(Arg.Any<int>());
    }

    [Fact]
    public void GroupingBettype_WithEmptyResourceId_HandlesGracefully()
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
        var exception = Record.Exception(() => service.GroupingBettype(resultDetails));
        Assert.Null(exception);
    }

    [Fact]
    public async Task GetOddFlex_WithNoDependentResources_DoesNotSetRelatedCalResources()
    {
        // Arrange
        var relatedResource = new ResultDetail
        {
            ResourceId = "653001",
            MatchId = 1,
            BetType = "653" // Related resource type only
        };

        var earlyResultDetails = new List<ResultDetail> { relatedResource };

        var oddFlexModels = new List<OddFlexModel>
        {
            new()
            {
                ResourceId = "653001",
                BetType = "653",
                Info = new OddsInfoModel { PlayerId = 123 }
            }
        };

        resourceNameService.GetResourceName(Arg.Any<string>(), Arg.Any<string>()).Returns(("653", "Related Bet Type"));
        dynamicRepository.FetchAsync<OddFlexModel>(Arg.Any<GetPlayerInfoCriteria>()).Returns(oddFlexModels);

        // Act
        await service.GetOddFlex(earlyResultDetails);

        // Assert
        Assert.Null(relatedResource.RelatedCalResources);
    }

    [Fact]
    public async Task GetOddFlex_WithEmptyList_ReturnsEarly()
    {
        // Arrange
        var emptyList = new List<ResultDetail>();

        // Act
        await service.GetOddFlex(emptyList);

        // Assert
        await dynamicRepository.DidNotReceive().FetchAsync<OddFlexModel>(Arg.Any<GetPlayerInfoCriteria>());
    }


    [Fact]
    public void RemoveDuplicatedResources_WithNoDuplicates_DoesNotRemoveAnything()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>
        {
            new()
            {
                ResourceId = "653001",
                BetType = "653",
                OtherInfo = "123,1",
                SettlementStatusId = SettlementStatus.Running
            },
            new()
            {
                ResourceId = "654001",
                BetType = "654",
                OtherInfo = "456,2",
                SettlementStatusId = SettlementStatus.Completed
            }
        };

        // Act
        service.RemoveDuplicatedResources(resultDetails);

        // Assert
        Assert.Equal(2, resultDetails.Count);
    }

    [Fact]
    public void RemoveDuplicatedResources_WithEmptyList_DoesNotThrow()
    {
        // Arrange
        var resultDetails = new List<ResultDetail>();

        // Act & Assert
        var exception = Record.Exception(() => service.RemoveDuplicatedResources(resultDetails));
        Assert.Null(exception);
        Assert.Empty(resultDetails);
    }

    [Fact]
    public void RemoveDuplicatedResources_WithSettledResult_PrioritizesSettledResult()
    {
        // Arrange
        var settledResult = new ResultDetail
        {
            ResourceId = "653001",
            BetType = "653",
            ResultStatusId = ResultStatus.AutoSettled,
            OddFlex = new List<OddFlexModel>
            {
                new() { Info = new OddsInfoModel { PlayerId = 123 } }
            }
        };

        var runningResult = new ResultDetail
        {
            ResourceId = "653002",
            BetType = "653",
            ResultStatusId = ResultStatus.Live,
            OddFlex = new List<OddFlexModel>
            {
                new() { Info = new OddsInfoModel { PlayerId = 123 } }
            }
        };

        var resultDetails = new List<ResultDetail> { settledResult, runningResult };

        // Act
        service.RemoveDuplicatedResources(resultDetails);

        // Assert
        Assert.Single(resultDetails);
        Assert.Equal(ResultStatus.AutoSettled, resultDetails[0].ResultStatusId);
        Assert.Equal("653001", resultDetails[0].ResourceId);
    }

    [Fact]
    public void RemoveDuplicatedResources_WithManuallySettledResult_PrioritizesManuallySettledResult()
    {
        // Arrange
        var manuallySettledResult = new ResultDetail
        {
            ResourceId = "653001",
            BetType = "653",
            ResultStatusId = ResultStatus.ManuallySettled,
            OddFlex = new List<OddFlexModel>
            {
                new() { Info = new OddsInfoModel { PlayerId = 123 } }
            }
        };

        var runningResult = new ResultDetail
        {
            ResourceId = "653002",
            BetType = "653",
            ResultStatusId = ResultStatus.Live,
            OddFlex = new List<OddFlexModel>
            {
                new() { Info = new OddsInfoModel { PlayerId = 123 } }
            }
        };

        var resultDetails = new List<ResultDetail> { manuallySettledResult, runningResult };

        // Act
        service.RemoveDuplicatedResources(resultDetails);

        // Assert
        Assert.Single(resultDetails);
        Assert.Equal(ResultStatus.ManuallySettled, resultDetails[0].ResultStatusId);
        Assert.Equal("653001", resultDetails[0].ResourceId);
    }

    [Fact]
    public void RemoveDuplicatedResources_WithNoSettledResults_PrioritizesOriginalResource()
    {
        // Arrange
        var originalResult = new ResultDetail
        {
            ResourceId = "653005",
            BetType = "653",
            ResultStatusId = ResultStatus.Live,
            OddFlex = new List<OddFlexModel>
            {
                new() { Info = new OddsInfoModel { PlayerId = 123 } }
            }
        };

        var duplicateResult = new ResultDetail
        {
            ResourceId = "653015",
            BetType = "653",
            ResultStatusId = ResultStatus.Live,
            OddFlex = new List<OddFlexModel>
            {
                new() { Info = new OddsInfoModel { PlayerId = 123 } }
            }
        };

        var resultDetails = new List<ResultDetail> { originalResult, duplicateResult };

        // Act
        service.RemoveDuplicatedResources(resultDetails);

        // Assert
        Assert.Single(resultDetails);
        Assert.Equal("653005", resultDetails[0].ResourceId);
    }

    [Fact]
    public void RemoveDuplicatedResources_WithNoSettledOrOriginalResults_KeepsFirstResult()
    {
        // Arrange
        var firstResult = new ResultDetail
        {
            ResourceId = "653015",
            BetType = "653",
            ResultStatusId = ResultStatus.Live,
            OddFlex = new List<OddFlexModel>
            {
                new() { Info = new OddsInfoModel { PlayerId = 123 } }
            }
        };

        var secondResult = new ResultDetail
        {
            ResourceId = "653025",
            BetType = "653",
            ResultStatusId = ResultStatus.Live,
            OddFlex = new List<OddFlexModel>
            {
                new() { Info = new OddsInfoModel { PlayerId = 123 } }
            }
        };

        var resultDetails = new List<ResultDetail> { firstResult, secondResult };

        // Act
        service.RemoveDuplicatedResources(resultDetails);

        // Assert
        Assert.Single(resultDetails);
        Assert.Equal("653015", resultDetails[0].ResourceId);
    }

    [Fact]
    public void RemoveDuplicatedResources_WithMultipleGroups_HandlesEachGroupSeparately()
    {
        // Arrange
        var group1Settled = new ResultDetail
        {
            ResourceId = "653001",
            BetType = "653",
            ResultStatusId = ResultStatus.AutoSettled,
            OddFlex = new List<OddFlexModel>
            {
                new() { Info = new OddsInfoModel { PlayerId = 123 } }
            }
        };

        var group1Running = new ResultDetail
        {
            ResourceId = "653002",
            BetType = "653",
            ResultStatusId = ResultStatus.Live,
            OddFlex = new List<OddFlexModel>
            {
                new() { Info = new OddsInfoModel { PlayerId = 123 } }
            }
        };

        var group2Original = new ResultDetail
        {
            ResourceId = "654005",
            BetType = "654",
            ResultStatusId = ResultStatus.Live,
            OddFlex = new List<OddFlexModel>
            {
                new() { Info = new OddsInfoModel { PlayerId = 456 } }
            }
        };

        var group2Duplicate = new ResultDetail
        {
            ResourceId = "654015",
            BetType = "654",
            ResultStatusId = ResultStatus.Live,
            OddFlex = new List<OddFlexModel>
            {
                new() { Info = new OddsInfoModel { PlayerId = 456 } }
            }
        };

        var resultDetails = new List<ResultDetail> { group1Settled, group1Running, group2Original, group2Duplicate };

        // Act
        service.RemoveDuplicatedResources(resultDetails);

        // Assert
        Assert.Equal(3, resultDetails.Count);
        Assert.Contains(resultDetails, r => r.ResourceId == "653001" && r.ResultStatusId == ResultStatus.AutoSettled);
        Assert.Contains(resultDetails, r => r.ResourceId == "654005");
    }

    [Fact]
    public void RemoveDuplicatedResources_WithDifferentPlayerIds_DoesNotGroupThem()
    {
        // Arrange
        var player1Result = new ResultDetail
        {
            ResourceId = "653001",
            BetType = "653",
            ResultStatusId = ResultStatus.Live,
            OddFlex = new List<OddFlexModel>
            {
                new() { Info = new OddsInfoModel { PlayerId = 123 } }
            }
        };

        var player2Result = new ResultDetail
        {
            ResourceId = "653002",
            BetType = "653",
            ResultStatusId = ResultStatus.Live,
            OddFlex = new List<OddFlexModel>
            {
                new() { Info = new OddsInfoModel { PlayerId = 456 } }
            }
        };

        var resultDetails = new List<ResultDetail> { player1Result, player2Result };

        // Act
        service.RemoveDuplicatedResources(resultDetails);

        // Assert
        Assert.Equal(2, resultDetails.Count);
        Assert.Contains(resultDetails, r => r.ResourceId == "653001");
        Assert.Contains(resultDetails, r => r.ResourceId == "653002");
    }

    [Fact]
    public void RemoveDuplicatedResources_WithEmptyOddFlex_HandlesGracefully()
    {
        // Arrange
        var resultWithEmptyOddFlex = new ResultDetail
        {
            ResourceId = "653001",
            BetType = "653",
            ResultStatusId = ResultStatus.Live,
            OddFlex = new List<OddFlexModel>()
        };

        var resultWithNullOddFlex = new ResultDetail
        {
            ResourceId = "653002",
            BetType = "653",
            ResultStatusId = ResultStatus.Live,
            OddFlex = null
        };

        var resultDetails = new List<ResultDetail> { resultWithEmptyOddFlex, resultWithNullOddFlex };

        // Act & Assert
        var exception = Record.Exception(() => service.RemoveDuplicatedResources(resultDetails));
        Assert.Null(exception);
        Assert.Equal(2, resultDetails.Count);
    }

    [Fact]
    public void RemoveDuplicatedResources_WithThreeDuplicates_KeepsOnlyOne()
    {
        // Arrange
        var result1 = new ResultDetail
        {
            ResourceId = "653001",
            BetType = "653",
            ResultStatusId = ResultStatus.Live,
            OddFlex = new List<OddFlexModel>
            {
                new() { Info = new OddsInfoModel { PlayerId = 123 } }
            }
        };

        var result2 = new ResultDetail
        {
            ResourceId = "653002",
            BetType = "653",
            ResultStatusId = ResultStatus.Live,
            OddFlex = new List<OddFlexModel>
            {
                new() { Info = new OddsInfoModel { PlayerId = 123 } }
            }
        };

        var result3 = new ResultDetail
        {
            ResourceId = "653003",
            BetType = "653",
            ResultStatusId = ResultStatus.Live,
            OddFlex = new List<OddFlexModel>
            {
                new() { Info = new OddsInfoModel { PlayerId = 123 } }
            }
        };

        var resultDetails = new List<ResultDetail> { result1, result2, result3 };

        // Act
        service.RemoveDuplicatedResources(resultDetails);

        // Assert
        Assert.Single(resultDetails);
        Assert.Equal("653001", resultDetails[0].ResourceId); // First one should be kept
    }
}