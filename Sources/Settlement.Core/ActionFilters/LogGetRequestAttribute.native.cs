using Fanex.Logging;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Newtonsoft.Json;
using System.Text;

namespace Settlement.Core.ActionFilters;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class LogGetRequestAttribute : ActionFilterAttribute
{
    public override void OnActionExecuted(ActionExecutedContext context)
    {
        var logger = new Logger();
        var httpContext = context.HttpContext;
        var request = httpContext.Request;
        var stringBuilder = new StringBuilder();
        if (context.Result != null)
        {
            var objectResult = context.Result as OkObjectResult;
            var result = JsonConvert.SerializeObject(objectResult?.Value);
            stringBuilder.AppendLine($"Url ({request.GetDisplayUrl()}) get: {result}");
        }

        stringBuilder.AppendLine($"UserAgent: {request.Headers["User-Agent"]}");
        stringBuilder.AppendLine($"Username: {httpContext.User.Identity?.Name}");

        logger.Info(stringBuilder.ToString());

        base.OnActionExecuted(context);
    }
}