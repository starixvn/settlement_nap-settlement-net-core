using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;
using Settlement.Sportsbook.MoveTickets.Requests;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.MoveTickets.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowOrigin")]
    [Authorize]
    public class MoveTicketController : ControllerBase
    {
        private readonly IMediator mediator;

        public MoveTicketController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [Route("get-match")]
        [HttpPost]
        [LogRequestResponse]
        public async Task<IActionResult> GetMatch(GetMatchRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("move-ticket")]
        [HttpPost]
        [LogRequestResponse]
        public async Task<IActionResult> MoveTicket(MoveTicketRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));

        [Route("get-child-match")]
        [HttpPost]
        public async Task<IActionResult> GetChildMatch(GetChildMatchRequest request) => Ok(await mediator.Send(request).ConfigureAwait(false));
    }
}