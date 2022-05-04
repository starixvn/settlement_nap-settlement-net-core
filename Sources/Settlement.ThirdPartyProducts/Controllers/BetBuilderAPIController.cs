using Fanex.NAP.Core.Business;
using Fanex.NAP.Core.Web.Attribute;
using MediatR;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.Core.Configuration;
using Settlement.Mvc.ActionFilter;
using Settlement.Mvc.ActionResults;
using System;
using System.Threading.Tasks;
using System.Web.Http;

namespace Settlement.ThirdPartyProducts.Controllers
{
    [RoutePrefix("api/bet-builder")]
    public class BetBuilderApiController : ApiController
    {
        private readonly IMediator mediator;

        public BetBuilderApiController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpGet]
        [Route("get-date")]
        public IHttpActionResult GetDate()
        {
            var respond = new DateSelection
            {
                FromDate = Convert.ToDateTime(DateTime.Now.AddDays(-1).ToShortDateString()),
                ToDate = DateTime.Today
            };

            return Ok(respond);
        }

        [HttpPost]
        [Route("search")]
        [NapAPIAuth(FunctionKey = SettlementFunctionKeys.BetBuilder)]
        public async Task<IHttpActionResult> Search(FilterRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [HttpPost, CompressFilter]
        [Route("refresh-matches")]
        [NapAPIAuth(FunctionKey = SettlementFunctionKeys.BetBuilder)]
        public async Task<IHttpActionResult> RefreshMatches(MatchesWaitingRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [HttpPost]
        [Route("get-leagues")]
        [NapAPIAuth(FunctionKey = SettlementFunctionKeys.BetBuilder)]
        public async Task<IHttpActionResult> GetLeagues(LeaguesRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [HttpPost]
        [Route("get-sports")]
        public async Task<IHttpActionResult> GetSports(SportRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [HttpPost]
        [Route("get-selection")]
        [NapAPIAuth(FunctionKey = SettlementFunctionKeys.BetBuilder)]
        public async Task<IHttpActionResult> GetSelection(GetSelectionRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [HttpPost, LoggingFilter]
        [Route("settle")]
        [NapAPIAuth(FunctionKey = SettlementFunctionKeys.BetBuilder, Policy = Constant.Policy.Host)]
        public async Task<IHttpActionResult> Settle(CalculateRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [HttpPost]
        [Route("get-match")]
        [NapAPIAuth(FunctionKey = SettlementFunctionKeys.BetBuilder)]
        public async Task<IHttpActionResult> GetMatch(MatchInfoRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [HttpGet]
        [Route("get-notification")]
        public async Task<JsonActionResult> GetNotification() => new JsonActionResult
        {
            Data = await mediator.Send(new GetNotificationRequest()).ConfigureAwait(false)
        };
    }
}