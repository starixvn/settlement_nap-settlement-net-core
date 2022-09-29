using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Models;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using NSubstitute;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Constants;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using Settlement.Sportsbook.Aio.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;
using ResultDetail = Settlement.Sportsbook.Aio.Models.ResultDetail;

namespace Settlement.Sportsbook.Aio.UnitTests.Services
{
    public class MultipleServerAioServiceTests
    {
        private readonly IDynamicRepository repository;

        private readonly ScaleOutSettleService scaleOutSettleService;

        private readonly ICreateQueryService createQueryService;

        private readonly MergeDataService mergeDataService;

        private readonly MultipleServerAioService service;

        public MultipleServerAioServiceTests()
        {
            var appSetting = new AppSettingsKey { SiteDbServer = new List<string> { "01", "02" } };
            var option = Options.Create(appSetting);
            repository = Substitute.For<IDynamicRepository>();
            scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
            createQueryService = Substitute.For<ICreateQueryService>();
            mergeDataService = Substitute.For<MergeDataService>();
            service = new MultipleServerAioServiceImp(repository, option, scaleOutSettleService, createQueryService, mergeDataService);
        }

        [Theory]
        [InlineData(SettleType.Early, 1, 1, 0, 0, 0, 0, TicketStatus.Running)]
        [InlineData(SettleType.Early, 0, 0, 0, 0, 0, 0, TicketStatus.NoTicket)]
        [InlineData(SettleType.Early, 1, 0, 1, 1, 1, 1, TicketStatus.NoTicket)]
        [InlineData(SettleType.Early, 1, 0, 0, 1, 1, 1, TicketStatus.Marked)]
        [InlineData(SettleType.Early, 1, 0, 0, 0, 1, 1, TicketStatus.Calculated)]
        [InlineData(SettleType.Calculate, 1, 0, 0, 0, 0, 1, TicketStatus.Refunded)]
        [InlineData(SettleType.Early, 1, 0, 0, 0, 0, 1, TicketStatus.Calculated)]
        public async Task FetchResultDetails_Always_GenerateTicketStatus(string settleType, int betCount, int inRunning, int inWaiting, int BetMarkedCount, int betSettledCount, int betRefundedCount, string ticketStatus)
        {
            var resultDetail = new ResultDetail
            {
                BetCount = betCount,
                InWaiting = inWaiting,
                InRunning = inRunning,
                BetMarkedCount = BetMarkedCount,
                BetSettledCount = betSettledCount,
                BetRefundedCount = betRefundedCount,
                ResourceId = "00"
            };

            var ticketDetails = new List<ResultDetail> { resultDetail };
            var resultDetails = new List<ResultDetail> { new ResultDetail { ResourceId = "00" } };
            repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>())
                .Returns(resultDetails);

            repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
                .Returns((new List<ResultDetail>(), new List<TicketCounts>()));

            mergeDataService.MergeTicketDetails(Arg.Any<List<(List<ResultDetail>, TicketCounts)>>())
                .Returns((ticketDetails, new TicketCounts()));

            var (actualResultDetail, ticketCount) = await service.FetchResultDetails(new GetResultDetailCriteria { SettleType = settleType }, SportType.ESports);

            Assert.Equal(ticketStatus, actualResultDetail[0].TicketStatus);
        }

        [Fact]
        public async Task FetchResultDetails_ESportsNotExistTicketDetail_GenerateNoTicket()
        {
            var resultDetails = new List<ResultDetail> { new ResultDetail { ResourceId = "00" } };
            repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>())
                .Returns(resultDetails);

            repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
                .Returns((new List<ResultDetail>(), new List<TicketCounts>()));

            mergeDataService.MergeTicketDetails(Arg.Any<List<(List<ResultDetail>, TicketCounts)>>())
                .Returns((new List<ResultDetail>(), new TicketCounts()));

            var (actualResultDetail, ticketCount) = await service.FetchResultDetails(new GetResultDetailCriteria(), SportType.ESports);

