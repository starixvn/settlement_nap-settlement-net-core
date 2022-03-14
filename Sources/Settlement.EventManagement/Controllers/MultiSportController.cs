using System;
using System.Threading;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Settlement.EventManagement.Models;
using Settlement.Core.ActionResults;
using Settlement.EventManagement.Requests;

namespace Settlement.EventManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MultiSportController : ControllerBase
    {
        private readonly IMediator mediator;

        public MultiSportController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpGet]
        [Route("get-date")]
        public IActionResult GetDate()
        {
            var respond = new DateSelection
            {
                FromDate = Convert.ToDateTime(DateTime.Now.AddDays(-1).ToShortDateString()),
                ToDate = DateTime.Today
            };

            return Ok(respond);
        }

        [HttpPost]
        [Route("filter")]
        public async Task<IActionResult> Filter(FilterMultiSportRequest request)
        {
            var matches = await mediator.Send(request).ConfigureAwait(false);
            return new MessagePackResult<MultiSportModel>(matches);
        }

        //[HttpPost]
        //[Route("auto-refresh")]
        //public async Task<IActionResult> RefreshMatches(RefreshMatchesRequest request)
        //{
        //    var matches = await mediator.Send(request).ConfigureAwait(false);

        //    return new MessagePackResult<IList<MultiSportMatchWaiting>>(matches);
        //}

        [HttpPost]
        [Route("getSport")]
        public async Task<IActionResult> GetSports(SportRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [HttpPost]
        [Route("getLeague")]
        public async Task<IActionResult> GetLeagues(LeagueRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
    }
}