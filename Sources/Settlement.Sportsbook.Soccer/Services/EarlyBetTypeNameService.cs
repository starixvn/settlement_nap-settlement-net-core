using Settlement.Core.Services;
using System;
using System.Collections.Generic;
using static Settlement.Core.Constants.BetType;

namespace Settlement.Sportsbook.Soccer.Services
{
    public interface EarlyBetTypeNameService
    {
        int GetGroupMap(int betTypeId, string resourceId);

        string GetBetTypeName(int betTypeId, string resourceId);
    }

    public class EarlyBetTypeNameServiceImp : EarlyBetTypeNameService
    {
        private readonly IRefDataService refDataService;
        private const int PenaltyShootoutRound1Group = 1;
        private const int PenaltyShootoutRound2Group = 2;
        private const int PenaltyShootoutRound3Group = 3;
        private const int PenaltyShootoutRound4Group = 4;
        private const int PenaltyShootoutRound5Group = 5;

        private const int PenaltyShootoutSuddenDeadGroup = 8;

        private static Dictionary<int, List<string>> PenaltyShootoutRound => new Dictionary<int, List<string>>
        {
            { PenaltyShootoutRound1Group, new List<string> { "38201", "38101", "38301", "38401", "38501" }},
            { PenaltyShootoutRound2Group, new List<string> { "38202", "38102", "38302", "38402", "38502" }},
            { PenaltyShootoutRound3Group, new List<string> { "38203", "38103", "38303", "38403", "38503" }},
            { PenaltyShootoutRound4Group, new List<string> { "38204", "38104", "38304", "38404", "38504" }},
            { PenaltyShootoutRound5Group, new List<string> { "38205", "38105", "38305", "38405", "38505" }}
        };

        public EarlyBetTypeNameServiceImp(IRefDataService refDataService)
        {
            this.refDataService = refDataService;
        }

        public int GetGroupMap(int betTypeId, string resourceId)
        {
            var isCorner = (betTypeId == SoccerBetType.TimeOfFirstCorner) || (betTypeId == SoccerBetType.TimeOfSecondCorner);
            var isGoal = (betTypeId == SoccerBetType.ExtraTimeNextGoal) || (betTypeId == SoccerBetType.FirstGoalMethod) || (betTypeId == SoccerBetType.TimeOfFirstGoal);
            return isGoal || isCorner ? OtherGroup(betTypeId) : PenaltyShootoutGroup(betTypeId, resourceId);
        }

        private static int GetPenaltyShootoutRound(string resourceId)
        {
            if (Convert.ToInt32(Round(resourceId)) > PenaltyShootoutRound5Group)
            {
                return PenaltyShootoutSuddenDeadGroup;
            }
            else
            {
                foreach (KeyValuePair<int, List<string>> item in PenaltyShootoutRound)
                {
                    if (item.Value.Contains(resourceId))
                    {
                        return item.Key;
                    }
                }

                return 0;
            }
        }

        private static int PenaltyShootoutGroup(int betTypeId, string resourceId)
        {
            const int penaltyShootoutFirstTen = 6;

            switch (betTypeId)
            {
                case SoccerBetType.PenaltyShootoutOddEven:
                case SoccerBetType.PenaltyShootoutExactTotalGoals:
                case SoccerBetType.HomePenaltyShootoutOverUnder:
                case SoccerBetType.AwayPenaltyShootoutOverUnder:
                case SoccerBetType.PenaltyShootoutCombo:
                    return penaltyShootoutFirstTen;

                case SoccerBetType.PenaltyShootoutSuddenDead:
                    return PenaltyShootoutSuddenDeadGroup;

                default:
                    return GetPenaltyShootoutRound(resourceId);
            }
        }

        private static int OtherGroup(int betTypeId)
        {
            const int extraTimeNextGoalGroup = 7;
            const int goalGroup = 9;
            const int cornerGroup = 10;
            switch (betTypeId)
            {
                case SoccerBetType.ExtraTimeNextGoal:
                    return extraTimeNextGoalGroup;

                case SoccerBetType.FirstGoalMethod:
                case SoccerBetType.TimeOfFirstGoal:
                    return goalGroup;

                default:
                    return cornerGroup;
            }
        }

        public string GetBetTypeName(int betTypeId, string resourceId)
        {
            switch (betTypeId)
            {
                case SoccerBetType.ExtraTimeNextGoal:
                    return $"Goal {Convert.ToUInt32(Round(resourceId))}";

                case SoccerBetType.PenaltyShootoutBothOneNeither:
                case SoccerBetType.PenaltyShootout1X2:
                case SoccerBetType.PenaltyWoodwork:
                case SoccerBetType.HomePenaltyShootout:
                case SoccerBetType.AwayPenaltyShootout:
                    return refDataService.GetBetTypeName(betTypeId, Round(resourceId));

                case SoccerBetType.HomePenaltyShootoutOverUnder:
                    return "Penalty Shootout First 10 - Home Score";

                case SoccerBetType.AwayPenaltyShootoutOverUnder:
                    return "Penalty Shootout First 10 - Away Score";

                default:
                    return refDataService.GetBetTypeName(betTypeId);
            }
        }

        private static string Round(string resourceId)
        {
            const int pos = 3;
            const int maxLength = 2;
            return resourceId.Substring(pos, maxLength);
        }
    }
}