            Assert.Equal(TicketStatus.NoTicket, actualResultDetail[0].TicketStatus);
        }

        [Fact]
        public async Task FetchResultDetails_NotESportsAndNotExistTicketDetail_DoNotReturnTicket()
        {
            var resultDetails = new List<ResultDetail> { new ResultDetail { ResourceId = "00" } };
            repository.FetchAsync<ResultDetail>(Arg.Any<GetResultDetailCriteria>())
                .Returns(resultDetails);

            repository.FetchMultipleAsync<ResultDetail, TicketCounts>(Arg.Any<GetTicketDetailsCriteria>())
                .Returns((new List<ResultDetail>(), new List<TicketCounts>()));

            mergeDataService.MergeTicketDetails(Arg.Any<List<(List<ResultDetail>, TicketCounts)>>())
                .Returns((new List<ResultDetail>(), new TicketCounts()));

            var (actualResultDetail, ticketCount) = await service.FetchResultDetails(new GetResultDetailCriteria(), SportType.Badminton);

            Assert.Empty(actualResultDetail);
        }

        [Theory]
        [InlineData(true, 1)]
        [InlineData(false, 2)]
        public async Task CheckMarkedTickets_Always_ReturnCorrectResult(bool result, byte executeTime)
        {
            await repository.ExecuteAsync(Arg.Do<CheckMarkedTicketsCriteria>(x =>
            {
                x.IsExistMarkedTicket = result;
            }));
            var request = new CheckMarkedTicketsRequest
            {
                MatchId = 12345,
                SelectedResources = new List<ResourceItem>()
            };

            var actual = await service.CheckMarkedTickets(request);

            Assert.Equal(result, actual.IsExistMarkedTicket);
            await repository.Received(executeTime).ExecuteAsync(Arg.Any<CheckMarkedTicketsCriteria>());
        }

        [Fact]
        public async Task Settle_ValidateFailed_ReturnErrorAndStopProcess()
        {
            var resultMessage = new ResultMessage
            {
                ErrorCode = 1,
                ErrorMessage = "Message"
            };
            scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(resultMessage);
            createQueryService.QuerySettle(Arg.Any<SettleRequest>()).Returns(new SettleCriteria { Action = "CAL" });

            var actual = await service.Settle(new SettleRequest());

            var expectResult = new Result
            {
                ErrCode = 1,
                ErrMsg = "Message",
                ChildMatchIds = string.Empty,
                ResultCommand = null
            };

            Assert.Equal(JsonConvert.SerializeObject(expectResult), JsonConvert.SerializeObject(actual));
        }

        [Fact]
        public async Task Settle_ValidatePassedAndExistChildMatch_ReturnListChildMatchIds()
        {
            var childMatch = new ChildMatch { matchId = 123 };
            var childMatchSecond = new ChildMatch { matchId = 456 };
            var request = new SettleRequest
            {
                SelectedResources = new List<ResourceItem>
                {
                    new ResourceItem { ResourceId = "00" }
                },
                SportType = SportType.Cricket
            };
            scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());
            createQueryService.QuerySettle(Arg.Any<SettleRequest>()).Returns(new SettleCriteria { Action = "CAL" });
            repository.FetchAsync<ChildMatch>(Arg.Any<GetChildMatchCriteria>()).Returns(new List<ChildMatch> { childMatch, childMatchSecond });
            var actual = await service.Settle(request);

            var expectResult = new Result
            {
                ErrCode = 0,
                ErrMsg = null,
                ChildMatchIds = "123,456",
                ResultCommand = new List<ResultCommand>()
            };

            Assert.Equal(JsonConvert.SerializeObject(expectResult), JsonConvert.SerializeObject(actual));
        }

        [Fact]
        public async Task Settle_ValidatePassed_CallInOrderAllRelatedMethods()
        {
            var request = new SettleRequest
            {
                SelectedResources = new List<ResourceItem>
                {
                    new ResourceItem { ResourceId = "00" }
                }
            };
            scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());
            createQueryService.QuerySettle(Arg.Any<SettleRequest>()).Returns(new SettleCriteria { Action = "CAL" });
            await repository.ExecuteAsync(Arg.Do<SettleCriteria>(x => x.ServiceCommand = "mock"));
            scaleOutSettleService.GetSiteGroupId(Arg.Any<string>()).Returns(1, 2);

            var actual = await service.Settle(request);

            await scaleOutSettleService.Received()
                .UpdateUnderSettlementFlag(Arg.Any<int>(), Arg.Any<int>(), Arg.Any<string>());
            await scaleOutSettleService.Received().UpdateMatchInfo(Arg.Any<UpdateMatchInfoRequest>());
            await repository.Received(2).ExecuteAsync(Arg.Any<SettleCriteria>());
            Assert.Equal(1, actual.ResultCommand[0].SiteDbGroupId);
            Assert.Equal(2, actual.ResultCommand[1].SiteDbGroupId);
            Assert.Equal("mock", actual.ResultCommand[0].ServiceCommand);
            Assert.Equal("mock", actual.ResultCommand[1].ServiceCommand);
        }

        [Fact]
        public async Task SettleChildMatch_ExistChildMatchItem_SettleForEachChildMatch()
        {
            var request = new SettleChildMatchRequest
            {
                ChildMatches = new List<ChildMatchModel>
                {
                    new ChildMatchModel { MatchId = 1 },
                    new ChildMatchModel { MatchId = 2 }
                },
                SelectedResources = new List<ResourceItem>
                {
                new ResourceItem { ResourceId = "00" }
            }
            };
            scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());
            createQueryService.QuerySettleChildMatch(Arg.Any<SettleChildMatchRequest>()).Returns(new SettleCriteria { Action = "CAL" });
            createQueryService.CreateResourceChildMatch(Arg.Any<ChildMatchModel>()).Returns("");

            await service.SettleChildMatch(request);

            await repository.Received(4).ExecuteAsync(Arg.Any<SettleCriteria>());
            createQueryService.Received(2).WriteLogChildMatch(Arg.Any<SettleCriteria>(), Arg.Any<Result>());
        }

        [Fact]
        public async Task SettleChildMatch_ExistListChildMatchIds_SettleForEachChildMatch()
        {
            var request = new SettleChildMatchRequest
            {
                ChildMatchIds = "123,456",
                SelectedResources = new List<ResourceItem>
                {
                    new ResourceItem { ResourceId = "00" }
                }
            };
            scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());
            createQueryService.QuerySettleChildMatch(Arg.Any<SettleChildMatchRequest>()).Returns(new SettleCriteria { Action = "CAL" });
            createQueryService.CreateResources(Arg.Any<List<ResourceItem>>()).Returns("");

            await service.SettleChildMatch(request);

            await repository.Received(4).ExecuteAsync(Arg.Any<SettleCriteria>());
        }
    }
}