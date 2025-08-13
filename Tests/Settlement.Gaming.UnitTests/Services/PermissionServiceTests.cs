using Fanex.NAP.Client;
using Fanex.NAP.Client.Configuration;
using Fanex.NAP.Client.Helpers.Business;
using Fanex.NAP.Client.Services;
using NSubstitute;
using Settlement.Core.Configurations;
using Settlement.Gaming.Services.NumberGame;

namespace Settlement.Gaming.UnitTests.Services;

public class NumberGamePermissionServiceTests
{
    private readonly INapSession session = Substitute.For<INapSession>();
    private readonly IUserService userService = Substitute.For<IUserService>();
    private readonly INapSettings siteSettings = Substitute.For<INapSettings>();
    private readonly NumberGamePermissionServiceImp service;

    public NumberGamePermissionServiceTests()
    {
        session.UserId.Returns(123);
        siteSettings.SiteId.Returns(456);
        service = new NumberGamePermissionServiceImp(session, userService, siteSettings);
    }

    [Fact]
    public void Permission_ReturnsCorrectPermissions_WhenUserHasPermissions()
    {
        // Arrange
        userService.IsHavingPermission(123, 456, SettlementFunctionKeys.NgResettleMatchBeforeYesterday, Constant.Policy.Host).Returns(true);
        userService.IsHavingPermission(123, 456, SettlementFunctionKeys.NumberGameRecalculate, Constant.Policy.Host).Returns(true);
        userService.IsHavingPermission(123, 456, SettlementFunctionKeys.ViewLogSettlement, Constant.Policy.Read).Returns(true);

        // Act
        var permission = service.Permission;

        // Assert
        Assert.True(permission.CanItAdmin);
        Assert.True(permission.CanCalculate);
        Assert.True(permission.CanViewSettlementLog);
    }

    [Fact]
    public void Permission_ReturnsFalse_WhenUserDoesNotHavePermissions()
    {
        // Arrange
        userService.IsHavingPermission(123, 456, SettlementFunctionKeys.NgResettleMatchBeforeYesterday, Constant.Policy.Host).Returns(false);
        userService.IsHavingPermission(123, 456, SettlementFunctionKeys.NumberGameRecalculate, Constant.Policy.Host).Returns(false);
        userService.IsHavingPermission(123, 456, SettlementFunctionKeys.ViewLogSettlement, Constant.Policy.Read).Returns(false);

        // Act
        var permission = service.Permission;

        // Assert
        Assert.False(permission.CanItAdmin);
        Assert.False(permission.CanCalculate);
        Assert.False(permission.CanViewSettlementLog);
    }

    [Fact]
    public void Permission_ReturnsFalse_WhenUserIdIsZero()
    {
        // Arrange
        session.UserId.Returns(0);

        // Act
        var permission = service.Permission;

        // Assert
        Assert.False(permission.CanItAdmin);
        Assert.False(permission.CanCalculate);
        Assert.False(permission.CanViewSettlementLog);
    }
}
