using Fanex.Data.Repository;
using Fanex.NAP.Client;
using Settlement.Core.Criteria;
using Log = Fanex.Logging.LogService;

namespace Settlement.Core.Services;

public interface LogService
{
    Task WriteLog(int matchId, string message);

    Task WriteLog(string message, int actionId);

    Task WriteLog(InsertLogCriteria criteria);

    Task ActionLog(int matchId, string message, int actionId);

    Task WriteLog(LogCriteria criteria);
}

public class LogServiceImp(IDynamicRepository repository, INapSession session) : LogService
{
    public async Task ActionLog(int matchId, string message, int actionId)
    {
        var criteria = new LogCriteria(matchId, message, actionId, session.UserId);
        await repository.ExecuteAsync(criteria);
    }

    public async Task WriteLog(int matchId, string message)
    {
        try
        {
            var criteria = new LogDirectlyCriteria
            {
                Extend = matchId,
                Doing = message,
                UserId = session.UserId
            };

            await repository.ExecuteAsync(criteria);
        }
        catch (Exception e)
        {
            await Log.ErrorAsync("Settlement.WebSites(Write Log Directly): ", e);
        }
    }

    public async Task WriteLog(InsertLogCriteria criteria)
    {
        try
        {
            if (!criteria.IsHedgeMatch)
            {
                await repository.ExecuteAsync(criteria);
            }
        }
        catch (Exception e)
        {
            await Log.ErrorAsync("Settlement.WebSites(Write resettle Log): ", e);
        }
    }

    public async Task WriteLog(string message, int actionId)
    {
        var criteria = new LogCriteria(message, actionId, session.UserId);
        await repository.ExecuteAsync(criteria);
    }

    public async Task WriteLog(LogCriteria criteria)
    {
        await repository.ExecuteAsync(criteria);
    }
}