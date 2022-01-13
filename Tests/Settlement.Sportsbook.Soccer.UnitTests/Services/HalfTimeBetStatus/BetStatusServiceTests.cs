using NSubstitute;
using Settlement.Sportsbook.Soccer.Requests;
using Settlement.Sportsbook.Soccer.Services.HalfTimeBetStatus;
using Xunit;

namespace Settlement.Sportsbook.Soccer.UnitTests.Services.HalftimeBetStatus
{
    public class BetStatusServiceTests
    {
        private readonly IHalftimeService halftimeService;

        private readonly IBetStatusService service;

        public BetStatusServiceTests()
        {
            halftimeService = Substitute.For<IHalftimeService>();
            service = new BetStatusServiceImp(halftimeService);
        }

        [Fact]
        public void GetBetStatus_ExistHalftimeFgLg_CallAllRelatedMethods()
        {
            // Arrange
            var query = new SettleRequest
            {
                IsExistHtFgLg = true
            };

            // Act
            service.GetBetStatus(query);

            // Assert
            Received.InOrder(() =>
            {
                halftimeService.Received().GetBetStatusForCalculateHalfTime(Arg.Any<SettleRequest>());
                halftimeService.Received().ApplyNewBetStatusForHalfTime(Arg.Any<string>(), Arg.Any<string>());
            });
        }

        [Fact]
        public void GetBetStatus_NotExistHalftimeFgLg_OnlyCallApplyNewBetStatusForHalfTimeMethod()
        {
            // Arrange
            var query = new SettleRequest
            {
                IsExistHtFgLg = false
            };

            // Act
            service.GetBetStatus(query);

            // Assert
            halftimeService.Received().ApplyNewBetStatusForHalfTime(Arg.Any<string>(), Arg.Any<string>());
        }
    }
}