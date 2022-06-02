using Fanex.NAP.Client.Configuration;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.NAP.Client.Services;
using Fanex.NAP.Core.Business;
using NSubstitute;
using Settlement.ThirdPartyProducts.Services;
using Xunit;
using PermissionService = Settlement.ThirdPartyProducts.Services.PermissionService;

namespace Settlement.ThirdPartyProducts.UnitTests.Services
{
    public class BetBuilderPermissionServiceTests
    {
        private readonly PermissionService service;

        private readonly INapSession session;

        private readonly IUserService userService;


        public BetBuilderPermissionServiceTests()
        {
            session = Substitute.For<INapSession>();
            userService = Substitute.For<IUserService>();
            var siteSettings = Substitute.For<INapSettings>();
            service = new BetBuilderPermissionServiceImp(session, userService, siteSettings);
        }

        [Fact]
        public void Permission_Always_ReturnsFalse()
        {
            // Act
            userService.IsHavingPermission(Arg.Any<int>(), Arg.Any<int>(), Arg.Any<string>(),
                Arg.Any<Constant.Policy>()).Returns(false);
            var permission = service.Permission;

            // Assert
            Assert.False(permission.CanCalculate);
            Assert.False(permission.CanViewSettlementLog);
        }

        [Fact]
        public void ReadPermission_Always_ReturnsTrue()
        {
            // Act
            session.UserId = 1;
            userService.IsHavingPermission(Arg.Any<int>(), Arg.Any<int>(), Arg.Any<string>(),
                Arg.Any<Constant.Policy>()).Returns(true);
            var permission = service.Permission;

            // Assert
            Assert.True(permission.CanCalculate);
            Assert.True(permission.CanViewSettlementLog);
        }
    }
}