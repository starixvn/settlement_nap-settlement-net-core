using Microsoft.AspNetCore.Mvc.Filters;
using Settlement.Core.Services;
using System;
using Microsoft.AspNetCore.Http.Extensions;
using System.Net.Http;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Settlement.Core.ActionFilters
{
    [AttributeUsage(AttributeTargets.Method)]
    public class LoggingFilterApiAttribute : ActionFilterAttribute
    {
        private readonly ILoggingService loggingService;

        public LoggingFilterApiAttribute()
        {
            loggingService = new LoggingService();
        }

        public async override void OnActionExecuted(ActionExecutedContext actionExecutedContext)
        {
            var context = actionExecutedContext.HttpContext;
            var request = context.Request;
            var stringBuilder = new StringBuilder();
            stringBuilder.AppendLine($"Url: {request.GetDisplayUrl()}");
            stringBuilder.AppendLine($"UserAgent: {request.Headers["User-Agent"].ToString()}");
            stringBuilder.AppendLine($"Username: {context.User.Identity.Name}");
            var objectResult = actionExecutedContext.Result as OkObjectResult;
            var result = JsonConvert.SerializeObject(objectResult.Value);
            stringBuilder.AppendLine($"Result: {result}");

            
            //var objectContent = actionExecutedContext.HttpContext.Response.Body. as ObjectContent;
            //if (objectContent != null)
            //{
            //    var content = await objectContent.ReadAsStringAsync();
            //    stringBuilder.Append($"InputStream: {content}");
            //}
            loggingService.Info(stringBuilder.ToString());

            base.OnActionExecuted(actionExecutedContext);
        }
    }
}
