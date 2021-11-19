using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;

namespace Settlement.Sportsbook.Soccer.Controllers
{
    [ApiController]
    [Route("soccer/[controller]")]
    [SessionAuthorize]
    public class SoccerController : ControllerBase
    {
        private readonly IMediator mediator;

        public SoccerController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [Route("get-match")]
        [HttpPost]
        [LogRequestResponse]
        public async Task<IActionResult> GetMatch(GetMatchRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
    }
}