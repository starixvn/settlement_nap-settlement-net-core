using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.Extensions.Options;
using Settlement.Models;
using Settlement.Services;

namespace Settlement.Setting.UnitTests.Services;

public class NotificationServiceTests
{
    private readonly IDynamicRepository repository;

    private readonly SendMailService sendMailService;

    private readonly NotificationService service;

    public NotificationServiceTests()
    {
        repository = Substitute.For<IDynamicRepository>();
        sendMailService = Substitute.For<SendMailService>();
        var refDataService = Substitute.For<IRefDataService>();
        var currentSession = Substitute.For<INapSession>();
        var appSetting = new AppSettingsKey { SiteDbServer = ["01", "02"] };
        var option = Options.Create(appSetting);
        service = new NotificationServiceImp(repository, option, refDataService, currentSession, sendMailService);
    }

    [Fact]
    public async Task NumberNotifications_NumberErrorIsZero_ReturnsZeroAndNotCallSendMail()
    {
        // Arrange
        repository.FetchAsync<NotificationModel>(Arg.Do<GetNumberOfNotificationCriteria>(x =>
        {
            x.NumberError = 0;
        })).Returns(new List<NotificationModel>());

        // Act
        var result = await service.NumberNotifications();

        // Assert
        Assert.True(result == 0);
        await repository.Received(2).FetchAsync<NotificationModel>(Arg.Any<GetNumberOfNotificationCriteria>());
        sendMailService.DidNotReceive().SendMail(Arg.Any<NotificationModel>());
    }

    [Fact]
    public async Task NumberNotifications_NumberErrorIsNotZero_ReturnsNumberErrorAndCallSendMail()
    {
        // Arrange
        repository.FetchAsync<NotificationModel>(Arg.Do<GetNumberOfNotificationCriteria>(x =>
        {
            x.NumberError = 1;
        })).Returns(new List<NotificationModel>{new ()
        {
            MatchId = 1
        }});

        // Act
        var result = await service.NumberNotifications();

        // Assert
        Assert.Equal(2, result);
        sendMailService.Received(2).SendMail(Arg.Is<NotificationModel>(item => item.MatchId == 1));
    }

    [Fact]
    public async Task IsNotificationsBetBuilder_Always_ReturnValueFromSp()
    {
        repository.GetAsync<bool>(Arg.Any<NotificationBetBuilderCriteria>()).Returns(true);

        var result = await service.IsNotificationsBetBuilder();

        Assert.True(result);
    }

    [Fact]
    public async Task ShowTopNotifications_Always_ReturnNumberAndNotification()
    {
        var data = (new List<int> { 1 }, new List<NotificationModel> { new() { MatchId = 1 } });
        repository.FetchMultipleAsync<int, NotificationModel>(Arg.Any<ShowTopNotificationCriteria>()).Returns(data);

        var actual = await service.ShowTopNotifications(1);

        Assert.True(actual.NumberError == 2 && actual.Notifications.Count == 2);
    }
}