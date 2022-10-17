using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using NSubstitute;
using Settlement.Sportsbook.OtherSports.Services;

namespace Settlement.Sportsbook.OtherSports.UnitTests.Services
{
    public class SettlementActionsServiceTests
    {
        private readonly IDynamicRepository repository;

        private readonly SettlementActionsService service;

        private readonly MultipleServerService multipleServerService;

        private readonly IBetStatusService betStatusService;

        public SettlementActionsServiceTests()
        {
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<OtherSportsAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);
            repository = Substitute.For<IDynamicRepository>();
            var currentSession = Substitute.For<INapSession>();
            betStatusService = Substitute.For<IBetStatusService>();
            multipleServerService = Substitute.For<MultipleServerService>();
            var accessor = Substitute.For<IHttpContextAccessor>();
            var context = new DefaultHttpContext
            {
                Connection =
                {
                    RemoteIpAddress = new System.Net.IPAddress(1)
                }
            };
            accessor.HttpContext = context;

            service = new SettlementActionsServiceImp(repository, accessor, currentSession, mapper, betStatusService, multipleServerService);
        }

        //[Fact]
        //public async Task Calculate_Always_ExecuteAndReturnResult()
        //{
        //    const int errorCode = 100;
        //    const string errorMsg = "Error Message";
        //    await repository.ExecuteAsync(Arg.Do<CalculateCriteria>(x =>
        //    {
        //        x.ErrCode = errorCode;
        //        x.ErrMsg = errorMsg;
        //    }));
        //    var result = await service.Calculate(new CalculateRequest());

        //    Assert.False(result.IsSuccessful);
        //}

        //[Fact]
        //public async Task Refund_Always_ExecuteAndReturnResult()
        //{
        //    const int errorCode = 100;
        //    const string errorMsg = "Error Message";
        //    await repository.ExecuteAsync(Arg.Do<RefundCriteria>(x =>
        //    {
        //        x.ErrCode = errorCode;
        //        x.ErrMsg = errorMsg;
        //    }));
        //    var result = await service.Refund(new RefundRequest());

        //    Assert.False(result.IsSuccessful);
        //}

        //[Fact]
        //public async Task Refund_ExistHedgeMatch_ExecuteTwoTime()
        //{
        //    var request = new RefundRequest
        //    {
        //        HedgeMatchId = 1
        //    };
        //    await service.Refund(request);

        //    await repository.Received(2).ExecuteAsync(Arg.Any<RefundCriteria>());
        //}

        //[Fact]
        //public async Task RefundParlay_Always_ExecuteAndReturnResult()
        //{
        //    const int errorCode = 100;
        //    const string errorMsg = "Error Message";
        //    await repository.ExecuteAsync(Arg.Do<ParlayCriteria>(x =>
        //    {
        //        x.ErrCode = errorCode;
        //        x.ErrMsg = errorMsg;
        //    }));
        //    var result = await service.RefundParlay(new RefundParlayRequest());

        //    Assert.False(result.IsSuccessful);
        //}

        //[Fact]
        //public async Task RefundParlay_ExistHedgeMatch_ExecuteTwoTime()
        //{
        //    var request = new RefundParlayRequest
        //    {
        //        HedgeMatchId = 1
        //    };
        //    await service.RefundParlay(request);

        //    await repository.Received(2).ExecuteAsync(Arg.Any<ParlayCriteria>());
        //}

        //[Fact]
        //public async Task CheckMarkedTickets_Always_ExecuteAndReturnResult()

        //{
        //    await repository.ExecuteAsync(Arg.Do<CheckingMarkedTicketsCriteria>(x =>
        //    {
        //        x.IsExistMarkedTicket = true;
        //    }));
        //    var result = await service.CheckMarkedTickets(new CheckingMarkedTicketsRequest());

        //    Assert.True(result.IsExistMarkedTicket);
        //}

        //[Fact]
        //public async Task CalculateWithResultDetail_Always_CreateCriteriaAndExecute()
        //{
        //    const int errorCode = 100;
        //    const string errorMsg = "Error Message";
        //    betStatusService.GenerateBetStatus(Arg.Any<CalculateRequest>()).Returns(new ScoreSetModel());
        //    await repository.ExecuteAsync(Arg.Do<CalculateCriteria>(x =>
        //    {
        //        x.ErrCode = errorCode;
        //        x.ErrMsg = errorMsg;
        //    }));
        //    var result = await service.CalculateWithResultDetail(new CalculateRequest { Action = ActionType.RefundHalfTime });

        //    Assert.False(result.IsSuccessful);
        //}

        //[Fact]
        //public async Task CalculateWithResultDetail_ExistHedgeMatch_ExecuteTwoTime()
        //{
        //    betStatusService.GenerateBetStatus(Arg.Any<CalculateRequest>()).Returns(new ScoreSetModel());
        //    await service.CalculateWithResultDetail(new CalculateRequest { Action = ActionType.RefundHalfTime, HedgeMatchId = 1 });

        //    await repository.Received(2).ExecuteAsync(Arg.Any<CalculateCriteria>());
        //}
    }
}