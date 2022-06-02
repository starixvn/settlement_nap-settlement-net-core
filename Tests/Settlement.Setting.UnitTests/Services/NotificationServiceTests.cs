using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Settlement.Core.Services;
using Settlement.Setting.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
using NSubstitute;
using Xunit;
using Settlement.Setting.Criteria.Notification;
using Settlement.Setting.Models.Notification;

namespace Settlement.Setting.UnitTests.Services
{
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

            service = new NotificationServiceImp(repository, refDataService, currentSession, sendMailService);
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
            sendMailService.DidNotReceive().SendMail(Arg.Any<NotificationModel>());
        }

        [Fact]
        public async Task NumberNotifications_NumberErrorIsNotZero_ReturnsNumberErrorAndCallSendMail()
        {
            // Arrange
            repository.FetchAsync<NotificationModel>(Arg.Do<GetNumberOfNotificationCriteria>(x =>
            {
                x.NumberError = 1;
            })).Returns(new List<NotificationModel>{new NotificationModel
            {
                MatchId = 1
            }});

            // Act
            var result = await service.NumberNotifications();

            // Assert
            Assert.True(result > 0);
            sendMailService.Received().SendMail(Arg.Any<NotificationModel>());
        }
    }
}
