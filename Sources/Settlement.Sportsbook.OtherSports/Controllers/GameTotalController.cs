using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Settlement.Sportsbook.OtherSports.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GameTotalController : ControllerBase
    {
        private readonly IMediator mediator;

        public GameTotalController(IMediator mediator)
        {
            this.mediator = mediator;
        }
    }
}