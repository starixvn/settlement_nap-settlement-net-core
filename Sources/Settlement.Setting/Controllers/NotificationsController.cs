using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.ActionFilters;
using Settlement.Setting.Requests.Notification;

namespace Settlement.Setting.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [SessionAuthorize]
    public class NotificationsController : ControllerBase
    {
        private readonly IMediator mediator;

        public NotificationsController(IMediator mediator)
        {
            this.mediator = mediator;
        }

        [HttpGet]
        [Route("get-notification")]
        public async Task<IActionResult> GetNotification() => Ok(await mediator.Send(new ShowNotificationRequest()).ConfigureAwait(false));

        [HttpGet]
        [Route("top-notification")]
        public async Task<IActionResult> TopNotification(int top) => Ok(await mediator.Send(new TopNotificationRequest{ Top = top }).ConfigureAwait(false));

    }
}
