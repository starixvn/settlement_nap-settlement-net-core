using Fanex.Logging.Extensions;
using Microsoft.AspNetCore.Http.Extensions;
using ONEbook.UM.Services;
using ILogger = Fanex.Logging.ILogger;

namespace Settlement.WebSites.Middleware;

public class ErrorHandler(
    RequestDelegate next,
    ILogger logger,
    IConfiguration configuration,
    IMaintenanceService maintenanceService)
{

    public async Task InvokeAsync(HttpContext context)
    {
        var body = string.Empty;
        try
        {
            context.Request.EnableBuffering();
            body = await new StreamReader(context.Request.Body).ReadToEndAsync();
            context.Request.Body.Position = 0;

            await next(context);
        }
        catch (Exception exception)
        {
            await HandleException(context, exception, body);
        }
    }

    private Dictionary<string, object> GetRequestInfo(HttpContext context, string body)
    {
        return new Dictionary<string, object>
        {
            { "Url", context.Request.GetDisplayUrl() },
            { "Username", context.User.Identity?.Name },
            { "User IP", context.Request.Headers["X-Forwarded-For"] },
            { "Request Body", body }
        };
    }

    private async Task HandleException(HttpContext context, Exception exception, string body)
    {
        maintenanceService.RemoveUnderMaintenanceTimeCache();

        await WriteLog(context, exception, body);

        await WriteResponse(context, exception);
    }

    private async Task WriteLog(HttpContext context, Exception exception, string body)
    {
        try
        {
            var logMessage = new LogMessage(exception.Message)
                .AddSection("Request Info", GetRequestInfo(context, body))
                .AddSection("Server Info", CommonInfoGetters.GetServerInfo())
                .AddSection("Exception Info", CommonInfoGetters.GetExceptionInfo(exception))
                .ToString();

            await logger.ErrorAsync(logMessage);
        }
        catch
        {
        }
    }

    private async Task WriteResponse(HttpContext context, Exception exception)
    {
        try
        {
            var method = context.Request.Method.ToLowerInvariant();
            var requestedWith = context.Request.Headers["X-Requested-With"];

            if (context.Response.HasStarted)
            {
                return;
            }

            if (method is "post" or "put" or "delete" && requestedWith == "XMLHttpRequest")
            {
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            }

            await context.Response.WriteAsync(exception.Message);

            var env = configuration.GetSection("Fanex.NAP.Client:Environment").Value;

            if (exception.StackTrace != null && !env.Equals("LIVE", StringComparison.CurrentCultureIgnoreCase))
            {
                await context.Response.WriteAsync(Environment.NewLine);
                await context.Response.WriteAsync(exception.StackTrace);
            }
        }
        catch
        {
        }
    }
}
