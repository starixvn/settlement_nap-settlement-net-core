using Microsoft.AspNetCore.Http;
using Settlement.Core.Services;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.WebSites.Middleware
{
    public class ApiLoggingMiddleware
    {
        private readonly RequestDelegate next;

        private readonly ILoggingService loggingService;

        public ApiLoggingMiddleware(RequestDelegate next, ILoggingService loggingService)
        {
            this.next = next;
            this.loggingService = loggingService;
        }

        public async Task Invoke(HttpContext context)
        {
            var request = await FormatRequest(context.Request);
            loggingService.Info(request);
            await next(context);
            //var originalBodyStream = context.Response.Body;

            //using (var responseBody = new MemoryStream())
            //{
            //    context.Response.Body = responseBody;
            //    await next(context);
            //    var response = await FormatResponse(context.Response);

            //    var content = response;
            //    loggingService.Info(content);

            //    await responseBody.CopyToAsync(originalBodyStream);
            //}
        }

        private async Task<string> FormatRequest(HttpRequest request)
        {
            var body = request.Body;
            request.EnableBuffering();
            var buffer = new byte[Convert.ToInt32(request.ContentLength)];
            await request.Body.ReadAsync(buffer, 0, buffer.Length);
            var bodyAsText = Encoding.UTF8.GetString(buffer);
            request.Body = body;

            return $"{request.Scheme} {request.Host}{request.Path} {request.QueryString} {bodyAsText}";
        }

        private async Task<string> FormatResponse(HttpResponse response)
        {
            response.Body.Seek(0, SeekOrigin.Begin);
            string text = await new StreamReader(response.Body).ReadToEndAsync();
            response.Body.Seek(0, SeekOrigin.Begin);

            return $"{response.StatusCode}: {text}";
        }
    }
}
