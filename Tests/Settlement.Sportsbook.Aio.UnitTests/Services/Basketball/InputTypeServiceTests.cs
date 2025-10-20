using Settlement.Sportsbook.Aio.Services.Basketball;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Basketball;

public class InputTypeServiceTests
{
    private readonly IInputTypeService service = new InputTypeService();

    [Theory]
    [InlineData("653")]
    [InlineData("656")]
    [InlineData("659")]
    [InlineData("662")]
    [InlineData("665")]
    [InlineData("667")]
    [InlineData("669")]
    [InlineData("671")]
    [InlineData("673")]
    [InlineData("674")]
    public void GetInputType_TextBoxType_ReturnsSingleScore(string resourceId)
    {
        // Arrange & Act
        var result = service.GetInputType(resourceId);

        // Assert
        Assert.Equal(InputType.SingleScore, result);
    }

    [Theory]
    [InlineData("675")]
    [InlineData("676")]
    [InlineData("678")]
    [InlineData("677")]
    [InlineData("679")]
    public void GetInputType_YesNoNoneType_ReturnsYesNoNone(string resourceId)
    {
        // Arrange & Act
        var result = service.GetInputType(resourceId);

        // Assert
        Assert.Equal(InputType.YesNoNone, result);
    }

    [Theory]
    [InlineData("680")]
    [InlineData("681")]
    [InlineData("682")]
    [InlineData("683")]
    [InlineData("684")]
    [InlineData("123")]
    [InlineData("999")]
    public void GetInputType_OtherTypes_ReturnsPlayerNone(string resourceId)
    {
        // Arrange & Act
        var result = service.GetInputType(resourceId);

        // Assert
        Assert.Equal(InputType.PlayerNone, result);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void GetInputType_NullOrEmpty_ReturnsPlayerNone(string resourceId)
    {
        // Arrange & Act
        var result = service.GetInputType(resourceId);

        // Assert
        Assert.Equal(InputType.PlayerNone, result);
    }
}

