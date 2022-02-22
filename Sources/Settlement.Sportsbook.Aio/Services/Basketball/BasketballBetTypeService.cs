using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Constants.Basketball;
using System;
using Settlement.Sportsbook.Aio.Models;
using ResultDetail = Settlement.Sportsbook.Aio.Models.ResultDetail;

namespace Settlement.Sportsbook.Aio.Services.Basketball
{
    public interface IBasketballBetTypeService
    {
        ResultDetail GetBetTypeNameAndGroup(ResultDetail item);

        ResultDetail CheckValue(ResultDetail item);
    }

    public class BasketballBetTypeServiceImp : IBasketballBetTypeService
    {
        private readonly IRefDataService refDataService;
        private readonly IGroupBetTypeService groupBetTypeService;

        public BasketballBetTypeServiceImp(IRefDataService refDataService,
            IGroupBetTypeService groupBetTypeService)
        {
            this.refDataService = refDataService;
            this.groupBetTypeService = groupBetTypeService;
        }

        public ResultDetail GetBetTypeNameAndGroup(ResultDetail item)
        {
            const int maxLength = 2;
            var resourceId = item.ResourceId;
            item.BetType = resourceId.Substring(0, maxLength + 1);
            item.BetTypeName = this.refDataService.GetBetTypeName(item.BetType, resourceId.Substring(maxLength + 1));
            GroupBasketballBetType(item);

            return item;
        }

        private void GroupBasketballBetType(ResultDetail resultDetail)
        {
            const int otherBetTypeLength = 3;
            const int halfBetTypeLength = 5;
            const int quarterBetTypeLength = 7;
            const int betTypeIndexLength = 2;
            var resourceId = resultDetail.ResourceId;
            var group = new GroupNameModel();
            if (resourceId.Length == otherBetTypeLength)
            {
                group = groupBetTypeService.GroupOtherBetType(resultDetail);
            }

            if (resourceId.Length == halfBetTypeLength)
            {
                var resourceIdHalfBetType =
                    SplitBetType(resultDetail.ResourceId, 0, halfBetTypeLength - betTypeIndexLength);
                group = IsHalfBetType(resourceIdHalfBetType)
                    ? groupBetTypeService.GroupHalfBetType(resourceIdHalfBetType)
                    : group;
            }

            if (resourceId.Length == quarterBetTypeLength)
            {
                var resourceIdQuarterBetType =
                    SplitBetType(resultDetail.ResourceId, 0, quarterBetTypeLength - betTypeIndexLength);
                group = IsQuarterBetType(resourceIdQuarterBetType)
                    ? groupBetTypeService.GroupQuarterBetType(resourceIdQuarterBetType)
                    : group;
            }

            resultDetail.GroupName = group.GroupName;
            resultDetail.GroupId = group.GroupId;
        }

        private static bool IsHalfBetType(int resourceId)
        {
            return GroupBetType.FirstHalf.Contains(resourceId) || GroupBetType.SecondHalf.Contains(resourceId);
        }

        private static bool IsQuarterBetType(int resourceId)
        {
            return GroupBetType.QuarterOne.Contains(resourceId)
                   || GroupBetType.QuarterTwo.Contains(resourceId)
                   || GroupBetType.QuarterThree.Contains(resourceId)
                   || GroupBetType.QuarterFour.Contains(resourceId);
        }

        public ResultDetail CheckValue(ResultDetail item)
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