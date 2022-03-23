using Settlement.Sportsbook.Aio.Constants;
using Settlement.Sportsbook.Aio.Models;
using System.Collections.Generic;
using System.Linq;

namespace Settlement.Sportsbook.Aio.Services.Cricket
{
    public interface IInputTypeService
    {
        int GetNonInnsBetTypeInputType(int betTypeId);

        int GetInnsBetTypeInputType(int betTypeId);

        SaveScoreModel GetInnsInputLabel(string resourceId, int betTypeId, List<InputOption> inputOptions);

        List<InputOption> GetInputOptions(int betTypeId, string resourceId, List<InputOption> inputOptions);
    }

    public class InputTypeServiceImp : IInputTypeService
    {
        private const int MaxPlayerSelected = 2;

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
            else if (InputType.OneToSixGroup.Contains(betTypeId))
            {
                return InputType.OneToSix;
            }
            else if (InputType.PlayerSelectGroup.Contains(betTypeId))
            {
                return InputType.PlayerSelect;
            }
            else if (InputType.PlayerMultipleSelectGroup.Contains(betTypeId))
            {
                return InputType.PlayerMultipleSelect;
            }
            else if (InputType.DismissalMethodGroup.Contains(betTypeId))
            {
                return InputType.DismissalMethod;
            }
            else if (InputType.YesNoGroup.Contains(betTypeId))
            {
                return InputType.YesNo;
            }
            else if (InputType.ScoreWithLabelGroup.Contains(betTypeId))
            {
                return InputType.ScoreWithLabel;
            }
            else if (InputType.CoupleScoresGroup.Contains(betTypeId))
            {
                return InputType.CoupleScores;
            }
            else
            {
                return InputType.SingleScore;
            }
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

        public List<InputOption> GetInputOptions(int betTypeId, string resourceId,  List<InputOption> inputOptions)
        {
            return InputType.PlayerSelectGroup.Contains(betTypeId) 
                ? inputOptions.FindAll(option => option.ResourceId == resourceId).Take(MaxPlayerSelected).ToList() 
                : inputOptions.FindAll(option => option.ResourceId == resourceId);
        }
    }
}
