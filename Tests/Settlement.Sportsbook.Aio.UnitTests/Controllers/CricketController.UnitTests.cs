using AutoFixture;
using MediatR;
using Settlement.Sportsbook.Aio.Requests;
using System;
using System.Collections.Generic;
using System.Text;
using Xunit;

namespace Settlement.Sportsbook.Aio.UnitTests.Controllers
{
    public class CricketController
    {
        [Fact]
        public void GetMatch_Always_SendRequestByMediator()
        {
            var fixture = new Fixture();
            var mediator = fixture.Create<IMediator>();
            var request = new GetMatchRequest();
            var controller = new CricketController();

            controller.
        }
    }
}
