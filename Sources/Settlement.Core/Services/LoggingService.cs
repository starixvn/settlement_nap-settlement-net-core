using Fanex.Logging;

namespace Settlement.Core.Services
{
    public interface ILoggingService
    {
        void Info(string message);
    }

    public class LoggingService : ILoggingService
    {
        public void Info(string message)
        {
            LogService.Info(message);
        }
    }
}
