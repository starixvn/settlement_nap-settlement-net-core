using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Cricket;

using Constants.Cricket;
using Settlement.Core.Models;

public interface InputTypeService
{
    int GetNonInnsBetTypeInputType(int betTypeId);

    int GetInnsBetTypeInputType(int betTypeId);

    SaveScoreModel GetInnsInputLabel(string resourceId, int betTypeId, List<InputOption> inputOptions);

    List<InputOption> GetInputOptions(int betTypeId, string resourceId, List<InputOption> inputOptions);
}

public class InputTypeServiceImp : InputTypeService
{
    private const int MaxPlayerSelected = 2;

    private const int OtherId = 856887;

    private const string OtherValue = "00";

    private const string OtherBetTypeName = "Other";

    public int GetNonInnsBetTypeInputType(int betTypeId)
    {
        if (InputType.HomeAwayGroup.Contains(betTypeId))
        {
            return InputType.HomeAway;
        }

        return InputType.CoupleScoresGroup.Contains(betTypeId) ? InputType.CoupleScores : InputType.SingleScore;
    }

    public int GetInnsBetTypeInputType(int betTypeId)
    {
        if (InputType.CaughtOrNotGroup.Contains(betTypeId))
        {
            return InputType.CaughtOrNot;
        }

        if (InputType.OneToSixGroup.Contains(betTypeId))
        {
            return InputType.OneToSix;
        }

        if (InputType.PlayerSelectGroup.Contains(betTypeId))
        {
            return InputType.PlayerSelect;
        }

        if (InputType.PlayerMultipleSelectGroup.Contains(betTypeId))
        {
            return InputType.PlayerMultipleSelect;
        }

        if (InputType.DismissalMethodGroup.Contains(betTypeId))
        {
            return InputType.DismissalMethod;
        }

        if (InputType.YesNoGroup.Contains(betTypeId))
        {
            return InputType.YesNo;
        }

        if (InputType.ScoreWithLabelGroup.Contains(betTypeId))
        {
            return InputType.ScoreWithLabel;
        }

        return InputType.CoupleScoresGroup.Contains(betTypeId) ? InputType.CoupleScores : InputType.SingleScore;
    }

    public SaveScoreModel GetInnsInputLabel(string resourceId, int betTypeId, List<InputOption> inputOptions)
    {
        if (GroupBetType.IncludedPlayerName.Contains(betTypeId))
        {
            var option = inputOptions.Find(option => option.ResourceId == resourceId);
            return new SaveScoreModel
            {
                HomeValue = option == null ? string.Empty : option.OptionName
            };
        }

        var playerNames = inputOptions.FindAll(option => option.ResourceId == resourceId);
        return new SaveScoreModel
        {
            HomeValue = playerNames.Count < MaxPlayerSelected ? string.Empty : playerNames[0].OptionName,
            AwayValue = playerNames.Count < MaxPlayerSelected ? string.Empty : playerNames[1].OptionName
        };
    }

    public List<InputOption> GetInputOptions(int betTypeId, string resourceId, List<InputOption> inputOptions)
    {
        var listOption = InputType.PlayerSelectGroup.Contains(betTypeId)
            ? inputOptions.FindAll(option => option.ResourceId == resourceId).Take(MaxPlayerSelected).ToList()
            : inputOptions.FindAll(option => option.ResourceId == resourceId);

        return InputType.OptionOtherGroup.Contains(betTypeId) ? AddOtherOption(listOption, resourceId) : listOption;
    }

    private static List<InputOption> AddOtherOption(List<InputOption> listOption, string resourceId)
    {
        var otherOptionIndex = listOption.FindIndex(option => option.Value == OtherValue);
        if (otherOptionIndex >= 0)
        {
            listOption.RemoveAt(otherOptionIndex);
        }

        var optionOther = new InputOption
        {
            PlayerId = OtherId,
            Value = OtherValue,
            OptionName = OtherBetTypeName,
            OddsInfo = $"{OtherValue},{OtherBetTypeName}",
            ResourceId = resourceId
        };

        listOption.Add(optionOther);

        return listOption;
    }
}