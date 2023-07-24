using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Settlement.Core.Criteria;

namespace Settlement.Core.Services;

public interface LogService
{
    void WriteLog(int matchId, string message);

    void ActionLog(int matchId, string message, int actionId);
}

public class LogServiceImp : LogService
{
    private readonly IDynamicRepository repository;

    private readonly INapSession session;

    public LogServiceImp(IDynamicRepository repository, INapSession session)
    {
        this.repository = repository;
        this.session = session;
    }

    public void ActionLog(int matchId, string message, int actionId)
    {
        var criteria = new LogCriteria(matchId, message, actionId, session.UserId);
        repository.Execute(criteria);
    }

    public void WriteLog(int matchId, string message)
    {
        try
        {
            var criteria = new LogDirectlyCriteria
            {
                Extend = matchId,
                Doing = message,
                UserId = session.UserId
            };

            repository.Execute(criteria);
        }
        catch (Exception e)
        {
            Fanex.Logging.LogService.Error("Settlement.WebSites(Write Log Directly): ", e);
        }
    }
}