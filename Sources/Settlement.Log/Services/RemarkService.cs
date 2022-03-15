using System.Collections.Generic;
using System.Text;

namespace Settlement.Log.Services
{
    public interface RemarkService
    {
        bool IsFastMarketAction(int actionId);

        string RemarkValue(string value);
    }

    public class RemarkServiceImp : RemarkService
    {
        private readonly List<int> fastMarketAction = new List<int> { 165, 166, 167 };

        private readonly RemarkNodeService remarkNodeService;

        public RemarkServiceImp(RemarkNodeService remarkNodeService)
        {
            this.remarkNodeService = remarkNodeService;
        }

        public bool IsFastMarketAction(int actionId)
        {
            return fastMarketAction.Contains(actionId);
        }

        public string RemarkValue(string value)
        {
            var arrayRemark = value.Split('|');
            var remark = new StringBuilder();
            const int remarkPosition = 2;
            if (arrayRemark.Length > remarkPosition)
            {
                remark.Append(remarkNodeService.EventCounter(arrayRemark[remarkPosition]));
            }

            if (arrayRemark.Length > 1)
            {
                var goalValue = arrayRemark.Length > 3 ? arrayRemark[3] : string.Empty;
                remark.Append(remarkNodeService.BetTypes(arrayRemark[1], goalValue));
                remark.Append(arrayRemark[0]);
            }

            return remark.ToString();
        }
    }
}