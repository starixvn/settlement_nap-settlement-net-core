using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Constants.Basketball;
using Settlement.Sportsbook.Aio.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Services.Basketball
{
    public interface IBasketballBetTypeService
    {
        MatchResultDetail GetBetTypeNameAndGroup(MatchResultDetail item);
        MatchResultDetail CheckValue(MatchResultDetail item);
    }

    public class BasketballBetTypeServiceImp : IBasketballBetTypeService
    {
        private const int MaxLength = 2;
        private const int otherBetTypeLength = 3;
        private const int halfBetTypeLength = 5;
        private const int quarterBetTypeLength = 7;
        private const int betTypeIndexLength = 2;
        private readonly RefDataService refDataService;

        public BasketballBetTypeServiceImp(RefDataService refDataService)
        {
            this.refDataService = refDataService;
        }

        public MatchResultDetail GetBetTypeNameAndGroup(MatchResultDetail item)
        {
            var resourceId = item.ResourceId;
            item.BetType = resourceId.Substring(0, MaxLength + 1);
            item.BetTypeName = this.refDataService.GetBetTypeName(item.BetType, resourceId.Substring(MaxLength + 1));
            GroupBasketballBetType(item);

            return item;
        }

        private void GroupBasketballBetType(MatchResultDetail resultDetail)
        {
            
            var resourceId = resultDetail.ResourceId;
            if (resourceId.Length == otherBetTypeLength)
            {
                GroupOtherBetType(resultDetail);
            }
            else if (resourceId.Length == quarterBetTypeLength || resourceId.Length == halfBetTypeLength)
            {
                GroupHalfBetType(resultDetail);
                GroupQuarterBetType(resultDetail);
            }
        }

        private void GroupOtherBetType(MatchResultDetail resultDetail)
        {
            var resourceId = Convert.ToInt32(resultDetail.ResourceId);
            if (GroupBetType.Other.Contains(resourceId))
            {
                resultDetail.GroupId = GroupBetType.OtherId;
                resultDetail.GroupName = GroupBetType.OtherName;
            }
        }

        private void GroupHalfBetType(MatchResultDetail resultDetail)
        {
            var resourceId = SplitBetType(resultDetail.ResourceId, 0, halfBetTypeLength - betTypeIndexLength);
            if (GroupBetType.FirstHalf.Contains(resourceId))
            {
                resultDetail.GroupId = GroupBetType.FirstHalfId;
                resultDetail.GroupName = GroupBetType.FirstHalfName;
            }
            else if (GroupBetType.SecondHalf.Contains(resourceId))
            {
                resultDetail.GroupId = GroupBetType.SecondHalfId;
                resultDetail.GroupName = GroupBetType.SecondHalfName;
            }
        }

        private void GroupQuarterBetType(MatchResultDetail resultDetail)
        {
            var resourceId = SplitBetType(resultDetail.ResourceId, 0, quarterBetTypeLength - betTypeIndexLength);
            if (GroupBetType.QuarterOne.Contains(resourceId))
            {
                resultDetail.GroupId = GroupBetType.QuarterOneId;
                resultDetail.GroupName = GroupBetType.QuarterOneName;
            }
            else if (GroupBetType.QuarterTwo.Contains(resourceId))
            {
                resultDetail.GroupId = GroupBetType.QuarterTwoId;
                resultDetail.GroupName = GroupBetType.QuarterTwoName;
            }
            else if (GroupBetType.QuarterThree.Contains(resourceId))
            {
                resultDetail.GroupId = GroupBetType.QuarterThreeId;
                resultDetail.GroupName = GroupBetType.QuarterThreeName;
            }
            else if (GroupBetType.QuarterFour.Contains(resourceId))
            {
                resultDetail.GroupId = GroupBetType.QuarterFourId;
                resultDetail.GroupName = GroupBetType.QuarterFourName;
            }
        }

        public MatchResultDetail CheckValue(MatchResultDetail item)
        {
            item.HomeValue ??= "";
            item.AwayValue ??= "";
            return item;
        }

        private static int SplitBetType(string resourceId, int startIndex, int length)
        {
            return Convert.ToInt32(resourceId.Substring(startIndex, length));
        }
    }
}
