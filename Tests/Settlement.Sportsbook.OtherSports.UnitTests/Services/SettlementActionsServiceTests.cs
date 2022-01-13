using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using NSubstitute;
using Settlement.Sportsbook.OtherSports.Criteria;
using Settlement.Sportsbook.OtherSports.Requests;
using Settlement.Sportsbook.OtherSports.Services;
using System.Threading.Tasks;
using Xunit;

namespace Settlement.Sportsbook.OtherSports.UnitTests.Services
{
    public class SettlementActionsServiceTests
    {
        private readonly IDynamicRepository repository;

        private readonly SettlementActionsService service;

        private readonly INapSession currentSession;

        private readonly IHttpContextAccessor accessor;

        public SettlementActionsServiceTests()
        {
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<OtherSportsAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            var mapper = new Mapper(config);
            repository = Substitute.For<IDynamicRepository>();
            currentSession = Substitute.For<INapSession>();
            accessor = Substitute.For<IHttpContextAccessor>();
            var context = new DefaultHttpContext();
            context.Connection.RemoteIpAddress = new System.Net.IPAddress(1);
            accessor.HttpContext = context;

            service = new SettlementActionsServiceImp(repository, accessor, currentSession, mapper);
        }

        [Fact]
        public async Task Calculate_Always_ExecuteAndReturnResult()
        {
            const int errorCode = 100;
            const string errorMsg = "Error Message";
            await repository.ExecuteAsync(Arg.Do<CalculateCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMsg;
            }));
            var result = await service.Calculate(new CalculateRequest());

            Assert.False(result.IsSuccessful);
        }

        [Fact]
        public async Task Refund_Always_ExecuteAndReturnResult()
        {
            const int errorCode = 100;
            const string errorMsg = "Error Message";
            await repository.ExecuteAsync(Arg.Do<RefundAllCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMsg;
            }));
            var result = await service.Refund(new RefundRequest());

            Assert.False(result.IsSuccessful);
        }

        [Fact]
        public async Task RefundParlay_Always_ExecuteAndReturnResult()
        {
            const int errorCode = 100;
            const string errorMsg = "Error Message";
            await repository.ExecuteAsync(Arg.Do<ParlayCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMsg;
            }));
            var result = await service.RefundParlay(new RefundParlayRequest());

            Assert.False(result.IsSuccessful);
        }

        [Fact]
        public async Task CheckMarkedTickets_Always_ExecuteAndReturnResult()
        {
            await repository.ExecuteAsync(Arg.Do<CheckingMarkedTicketsCriteria>(x =>
            {
                x.IsExistMarkedTicket = true;
            }));
            var result = await service.CheckMarkedTickets(new CheckingMarkedTicketsRequest());

            Assert.True(result.IsExistMarkedTicket);
        }
    }
}