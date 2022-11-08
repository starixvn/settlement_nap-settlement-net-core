using Settlement.Core.Constants;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Volleyball;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Volleyball
{
    public class ChildMatchServiceTests
    {
        private readonly ChildMatchService service;

        private ResultDetail resultDetail;

        public ChildMatchServiceTests()
        {
            service = new ChildMatchService();
            resultDetail = new ResultDetail
            {
                ResourceId = ResourceType.Final
            };
        }

        [Fact]
        public void Decorate_Always_ReturnChildMatchRunningAndNotConfirmedRefund()
        {
            var list = new List<ChildMatchModel>
            {
                new ChildMatchModel {EventStatus = EventStatus.Completed},
                new ChildMatchModel {EventStatus = EventStatus.Running ,ResultSetting = 2},
                new ChildMatchModel {EventStatus = EventStatus.Running}
            };

            var listResult = new List<ResultDetail> { resultDetail };
            var tuple = Tuple.Create(list, listResult);

            service.Decorate(tuple);

            Assert.Single(list);
        }

        [Fact]
        public void Decorate_Always_ReturnChildMatchRelatedSet()
        {
            var list = new List<ChildMatchModel>
            {
                new ChildMatchModel {EventStatus = EventStatus.Running, ChildMatchType = 12},
                new ChildMatchModel {EventStatus = EventStatus.Running, ChildMatchType = 11},
                new ChildMatchModel {EventStatus = EventStatus.Running, ChildMatchType = 16}
            };
            resultDetail.HomeValue = "0";
            resultDetail.AwayValue = "2";
            resultDetail.ResultStatusId = 5;
            var listResult = new List<ResultDetail> { resultDetail };

            var tuple = Tuple.Create(list, listResult);

            service.Decorate(tuple);

            Assert.Equal(2, list.Count);
        }
    }
}