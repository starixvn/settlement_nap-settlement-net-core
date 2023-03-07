using Fanex.Logging;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc.Filters;
using Newtonsoft.Json;
using System.Text;

namespace Settlement.Core.ActionFilters;

public class LogPushRequestAttribute : ActionFilterAttribute
{
    public override async void OnActionExecuting(ActionExecutingContext context)
    {
        var logger = new Logger();
        var model = context.ActionArguments;
        var serialString = JsonConvert.SerializeObject(model);
        var httpContext = context.HttpContext;
        var request = httpContext.Request;

        var stringBuilder = new StringBuilder();
        stringBuilder.AppendLine($"Url ({request.GetDisplayUrl()}) push: {serialString}");
        stringBuilder.AppendLine($"Username: {httpContext.User.Identity?.Name}");

        await logger.InfoAsync(stringBuilder.ToString());

        base.OnActionExecuting(context);
    }
}