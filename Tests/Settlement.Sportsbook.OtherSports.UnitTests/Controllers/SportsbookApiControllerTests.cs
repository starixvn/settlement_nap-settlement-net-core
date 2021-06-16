using NSubstitute;
using NUnit.Framework;
using Settlement.Core.Models;
using Settlement.Sportsbook.NewCalculation.Controllers;
using Settlement.Sportsbook.NewCalculation.Models;
using Settlement.Sportsbook.NewCalculation.Requests;
using Settlement.Sportsbook.NewCalculation.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http.Results;

namespace Settlement.Sportsbook.NewCalculation.UnitTests.Controllers
{
    [TestFixture]
    public class SportsbookApiControllerTests
    {
        private SportsbookApiController controller;

        private SportsbookService sportsbookService;

        private SettlementActionsService settlementActionsService;

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            sportsbookService = Substitute.For<SportsbookService>();
            settlementActionsService = Substitute.For<SettlementActionsService>();
            controller = Helper.GetController<SportsbookApiController>(sportsbookService, settlementActionsService);
        }

        [Test]
        public async Task GetMatch_Always_ReturnOtherSportsMatchModel()
        {
            // Arrange
            sportsbookService.GetMatch(Arg.Any<GetMatchRequest>()).Returns(new MatchResultDetail());

            // Act
            var result = await controller.GetMatch(new GetMatchRequest()) as OkNegotiatedContentResult<OtherSportsMatchModel>;

            // Assert
            Assert.IsInstanceOf(typeof(OtherSportsMatchModel), result.Content);
        }

        [Test]
        public async Task Calculate_Always_ReturnResult()
        {
            // Arrange
            settlementActionsService.Calculate(Arg.Any<CalculateRequest>()).Returns(new Result());

            // Act
            var result = await controller.Calculate(new CalculateRequest()) as OkNegotiatedContentResult<Result>;

            // Assert
            Assert.IsInstanceOf(typeof(Result), result.Content);
        }

        [Test]
        public async Task Refund_Always_ReturnResult()
        {
            // Arrange
            settlementActionsService.Refund(Arg.Any<RefundRequest>()).Returns(new Result());

            // Act
            var result = await controller.Refund(new RefundRequest()) as OkNegotiatedContentResult<Result>;

            // Assert
            Assert.IsInstanceOf(typeof(Result), result.Content);
        }

        [Test]
        public async Task RefundParlay_Always_ReturnResult()
        {
            // Arrange
            settlementActionsService.RefundParlay(Arg.Any<RefundParlayRequest>()).Returns(new Result());

            // Act
            var result = await controller.RefundParlay(new RefundParlayRequest()) as OkNegotiatedContentResult<Result>;

            // Assert
            Assert.IsInstanceOf(typeof(Result), result.Content);
        }

        [Test]
        public async Task CheckMarkedTickets_Always_ReturnMarkedTicketsModel()
        {
            // Arrange
            settlementActionsService.CheckMarkedTickets(Arg.Any<CheckingMarkedTicketsRequest>()).Returns(new MarkedTicketsModel());

            // Act
            var result = await controller.CheckMarkedTickets(new CheckingMarkedTicketsRequest()) as OkNegotiatedContentResult<MarkedTicketsModel>;

            // Assert
            Assert.IsInstanceOf(typeof(MarkedTicketsModel), result.Content);
        }
    }
}