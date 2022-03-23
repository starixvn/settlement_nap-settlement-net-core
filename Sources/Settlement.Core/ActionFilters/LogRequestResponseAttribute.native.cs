using Fanex.Logging;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Newtonsoft.Json;
using System.Text;

namespace Settlement.Core.ActionFilters
{
    public class LogRequestResponseAttribute : ActionFilterAttribute
    {
        private readonly ILogger logger;

        public LogRequestResponseAttribute()
        {
            this.logger = new Logger();
        }

        public async override void OnActionExecuted(ActionExecutedContext actionExecutedContext)
        {
            var context = actionExecutedContext.HttpContext;
            var request = context.Request;
            var stringBuilder = new StringBuilder();
            stringBuilder.AppendLine($"Url: {request.GetDisplayUrl()}");
            stringBuilder.AppendLine($"UserAgent: {request.Headers["User-Agent"]}");
            stringBuilder.AppendLine($"Username: {context.User.Identity.Name}");
            if (actionExecutedContext.Result != null)
            {
                var objectResult = actionExecutedContext.Result as OkObjectResult;
                var result = JsonConvert.SerializeObject(objectResult.Value);
                stringBuilder.AppendLine(result);
            }
            await logger.InfoAsync(stringBuilder.ToString());

            base.OnActionExecuted(actionExecutedContext);
        }

        public async override void OnActionExecuting(ActionExecutingContext context)
        {
            var model = context.ActionArguments;
            var serialString = JsonConvert.SerializeObject(model);
            await logger.InfoAsync(serialString);

            base.OnActionExecuting(context);
        }
    }
}