using MediatR;
using Microsoft.AspNetCore.Mvc;
using Settlement.Setting.Requests.Notification;

namespace Settlement.Setting.Controllers;

[ApiController]
[Route("api/[controller]")]

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
    public async Task<IActionResult> TopNotification(int top) => Ok(await mediator.Send(new TopNotificationRequest { Top = top }).ConfigureAwait(false));

    [HttpGet]
    [Route("get-notification-bet-builder")]
    public async Task<IActionResult> GetNotificationBetBuilder() => Ok(await mediator.Send(new NotificationBetBuilderRequest()).ConfigureAwait(false));
}