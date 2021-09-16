using System;
using System.Collections.Generic;
using System.Linq;
using Settlement.Core.Constants;
using Settlement.Sportsbook.Aio.Constants;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Volleyball
{
    public class ChildMatchService : IMapperService
    {
        private readonly int confirmed = 3;

        private readonly int setted = 5;

        public void Decorate(dynamic obj)
        {
            var tuple = obj as Tuple<List<ChildMatchModel>, MatchDetail, List<ResultDetail>>;
            var childMatchAfterFilter = VerifyChildMatches(tuple.Item1, tuple.Item2, tuple.Item3);
            tuple.Item1.Clear();
            tuple.Item1.AddRange(childMatchAfterFilter);
        }

        private List<ChildMatchModel> VerifyChildMatches(List<ChildMatchModel> childMatches, MatchDetail matchDetail, List<ResultDetail> resultDetail)
        {
            return childMatches.Where(item => !item.EventStatus.Equals(EventStatus.Completed, StringComparison.CurrentCultureIgnoreCase)
                                              && !item.ResultSettingData.IsConfirmedRefund
                                              && VerifyMainMatchStatus(item, matchDetail, resultDetail)).OrderBy(child => child.ChildMatchType).ToList();
        }

        private bool VerifyMainMatchStatus(ChildMatchModel childMatch, MatchDetail matchDetail, List<ResultDetail> resultDetails)
        {
            var ftResult = resultDetails.FirstOrDefault(item => item.ResourceId == ResourceType.Final);
            if (!matchDetail.EventStatus.Equals(EventStatus.Completed, StringComparison.CurrentCultureIgnoreCase) || matchDetail.FinalHomeScore == null ||
                (ftResult.ResultStatusId != null && ftResult.ResultStatusId != setted && ftResult.ResultStatusId != confirmed) ||
                ftResult.ResultStatusId == null)
            {
                return true;
            }
            else
            {
                var setCompleted = int.Parse(ftResult.HomeValue) + int.Parse(ftResult.AwayValue);
                return ChildMatchConstant.ChildMatchValid[setCompleted].Contains(childMatch.ChildMatchType.ToString());
            }
        }
    }
}