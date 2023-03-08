using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.OtherSports.Criteria;
using Settlement.Sportsbook.OtherSports.Models;
using Settlement.Sportsbook.OtherSports.Requests;

namespace Settlement.Sportsbook.OtherSports.UnitTests.Services;

public class SportsbookServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly MultipleServerService multipleServerService;

    private readonly GenerateService generateService;

    private readonly SportsbookService service;

    public SportsbookServiceTests()
    {
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<OtherSportsAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        repository = Substitute.For<IDynamicRepository>();
        var refDataService = Substitute.For<IRefDataService>();
        generateService = Substitute.For<GenerateService>();
        multipleServerService = Substitute.For<MultipleServerService>();
        service = new SportsbookServiceImp(repository, refDataService, mapper, generateService,
            multipleServerService);
    }

    [Fact]
    public async Task GetMatch_MatchWithResultDetail_FetchMatchAndResultDetail()
    {
        var matchDetail = new MatchDetail { SportType = SportType.Badminton };
        multipleServerService.GetMatchInfo(Arg.Any<GetMatchRequest>())
            .Returns((matchDetail, new List<TicketCounts>()));

        var result = await service.GetMatch(new GetMatchRequest());

        Assert.IsType<MatchResultDetail>(result);
        await repository.Received().FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>());
        repository.Received().Fetch<ResultDetail>(Arg.Any<GetExternalResultCriteria>());
        await repository.Received().GetAsync<MatchHedgeDetail>(Arg.Any<GetMatchDetailHedgeMatchCriteria>());
    }

    [Fact]
    public async Task GetMatch_MatchWithBetStatus_FetchMatchAndResultDetail()
    {
        var matchDetail = new MatchDetail { SportType = SportType.Football };
        multipleServerService.GetMatchInfo(Arg.Any<GetMatchRequest>())
            .Returns((matchDetail, new List<TicketCounts>()));

        var result = await service.GetMatch(new GetMatchRequest());

        Assert.IsType<MatchResultDetail>(result);
        generateService.Received().GenerateResultDetail(Arg.Any<MatchDetail>());
        repository.Received().Fetch<ResultDetail>(Arg.Any<GetExternalResultCriteria>());
        await repository.Received().GetAsync<MatchHedgeDetail>(Arg.Any<GetMatchDetailHedgeMatchCriteria>());
    }

    [Fact]
    public async Task GetMatch_ExistProviderScore_SetValue()
    {
        var resultDetails = new List<ResultDetail>
        {
            new()
            {
                HomeValue = "0",
                AwayValue = "1",
                ResourceId = "00",
                SourceName = "test"
            },

            new()
            {
                HomeValue = "2",
                AwayValue = "3",
                ResourceId = "01",
                SourceName = "test"
            }
        };

        var matchDetail = new MatchDetail { SportType = SportType.Football };
        multipleServerService.GetMatchInfo(Arg.Any<GetMatchRequest>())
            .Returns((matchDetail, new List<TicketCounts>()));
        generateService.GenerateResultDetail(Arg.Any<MatchDetail>());
        repository.Fetch<ResultDetail>(Arg.Any<GetExternalResultCriteria>()).Returns(resultDetails);

        var result = await service.GetMatch(new GetMatchRequest());
        var actual = result.MatchDetail;

        Assert.True(actual.ExFTAwayScore == 1 && actual.ExFTHomeScore == 0
                                              && actual.ExHTAwayScore == 3 && actual.ExHTHomeScore == 2 && actual.ExternalSourceName == "test");
    }

    [Fact]
    public async Task GetLatestResult_MatchWithResultDetail_ReturnEmptyList()
    {
        repository.GetAsync<MatchDetail>(Arg.Any<GetLatestResultCriteria>())
            .Returns(new MatchDetail { SportType = SportType.Badminton });

        var result = await service.GetLatestResult(new GetLatestResultRequest());

        Assert.Empty(result.ResultDetails);
    }

    [Fact]
    public async Task GetLatestResult_MatchWithOutResultDetail_ReturnList()
    {
        var resultDetails = new List<ResultDetail>()
        {
            new()
            {
                ResourceId = "00"
            }
        };
        repository.GetAsync<MatchDetail>(Arg.Any<GetLatestResultCriteria>())
            .Returns(new MatchDetail { SportType = SportType.Football });
        generateService.GenerateResultDetail(Arg.Any<MatchDetail>()).Returns(resultDetails);

        var result = await service.GetLatestResult(new GetLatestResultRequest());

        Assert.Single(result.ResultDetails);
        Assert.Equal("00", result.ResultDetails[0].ResourceId);
    }
}