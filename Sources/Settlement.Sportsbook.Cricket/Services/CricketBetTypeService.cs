using Settlement.Core.Constants;
using Settlement.Sportsbook.Cricket.Constants;
using Settlement.Sportsbook.Cricket.Models;
using System;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Cricket.Services
{
    public interface ICricketBetTypeService
    {
        void GroupBetTypesAndGenerateNames(List<MatchResultDetail> resultDetails);
    }

    public class CricketBetTypeService : ICricketBetTypeService
    {
        private readonly int MainResourceIdMaxLength = 2;

        private readonly int InnsBetTypeMinLength = 5;

        public void GroupBetTypesAndGenerateNames(List<MatchResultDetail> resultDetails)
        {
            resultDetails.ForEach((resultDetail) =>
            {
                if (resultDetail.ResourceId.Length > MainResourceIdMaxLength)
                {
                    GenerateBetTypeNameAndGroup(resultDetail);
                }
            });
        }

        private void GenerateBetTypeNameAndGroup(MatchResultDetail resultDetail)
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
                var betTypeId = SplitBetType(resourceId, 0, 5);
                resultDetail.BetTypeName = GetInnsBetTypeName(betTypeId, resourceId);
                GroupInnsBetType(resultDetail, betTypeId);
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
                if (GroupBetType.IncludedOvers.Contains(betTypeId))
                {
                    var betTypeOvers = SplitBetType(resourceId, overPosition, overLength);
                    betTypeName = string.Format(betTypeName, betTypeOvers);
                }
                else if (GroupBetType.IncludedOversAndBalls.Contains(betTypeId))
                {
                    var betTypeOvers = SplitBetType(resourceId, overPosition, overLength);
                    var betTypeBalls = SplitBetType(resourceId, ballPosition, ballLength);
                    betTypeName = string.Format(betTypeName, betTypeOvers, betTypeBalls);
                }
            }

            return betTypeName;
        }

        private static void GroupNonInnsBetType(MatchResultDetail resultDetail, int betTypeId)
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
        }

        private static void GroupInnsBetType(MatchResultDetail resultDetail, int betTypeId)
        {
            if (GroupBetType.FirstInnsHome.Contains(betTypeId))
            {
                resultDetail.GroupId = GroupBetType.FirstInnsHomeId;
                resultDetail.GroupName = GroupBetType.FirstInnsHomeName;
            }
            else if (GroupBetType.FirstInnsAway.Contains(betTypeId))
            {
                resultDetail.GroupId = GroupBetType.FirstInnsAwayId;
                resultDetail.GroupName = GroupBetType.FirstInnsAwayName;
            }
            else if (GroupBetType.SecondInnsHome.Contains(betTypeId))
            {
                resultDetail.GroupId = GroupBetType.SecondInnsHomeId;
                resultDetail.GroupName = GroupBetType.SecondInnsHomeName;
            }
            else if (GroupBetType.SecondInnsAway.Contains(betTypeId))
            {
                resultDetail.GroupId = GroupBetType.SecondInnsAwayId;
                resultDetail.GroupName = GroupBetType.SecondInnsAwayName;
            }
        }

        private static void GetNonInnsBetTypeInputType(MatchResultDetail resultDetail, int betTypeId)
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

        private static void GetInnsBetTypeInputType(MatchResultDetail resultDetail, int betTypeId)
        {
            if (InputType.CaughtOrNotGroup.Contains(betTypeId))
            {
                resultDetail.InputType = InputType.CaughtOrNot;
            }
            else if (InputType.OneToSixGroup.Contains(betTypeId))
            {
                resultDetail.InputType = InputType.OneToSix;
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