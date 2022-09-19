using Fanex.Logging;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Newtonsoft.Json;
using System.Text;

namespace Settlement.Core.ActionFilters
{
    public class LogGetRequestAttribute : ActionFilterAttribute
    {
        public override async void OnActionExecuted(ActionExecutedContext context)
        {
            var logger = new Logger();
            var httpContext = context.HttpContext;
            var request = httpContext.Request;
            var stringBuilder = new StringBuilder();
            stringBuilder.AppendLine($"Url: {request.GetDisplayUrl()}");
            stringBuilder.AppendLine($"UserAgent: {request.Headers["User-Agent"]}");
            stringBuilder.AppendLine($"Username: {httpContext.User.Identity?.Name}");
            if (context.Result != null)
            {
                var objectResult = context.Result as OkObjectResult;
                var result = JsonConvert.SerializeObject(objectResult?.Value);
                stringBuilder.AppendLine($"Get data: {result}");
            }
            await logger.InfoAsync(stringBuilder.ToString());

            base.OnActionExecuted(context);
        }
    }
}