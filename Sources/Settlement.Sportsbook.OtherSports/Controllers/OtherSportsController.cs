using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Settlement.Sportsbook.OtherSports.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OtherSportsController : ControllerBase
    {
        private readonly IMediator mediator;

        public OtherSportsController(IMediator mediator)
        {
            this.mediator = mediator;
        }
    }
}