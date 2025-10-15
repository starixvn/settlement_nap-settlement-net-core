using Fanex.NAP.Client;
using Fanex.NAP.Client.Configuration;
using Fanex.NAP.Client.Helpers.Business;
using Fanex.NAP.Client.Services;
using NSubstitute;
using Settlement.Core.Configurations;
using Settlement.Outright.Services;

namespace Settlement.Sportsbook.Outright.UnitTests.Services;

public class OutrightPermissionServiceTests
{
    private readonly INapSession session;

    private readonly IUserService userService;

    private readonly OutrightPermissionService service;

    public OutrightPermissionServiceTests()
    {
        session = Substitute.For<INapSession>();
        userService = Substitute.For<IUserService>();
        var siteSettings = Substitute.For<INapSettings>();
        service = new OutrightPermissionServiceImp(session, userService, siteSettings);
    }

    [Fact]
    public void Permission_Always_ReturnPermissionFromService()
    {
        session.UserId = 1;
        userService.IsHavingPermission(session.UserId, Arg.Any<int>(), SettlementFunctionKeys.OutrightCalculate,
            Constant.Policy.Host).Returns(true);

        Assert.True(service.Permission.CanCalculateOutright);
        Assert.False(service.Permission.CanUncalculateOutright);
    }
}