using Settlement.Sportsbook.Aio.Constants.Basketball;

namespace Settlement.Sportsbook.Aio.Services.Basketball;

public enum InputType
{
    SingleScore,
    YesNoNone,
    PlayerNone
}

public interface IInputTypeService
{
    InputType GetInputType(string resourceId);
}

public class InputTypeService : IInputTypeService
{
    public InputType GetInputType(string resourceId)
    {
        return resourceId switch
        {
            var _ when GroupBetType.TextBoxType.Contains(resourceId) => InputType.SingleScore,
            var _ when GroupBetType.YesNoNoneType.Contains(resourceId) => InputType.YesNoNone,
            _ => InputType.PlayerNone,
        };
    }
}
