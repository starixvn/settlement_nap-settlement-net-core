using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Settlement.Criteria;
using Settlement.Services;
using Settlement.Setting.Criteria;
using Settlement.Setting.Models;
using Settlement.Setting.Requests;

namespace Settlement.Setting.UnitTests.Services;

public class SettingServiceTests
{
    private readonly SettingService service;
    private readonly IDynamicRepository repository;

    public SettingServiceTests()
    {
        var logService = Substitute.For<LogService>();
        var xmlConvertService = Substitute.For<XmlConvertService>();

        repository = Substitute.For<IDynamicRepository>();
        var currentSession = Substitute.For<INapSession>();
        var mapperConfig = new MapperConfigurationExpression();
        mapperConfig.AddProfile<SettingAutoMapperProfile>();
        var config = new MapperConfiguration(mapperConfig);
        var mapper = new Mapper(config);
        var accessor = Substitute.For<IHttpContextAccessor>();
        var context = new DefaultHttpContext
        {
            Connection =
            {
                RemoteIpAddress = new System.Net.IPAddress(1)
            }
        };
        accessor.HttpContext = context;

        service = new SettingServiceImp(repository, currentSession, accessor, mapper, logService, xmlConvertService);
    }

    [Fact]
    public async Task UpdateSettingLeague_Always_ReturnsResultFromRepositoryExecute()
    {
        // Arrange
        const int errorCode = 100;
        const string errorMsg = "Error Message";
        var query = new SettingLeagueRequest();
        await repository.ExecuteAsync(Arg.Do<UpdateSettingLeagueCriteria>(x =>
        {
            x.ErrCode = errorCode;
            x.ErrMsg = errorMsg;
        }));

        // Act
        var result = await service.UpdateSettingLeague(query);

        // Assert
        Assert.True(result.ErrCode == errorCode && result.ErrMsg == errorMsg);
    }

    [Fact]
    public async Task UpdateSettingMatch_Always_ReturnsResultFromRepositoryExecute()
    {
        // Arrange
        const int errorCode = 100;
        const string errorMsg = "Error Message";
        var query = new SettingMatchRequest();
        repository.ExecuteAsync(Arg.Do<UpdateSettingMatchCriteria>(x =>
        {
            x.ErrCode = errorCode;
            x.ErrMsg = errorMsg;
        })).Returns(1);

        // Act
        var result = await service.UpdateSettingMatch(query);

        // Assert
        Assert.True(result.ErrCode == errorCode && result.ErrMsg == errorMsg);
    }

    [Fact]
    public async Task GetRemarkInfo_Always_ReturnsMatchInfoFromRepositoryGet()
    {
        // Arrange
        var matchInfo = new RemarkQueryModel();
        repository.GetAsync<RemarkQueryModel>(Arg.Any<GetRemarkInfoCriteria>()).Returns(matchInfo);

        // Act
        var result = await service.GetRemarkInfo(1);

        // Assert
        Assert.NotNull(result);
    }

    [Fact]
    public async Task UpdateTimeSettingLeague_Always_InvokeExecute()
    {
        // Arrange
        var query = new TimeSettingRequest();
        await repository.ExecuteAsync(Arg.Any<UpdateRemarkCriteria>());

        // Act
        await service.UpdateTimeSettingLeague(query);

        // Assert
        await repository.Received(1).ExecuteAsync(Arg.Any<UpdateTimeSettingLeagueCriteria>());
    }

    [Fact]
    public async Task ProcessUpdateHoldMatchSetting_WhenChangedSettingsIsNotEmpty_ShouldExecuteCriteria_()
    {
        // Arrange
        var request = new UpdateHoldMatchSettingRequest
        {
            HoldSettings = new List<HoldSetting>
                {
                    new () { Name ="isMtdHold", IsApplyChild = true, Value = true }
                },
            OrgHoldSettings = new()
        };

        // Act
        await service.ProcessUpdateHoldMatchSetting(request);

        // Assert
        await repository.Received(1).ExecuteAsync(Arg.Any<UpdateHoldMatchSettingCriteria>());
    }

    [Fact]
    public async Task ProcessUpdateHoldMatchSetting_WhenChangedSettingsIsEmpty_NotExecuteCriteria_()
    {
        // Arrange
        var request = new UpdateHoldMatchSettingRequest
        {
            HoldSettings = [],
            OrgHoldSettings = new List<HoldSetting>()
        };

        // Act
        await service.ProcessUpdateHoldMatchSetting(request);

        // Assert
        await repository.Received(0).ExecuteAsync(Arg.Any<UpdateHoldMatchSettingCriteria>());
    }

    [Fact]
    public async Task GetSetting_ShouldReturnConvertedSetting()
    {
        // Arrange
        var request = new GetSettingRequest
        {
            MatchId = 1,
            LeagueId = 2
        };

        const int settingValue = 10;
        repository.GetAsync<int?>(Arg.Any<GetSettingCriteria>()).Returns(settingValue);

        // Act
        var result = await service.GetSetting(request);

        // Assert
        Assert.Equal("0101", result);
    }
}