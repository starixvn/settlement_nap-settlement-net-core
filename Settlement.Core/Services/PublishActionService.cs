using Fanex.NAP.Gateway.Entities.BetTrade;
using Fanex.NAP.Gateway.Entities.Cricket;
using Fanex.NAP.Gateway.Entities.MetricGaming;
using Fanex.NAP.Gateway.Publisher;

namespace Settlement.Core.Services
{
    public interface IPublishActionService
    {
        void CricketAction();
    }

    public class PublishActionService : IPublishActionService
    {
        public void CricketAction()
        {
            PublishChannel(new CricketAction());
        }

        public virtual void PublishChannel<T>(T message) where T : class
        {
            var publishChannel = new PublishChannel();
            publishChannel.Publish(message);
        }
    }
}
