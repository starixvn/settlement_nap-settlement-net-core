using Microsoft.AspNetCore.Mvc;
using Settlement.Setting.Requests.Notification;

namespace Settlement.Setting.Controllers;

[ApiController]
[Route("api/[controller]")]

public class NotificationsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [Route("get-notification")]
    public async Task<IActionResult> GetNotification() => Ok(await mediator.Send(new ShowNotificationRequest()).ConfigureAwait(false));

    [HttpGet]
    [Route("top-notification")]
    public async Task<IActionResult> TopNotification(int top) => Ok(await mediator.Send(new TopNotificationRequest { Top = top }).ConfigureAwait(false));

    [HttpGet]
    [Route("get-notification-bet-builder")]
    public async Task<IActionResult> GetNotificationBetBuilder() => Ok(await mediator.Send(new NotificationBetBuilderRequest()).ConfigureAwait(false));


    [HttpGet]
    [Route("get-notification-outright")]
    public async Task<IActionResult> GetNotificationOutright() => Ok(await mediator.Send(new NotificationOutrightRequest()).ConfigureAwait(false));
}