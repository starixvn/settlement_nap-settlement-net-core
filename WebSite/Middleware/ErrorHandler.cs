using Fanex.Logging.Extensions;
using Fanex.Logging.Extensions.Database;
using Microsoft.AspNetCore.Http.Extensions;
using ONEbook.UM.Services;
using ILogger = Fanex.Logging.ILogger;

namespace Settlement.WebSites.Middleware;

public class ErrorHandler
{
    private readonly RequestDelegate next;
    private readonly ILogger logger;
    private readonly IMaintenanceService maintenanceService;
    public IConfiguration Configuration { get; }

    public ErrorHandler(RequestDelegate next, ILogger logger, IConfiguration configuration, IMaintenanceService maintenanceService)
    {
        this.next = next;
        this.logger = logger;
        this.maintenanceService = maintenanceService;
        Configuration = configuration;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            await HandleException(context, exception);
        }
    }

    private static Dictionary<string, object> GetRequestInfo(HttpContext context)
    {
        return new Dictionary<string, object>
        {
            { "Url", context.Request.GetDisplayUrl() },
            { "Username", context.User.Identity?.Name },
            { "User IP", context.Request.Headers["X-Forwarded-For"] },
        };
    }

    private async Task HandleException(HttpContext context, Exception exception)
    {
        maintenanceService.RemoveUnderMaintenanceTimeCache();

        var logMessage = new LogMessage(exception.Message)
                    .AddSection("Request Info", GetRequestInfo(context))
                    .AddSection("Database Info", DatabaseInfoGetters.GetDbExceptionInfo(exception))
                    .AddSection("Server Info", CommonInfoGetters.GetServerInfo())
                    .AddSection("Exception Info", CommonInfoGetters.GetExceptionInfo(exception))
                    .ToString();

        await logger.ErrorAsync(logMessage);

        var method = context.Request.Method.ToLowerInvariant();
        var requestedWith = context.Request.Headers["X-Requested-With"];

        if ((method == "post" || method == "put" || method == "delete") && requestedWith == "XMLHttpRequest")
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        }

        await context.Response.WriteAsync(exception.Message);

        var env = Configuration.GetSection("Fanex.NAP.Client:Environment").Value;

        if (!env.Equals("LIVE", StringComparison.CurrentCultureIgnoreCase))
        {
            await context.Response.WriteAsync(Environment.NewLine);
            await context.Response.WriteAsync(exception.StackTrace);
        }
    }
}