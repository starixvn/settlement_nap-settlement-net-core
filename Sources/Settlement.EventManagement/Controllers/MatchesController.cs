using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;
using MediatR;
using System.Threading.Tasks;
using System;

namespace Settlement.EventManagement.Controllers
{
    [ApiController]
    [Route("api/matches")]
    [SessionAuthorize]
    public class MatchesController : ControllerBase
    {
        private readonly IMediator mediator;

        public MatchesController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        //[HttpPost]
        //[Route("filter")]
        //public async Task<IActionResult> Filter(FilterCalculateRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));


        [HttpGet]
        [Route("filter")]
        public async Task<IActionResult> Filter()
        {
            var request = new FilterMatchRequest
            {
                SportType = 1,
                FromDate = Convert.ToDateTime(DateTime.Now.AddDays(-1).ToShortDateString()),
                ToDate = DateTime.Today,
            };
            return Ok(await mediator.Send(request).ConfigureAwait(false));
        }
    }
}
