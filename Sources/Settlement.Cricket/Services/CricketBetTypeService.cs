using Settlement.Core.Constants;
using Settlement.Sportsbook.Aio.Constants;
using Settlement.Sportsbook.Aio.Models;
using System;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Aio.Services
{
    public interface ICricketBetTypeService
    {
        void GroupBetTypesAndGenerateNames(List<MatchResultDetail> resultDetails);
    }

    public class CricketBetTypeService : ICricketBetTypeService
    {
        public void GroupBetTypesAndGenerateNames(List<MatchResultDetail> resultDetails)
        {
            resultDetails.ForEach((resultDetail) =>
            {
                resultDetail.BetTypeName = GetBetTypeName(resultDetail.BetType, resultDetail.ResourceId);
                GetGroupBetType(resultDetail);
            });
        }

        private string GetBetTypeName(string betType, string resourceId)
        {
            var betTypeId = Convert.ToInt32(betType);
            var betTypeName = string.Empty;
            if (BetType.CricketBetTypeNames.ContainsKey(betTypeId))
            {
                betTypeName = BetType.CricketBetTypeNames[betTypeId];
            }

            if (!string.IsNullOrEmpty(betTypeName))
            {
                var resourceGroup = resourceId.Substring(0, 4);
                int betTypeOvers;
                switch (resourceGroup)
                {
                    case "9410":
                    case "9411":
                    case "9428":
                    case "9429":
                    case "9434":
                    case "9435":
                    case "9484":
                    case "9485":
                        betTypeOvers = Convert.ToInt32(resourceId.Substring(5, 3));
                        betTypeName = betTypeName.Replace("XXX", betTypeOvers.ToString());
                        break;
                    case "9422":
                    case "9423":
                    case "9490":
                    case "9491":
                        betTypeOvers = Convert.ToInt32(resourceId.Substring(5, 3));
                        var betTypeBalls = Convert.ToInt32(resourceId.Substring(8, 2));
                        betTypeName = betTypeName.Replace("XXX", betTypeOvers.ToString())
                                          .Replace("YYY", betTypeBalls.ToString());
                        break;
                }
            }

            return betTypeName;
        }

        private void GetGroupBetType(MatchResultDetail resultDetail)
        {
            var betTypeId = Convert.ToInt32(resultDetail.BetType);
            if (GroupBetType.ExactBetTypes.Contains(betTypeId))
            {
                resultDetail.GroupId = GroupBetType.ExactId;
                resultDetail.GroupName = GroupBetType.ExactName;
            }
            else if (GroupBetType.WinnerLoserBetTypes.Contains(betTypeId))
            {
                resultDetail.GroupId = GroupBetType.WinnerLoserId;
                resultDetail.GroupName = GroupBetType.WinnerLoserName;
            }
            else if (GroupBetType.OverUnderBetTypes.Contains(betTypeId))
            {
                resultDetail.GroupId = GroupBetType.OverUnderId;
                resultDetail.GroupName = GroupBetType.OverUnderName;
            }
            else if (GroupBetType.OddEvenBetTypes.Contains(betTypeId))
            {
                resultDetail.GroupId = GroupBetType.OddEvenId;
                resultDetail.GroupName = GroupBetType.OddEvenName;
            }
            else if (GroupBetType.FancyBetTypes.Contains(betTypeId))
            {
                resultDetail.GroupId = GroupBetType.FancyId;
                resultDetail.GroupName = GroupBetType.FancyName;
            }
            else
            {
                resultDetail.GroupId = GroupBetType.MainId;
            }
        }
    }
}
