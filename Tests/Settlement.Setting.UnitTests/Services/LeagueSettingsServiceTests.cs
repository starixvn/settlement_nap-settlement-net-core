using AutoMapper;
using Fanex.Data.Repository;
using Settlement.Services;
using Fanex.RemotingRef;
using Settlement.Setting.Requests.LeagueSettings;
using Settlement.Setting.Criteria.LeagueSettings;
using Settlement.Setting.Models.LeagueSettings;
using Settlement.Models;
using Settlement.Criteria;
using Settlement.Setting.Requests;

namespace Settlement.Setting.UnitTests.Services;

public class LeagueSettingsServiceTests
{
    private readonly LeagueSettingsServiceImp leagueSettingsService;
    private readonly IDynamicRepository repository;
    private readonly IRemotingRefService remotingRef;
    private readonly IMapper mapper;
    private readonly LogService logService;
    private readonly SettingService settingService;

    public LeagueSettingsServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        remotingRef = Substitute.For<IRemotingRefService>();
        mapper = Substitute.For<IMapper>();
        logService = Substitute.For<LogService>();
        settingService = Substitute.For<SettingService>();

        leagueSettingsService = new LeagueSettingsServiceImp(repository, remotingRef, mapper, logService, settingService);
    }

    [Fact]
    public async Task GetLeagueSettings_LeagueSettings_ReturnCorrect()
    {
        // Arrange
        var request = new GetLeagueSettingsRequest
        {
            LeagueId = 1,
            SportType = 1
        };

        var leagueSettings = new LeagueSettings
        {
            LeagueId = 1,
            LeagueName = "Premier League",
            Providers = new List<ProviderInfo>()
        };

        repository.GetAsync<LeagueSettings>(Arg.Any<GetLeagueSettings>()).Returns(leagueSettings);
        remotingRef.GetLeagueName(Arg.Any<string>(), Arg.Any<string>()).Returns("Premier League");
        repository.FetchAsync<ProviderInfo>(Arg.Any<GetProviderInfoCriteria>()).Returns(new List<ProviderInfo>());

        // Act
        var result = await leagueSettingsService.GetLeagueSettings(request);

        // Assert
        Assert.Equal(1, result.LeagueId);
        Assert.Equal("Premier League", result.LeagueName);
        Assert.Empty(result.Providers);
    }

    [Fact]
    public async Task UpdateLeagueSettings_ReturnSuccess()
    {
        // Arrange
        var request = new UpdateLeagueSettingsRequest
        {
            OldSettings = new()
            {
                AutoSetting = 1,
            },
            NewSettings = new()
            {
                AutoSetting = 2,
            },
            IsApplyAll = true
        };

        var updateWTResult = new Result();
        var updateASResult = new Result();

        mapper.Map<UpdateLeagueSettingsCriteria>(request.OldSettings).Returns(new UpdateLeagueSettingsCriteria
        {
            Main_PrimaryProvider = "1",
            Main_SecondaryProvider = "2",
            EAR_PrimaryProvider = "1",
            EAR_SecondaryProvider = "2",
        });
        mapper.Map<UpdateLeagueSettingsCriteria>(request.NewSettings).Returns(new UpdateLeagueSettingsCriteria
        {
            Main_PrimaryProvider = "1,2",
            Main_SecondaryProvider = "2",
            EAR_PrimaryProvider = "1",
            EAR_SecondaryProvider = "2",
        });
        settingService.UpdateTimeSettingLeague(Arg.Any<TimeSettingRequest>()).Returns(updateWTResult);
        settingService.UpdateSettingLeague(Arg.Any<SettingLeagueRequest>()).Returns(updateASResult);

        // Act
        var result = await leagueSettingsService.UpdateLeagueSettings(request);

        // Assert
        logService.Received(1).WriteLog(Arg.Any<string>(), Arg.Any<int>());
        Assert.True(result.IsSuccessful);
    }
}