using Fanex.Data.Repository;
using Settlement.Core.Criteria;

namespace Settlement.Core.Services
{
    public interface ILogService
    {
        void ActionLog(int matchId, string message, int actionId);
    }

    public class LogServiceImp : ILogService
    {
        private readonly IDynamicRepository repository;

        public LogServiceImp(IDynamicRepository repository)
        {
            this.repository = repository;
        }

        public void ActionLog(int matchId, string message, int actionId)
        {
            var criteria = new LogCriteria(matchId, message, actionId);
            repository.Execute(criteria);
        }
    }
}