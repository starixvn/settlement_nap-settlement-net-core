using Fanex.Data.Repository;
using Settlement.Sportsbook.MoveTickets.Criterias;

namespace Settlement.Sportsbook.MoveTickets.Services
{
    public interface ILogService
    {
        void ActionLog(int matchId, string message);
    }

    public class LogServiceImp : ILogService
    {
        private readonly IDynamicRepository repository;

        public LogServiceImp(IDynamicRepository repository)
        {
            this.repository = repository;
        }

        public void ActionLog(int matchId, string message)
        {
            var criteria = new LogCriteria(matchId, message);
            repository.Execute(criteria);
        }
    }
}