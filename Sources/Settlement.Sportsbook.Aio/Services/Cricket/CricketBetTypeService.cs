using Settlement.Core.Constants;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Constants;
using System;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Aio.Services.Cricket
{
    public interface ICricketBetTypeService
    {
        void GroupBetTypesAndGenerateNames(List<ResultDetail> resultDetails);
    }

    public class CricketBetTypeService : ICricketBetTypeService
    {
        private readonly int InnsBetTypeMinLength = 5;

        public void GroupBetTypesAndGenerateNames(List<ResultDetail> resultDetails)
        {
            resultDetails.ForEach((resultDetail) =>
            {
                GenerateBetTypeNameAndGroup(resultDetail);
            });
        }

        private void GenerateBetTypeNameAndGroup(ResultDetail resultDetail)
        {
            var resourceId = resultDetail.ResourceId;
            if (resourceId.Length < InnsBetTypeMinLength)
            {
                var betTypeId = Convert.ToInt32(resourceId);
                resultDetail.BetTypeName = GetNonInnsBetTypeName(betTypeId);
                GroupNonInnsBetType(resultDetail, betTypeId);
                GetNonInnsBetTypeInputType(resultDetail, betTypeId);
            }
            else
            {
                var betTypeId = SplitBetType(resourceId, 0, 4);
                resultDetail.BetTypeName = GetInnsBetTypeName(betTypeId, resourceId);
                GroupInnsBetType(resultDetail, betTypeId, resourceId);
                GetInnsBetTypeInputType(resultDetail, betTypeId);
            }
        }

        private static string GetNonInnsBetTypeName(int betTypeId)
        {
            var betTypeName = string.Empty;
            if (BetType.CricketBetTypeNames.ContainsKey(betTypeId))
            {
                betTypeName = BetType.CricketBetTypeNames[betTypeId];
            }

            return betTypeName;
        }

        private static string GetInnsBetTypeName(int betTypeId, string resourceId)
        {
            var betTypeName = string.Empty;
            if (BetType.CricketBetTypeNames.ContainsKey(betTypeId))
            {
                betTypeName = BetType.CricketBetTypeNames[betTypeId];
            }

            if (!string.IsNullOrEmpty(betTypeName))
            {
                const int overPosition = 5;
                const int overLength = 3;
                const int ballPosition = 8;
                const int ballLength = 2;
                const int numberOfInnsPosition = 4;
                const int numberOfInnsLength = 1;
                var numberOfInns = SplitBetType(resourceId, numberOfInnsPosition, numberOfInnsLength);
                var innsOrdinal = numberOfInns == 1 ? "1st" : "2nd";
                if (GroupBetType.IncludedOvers.Contains(betTypeId))
                {
                    var betTypeOvers = SplitBetType(resourceId, overPosition, overLength);
                    betTypeName = string.Format(betTypeName, innsOrdinal, betTypeOvers);
                }
                else if (GroupBetType.IncludedOversAndBalls.Contains(betTypeId))
                {
                    var betTypeOvers = SplitBetType(resourceId, overPosition, overLength);
                    var betTypeBalls = SplitBetType(resourceId, ballPosition, ballLength);
                    betTypeName = string.Format(betTypeName, innsOrdinal, betTypeOvers, betTypeBalls);
                }
                else if (GroupBetType.IncludedPlayerName.Contains(betTypeId))
                {
                    //TODO
                }
                else if (GroupBetType.IncludedTwoPlayerName.Contains(betTypeId))
                {
                    //TODO
                }
                else
                {
                    betTypeName = string.Format(betTypeName, innsOrdinal);
                }
            }

            return betTypeName;
        }

        private static void GroupNonInnsBetType(ResultDetail resultDetail, int betTypeId)
        {
            if (GroupBetType.Other.Contains(betTypeId))
            {
                resultDetail.GroupId = GroupBetType.OtherId;
                resultDetail.GroupName = GroupBetType.OtherName;
            }
            else if (GroupBetType.MatchBetType.Contains(betTypeId))
            {
                resultDetail.GroupId = GroupBetType.MatchBetTypeId;
                resultDetail.GroupName = GroupBetType.MatchBetTypeName;
            }
            else
            {
                // do  not thing
            }
        }

        private static void GroupInnsBetType(ResultDetail resultDetail, int betTypeId, string resourceId)
        {
            const int numberOfInnsPosition = 4;
            const int numberOfInnsLength = 1;
            var numberOfInns = SplitBetType(resourceId, numberOfInnsPosition, numberOfInnsLength);
            if (GroupBetType.InnsHome.Contains(betTypeId))
            {
                resultDetail.GroupId = numberOfInns == 1 ? GroupBetType.FirstInnsHomeId : GroupBetType.SecondInnsHomeId;
                resultDetail.GroupName = numberOfInns == 1 ? GroupBetType.FirstInnsHomeName : GroupBetType.SecondInnsHomeName;
            }
            else if (GroupBetType.InnsAway.Contains(betTypeId))
            {
                resultDetail.GroupId = numberOfInns == 1 ? GroupBetType.FirstInnsAwayId : GroupBetType.SecondInnsAwayId;
                resultDetail.GroupName = numberOfInns == 1 ? GroupBetType.FirstInnsAwayName : GroupBetType.SecondInnsAwayName;
            }
            else if (GroupBetType.Other.Contains(betTypeId))
            {
                resultDetail.GroupId = GroupBetType.OtherId;
                resultDetail.GroupName = GroupBetType.OtherName;
            }
            else
            {
                // do  not thing
            }
        }

        private static void GetNonInnsBetTypeInputType(ResultDetail resultDetail, int betTypeId)
        {
            if (InputType.HomeAwayGroup.Contains(betTypeId))
            {
                resultDetail.InputType = InputType.HomeAway;
            }
            else if (InputType.CoupleScoresGroup.Contains(betTypeId))
            {
                resultDetail.InputType = InputType.CoupleScores;
            }
            else
            {
                resultDetail.InputType = InputType.SingleScore;
            }
        }

        private static void GetInnsBetTypeInputType(ResultDetail resultDetail, int betTypeId)
        {
            if (InputType.CaughtOrNotGroup.Contains(betTypeId))
            {
                resultDetail.InputType = InputType.CaughtOrNot;
            }
            else if (InputType.OneToSixGroup.Contains(betTypeId))
            {
                resultDetail.InputType = InputType.OneToSix;
            }
            else if (InputType.PlayerSelectGroup.Contains(betTypeId))
            {
                resultDetail.InputType = InputType.PlayerSelect;
            }
            else if (InputType.PlayerMultipleSelectGroup.Contains(betTypeId))
            {
                resultDetail.InputType = InputType.PlayerMultipleSelect;
            }
            else if (InputType.DismissalMethodGroup.Contains(betTypeId))
            {
                resultDetail.InputType = InputType.DismissalMethod;
            }
            else if (InputType.YesNoGroup.Contains(betTypeId))
            {
                resultDetail.InputType = InputType.YesNo;
            }
            else
            {
                resultDetail.InputType = InputType.SingleScore;
            }
        }

        private static int SplitBetType(string resourceId, int startIndex, int length)
        {
            return Convert.ToInt32(resourceId.Substring(startIndex, length));
        }
    }
}