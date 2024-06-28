using Fanex.Data.Repository;
using Fanex.Settlement.Converter.Services;
using Settlement.Constants;
using Settlement.Models;
using Settlement.Sportsbook.OtherSports.Criteria;
using Settlement.Sportsbook.OtherSports.Requests;
using ResourceItem = Settlement.Models.ResourceItem;

namespace Settlement.Sportsbook.OtherSports.UnitTests.Services;

public class GenerateServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly GenerateService service;

    public GenerateServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        var xmlConvertService = Substitute.For<XmlConvertService>();
        service = new GenerateServiceImp(repository, xmlConvertService);
    }

    [Theory]
    [InlineData(SportType.BaseBall, 12)]
    [InlineData(SportType.Football, 7)]
    [InlineData(SportType.FieldHockey, 5)]
    public void GenerateResultDetail_Always_GenerateResultsBySport(int sportType, int setNumber)
    {
        var matchDetail = new MatchDetail
        {
            SportType = sportType
        };

        var result = service.GenerateResultDetail(matchDetail);

        Assert.Equal(result.Count, setNumber);
    }

    [Fact]
    public void GenerateResultDetail_Always_GenerateCorrectResultByBetStatus()
    {
        var matchDetail = new MatchDetail
        {
            SportType = SportType.FieldHockey,
            BetStatus = "1-1"
        };

        var result = service.GenerateResultDetail(matchDetail);

        Assert.Equal("1", result[0].HomeValue);
        Assert.Equal("1", result[0].AwayValue);
        Assert.Null(result[1].AwayValue);
        Assert.Null(result[1].HomeValue);
    }

    [Fact]
    public void GenerateResultDetail_Always_GenerateFullTimeResult()
    {
        var matchDetail = new MatchDetail
        {
            SportType = SportType.FieldHockey,
            FinalAwayScore = 2,
            FinalHomeScore = 1
        };

        var result = service.GenerateResultDetail(matchDetail);
        var final = result.Find(item => item.ResourceId == ResourceType.Final);

        Assert.Equal("1", final?.HomeValue);
        Assert.Equal("2", final?.AwayValue);
    }

    [Fact]
    public void GenerateResultDetail_FootBallAndBaseBall_GenerateHalfTimeResult()
    {
        var matchDetail = new MatchDetail
        {
            SportType = SportType.Football,
            HalfTimeHomeScore = 2,
            HalfTimeAwayScore = 1
        };

        var result = service.GenerateResultDetail(matchDetail);
        var halftime = result.Find(item => item.ResourceId == ResourceType.Halftime);
        matchDetail.SportType = SportType.FieldHockey;
        result = service.GenerateResultDetail(matchDetail);
        var halftimeSecond = result.Find(item => item.ResourceId == ResourceType.Halftime);

        Assert.Equal("2", halftime?.HomeValue);
        Assert.Equal("1", halftime?.AwayValue);
        Assert.Null(halftimeSecond);
    }

    [Fact]
    public void GenerateBetStatus_SettleDirect_ReturnScoreFinalByRequest()
    {
        var fullTimeResult = new ResourceItem
        {
            ResourceId = ResourceType.Final,
            HomeValue = "2",
            AwayValue = "1"
        };
        var request = new CalculateRequest
        {
            IsScoreDirect = true,
            SelectedResources = [fullTimeResult]
        };

        var result = service.GenerateBetStatus(request);

        Assert.Equal(1, result.FinalAwayScore);
        Assert.Equal(2, result.FinalHomeScore);
        Assert.Equal(0, result.HtAwayScore);
        Assert.Equal(0, result.HtHomeScore);
    }

    [Fact]
    public void GenerateBetStatus_SettleHalfTime_ReturnScoreHalfTimeByResourceItem()
    {
        var resourceItem = new ResourceItem
        {
            HomeValue = "2",
            AwayValue = "1"
        };
        var request = new CalculateRequest
        {
            SelectedResources = [resourceItem, resourceItem, resourceItem, resourceItem],
            Action = ActionType.CalculateHalfTime
        };

        repository.Get<MatchDetail>(Arg.Any<GetMatchInfoCriteria>())
            .Returns(new MatchDetail { BetStatus = "Refund FT;0-0,0-0,4-8,4-8" });
        var result = service.GenerateBetStatus(request);

        Assert.Null(result.FinalAwayScore);
        Assert.Null(result.FinalHomeScore);
        Assert.Equal(2, result.HtAwayScore);
        Assert.Equal(4, result.HtHomeScore);
        Assert.Equal("Refund FT;2-1,2-1,4-8,4-8", result.BetStatus.ToString());
    }

    [Fact]
    public void GenerateBetStatus_SettleFullTime_ReturnFinalScoreByResourceItem()
    {
        var resourceItem = new ResourceItem
        {
            HomeValue = "2",
            AwayValue = "1"
        };
        var request = new CalculateRequest
        {
            SelectedResources = [resourceItem, resourceItem, resourceItem, resourceItem],
            Action = ActionType.CalculateFullTime
        };

        repository.Get<MatchDetail>(Arg.Any<GetMatchInfoCriteria>())
            .Returns(new MatchDetail { BetStatus = "Refund FT;" });
        var result = service.GenerateBetStatus(request);

        Assert.Equal(8, result.FinalHomeScore);
        Assert.Equal(4, result.FinalAwayScore);
        Assert.Equal(2, result.HtAwayScore);
        Assert.Equal(4, result.HtHomeScore);
        Assert.Equal("2-1,2-1,2-1,2-1", result.BetStatus.ToString());
    }
}