using Settlement.Core.Constants;
using Settlement.Sportsbook.Aio.Constants;
using Settlement.Sportsbook.Aio.Models;
using System;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Aio.Services
{
    public interface ICricketBetTypeService
    {
        void GroupBetTypesAndGenerateNames(List<MatchResultDetail> resultDetails, MatchDetail matchDetail);
    }

    public class CricketBetTypeService : ICricketBetTypeService
    {
        private readonly int MainResourceIdMaxLength = 2;

        private readonly int InnsBetTypeMinLength = 5;

        public void GroupBetTypesAndGenerateNames(List<MatchResultDetail> resultDetails, MatchDetail matchDetail)
        {
            resultDetails.ForEach((resultDetail) =>
            {
                if (resultDetail.ResourceId.Length > MainResourceIdMaxLength)
                {
                    GenerateBetTypeNameAndGroup(resultDetail, matchDetail);
                }
            });
        }

        private void GenerateBetTypeNameAndGroup(MatchResultDetail resultDetail, MatchDetail matchDetail)
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
                var betTypeId = Convert.ToInt32(resourceId.Substring(0, 5));
                resultDetail.BetTypeName = GetInnsBetTypeName(betTypeId, resourceId)
                                            .Replace("HOME_TEAM", matchDetail.HomeName.Trim())
                                            .Replace("AWAY_TEAM", matchDetail.AwayName.Trim());
                GroupInnsBetType(resultDetail, betTypeId);
                GetInnsBetTypeInputType(resultDetail, betTypeId);
            }
        }

        private string GetNonInnsBetTypeName(int betTypeId)
        {
            var betTypeName = string.Empty;
            if (BetType.CricketBetTypeNames.ContainsKey(betTypeId))
            {
                betTypeName = BetType.CricketBetTypeNames[betTypeId];
            }

            return betTypeName;
        }

        private string GetInnsBetTypeName(int betTypeId, string resourceId)
        {
            var betTypeName = string.Empty;
            if (BetType.CricketBetTypeNames.ContainsKey(betTypeId))
            {
                betTypeName = BetType.CricketBetTypeNames[betTypeId];
            }

            if (!string.IsNullOrEmpty(betTypeName))
            {
                if (GroupBetType.IncludedOvers.Contains(betTypeId))
                {
                    var betTypeOvers = Convert.ToInt32(resourceId.Substring(5, 3));
                    betTypeName = betTypeName.Replace("XXX", betTypeOvers.ToString());
                }
                else if (GroupBetType.IncludedOversAndBalls.Contains(betTypeId))
                {
                    var betTypeOvers = Convert.ToInt32(resourceId.Substring(5, 3));
                    var betTypeBalls = Convert.ToInt32(resourceId.Substring(8, 2));
                    betTypeName = betTypeName.Replace("XXX", betTypeOvers.ToString())
                                      .Replace("YYY", betTypeBalls.ToString());
                }
            }

            return betTypeName;
        }

        private void GroupNonInnsBetType(MatchResultDetail resultDetail, int betTypeId)
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

        private void GroupInnsBetType(MatchResultDetail resultDetail, int betTypeId)
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

        private void GetNonInnsBetTypeInputType(MatchResultDetail resultDetail, int betTypeId)
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

        private void GetInnsBetTypeInputType(MatchResultDetail resultDetail, int betTypeId)
        {
            if (InputType.CaughtOrNotGroup.Contains(betTypeId))
            {
                resultDetail.InputType = InputType.CaughtOrNot;
            }
            else
            {
                resultDetail.InputType = InputType.SingleScore;
            }
        }
    }
}
