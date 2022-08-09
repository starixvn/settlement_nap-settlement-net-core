using Fanex.Data;
using Fanex.Data.Repository;

namespace Settlement.EventManagement.Criteria
{
    public class ParlayCriteria : NonQueryCommand
    {
        public string MatchIds { get; set; }

        public int AdminId { get; set; }

        public string Action { get; set; }

        public string Ip { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        [SpParam(Ignored = true)]
        public string DbServer { get; set; }

        public override string GetSettingKey()
        {
            return $"CalculateMP_{DbServer}";
        }

        public override bool IsValid()
        {
            return AdminId > 0 && MatchIds.Length > 0;
        }
    }
}