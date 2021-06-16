using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Fanex.NAP.Core.Web.Session;
using NSubstitute;
using NUnit.Framework;
using Settlement.Sportsbook.NewCalculation.Criterias;
using Settlement.Sportsbook.NewCalculation.Requests;
using Settlement.Sportsbook.NewCalculation.Services;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.NewCalculation.UnitTests.Services
{
    [TestFixture]
    public class SettlementActionsServiceTests
    {
        private SettlementActionsService service;

        [SetUp]
        public void SetUp()
        {
            Mapper.Reset();
            var config = new MapperConfigurationExpression();
            config.AddProfile<OtherSportsAutoMapper>();
            Mapper.Initialize(config);
        }

        [Test]
        public async Task Calculate_Always_ExecuteAndReturnResult()
        {
            var repository = Substitute.For<IDynamicRepository>();
            var currentSession = Substitute.For<ICurrentSession>();
            service = new SettlementActionsServiceImp(repository, currentSession);
            const int errorCode = 100;
            const string errorMsg = "Error Message";
            repository.ExecuteAsync(Arg.Do<CalculateCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMsg;
            })).Returns(1);
            var result = await service.Calculate(new CalculateRequest());

            Assert.AreEqual(false, result.IsSuccessful);
        }

        [Test]
        public async Task Refund_Always_ExecuteAndReturnResult()
        {
            var repository = Substitute.For<IDynamicRepository>();
            var currentSession = Substitute.For<ICurrentSession>();
            service = new SettlementActionsServiceImp(repository, currentSession);
            const int errorCode = 100;
            const string errorMsg = "Error Message";
            repository.ExecuteAsync(Arg.Do<RefundAllCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMsg;
            })).Returns(1);
            var result = await service.Refund(new RefundRequest());

            Assert.AreEqual(false, result.IsSuccessful);
        }

        [Test]
        public async Task RefundParlay_Always_ExecuteAndReturnResult()
        {
            var repository = Substitute.For<IDynamicRepository>();
            var currentSession = Substitute.For<ICurrentSession>();
            service = new SettlementActionsServiceImp(repository, currentSession);
            const int errorCode = 100;
            const string errorMsg = "Error Message";
            repository.ExecuteAsync(Arg.Do<ParlayCriteria>(x =>
            {
                x.ErrCode = errorCode;
                x.ErrMsg = errorMsg;
            })).Returns(1);
            var result = await service.RefundParlay(new RefundParlayRequest());

            Assert.AreEqual(false, result.IsSuccessful);
        }

        [Test]
        public async Task CheckMarkedTickets_Always_ExecuteAndReturnResult()
        {
            var repository = Substitute.For<IDynamicRepository>();
            var currentSession = Substitute.For<ICurrentSession>();
            service = new SettlementActionsServiceImp(repository, currentSession);
            repository.ExecuteAsync(Arg.Do<CheckingMarkedTicketsCriteria>(x =>
            {
                x.IsExistMarkedTicket = true;
            })).Returns(1);
            var result = await service.CheckMarkedTickets(new CheckingMarkedTicketsRequest());

            Assert.AreEqual(true, result.IsExistMarkedTicket);
        }
    }
}