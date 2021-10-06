using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Aio.Criterias
{
    public class VerificationCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public string SelectedResource { get; set; }

        public string Action { get; set; }

        public bool CheckType { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Admin_Settlement_Validation_PrePush";
        }

        public override bool IsValid() => MatchId > 0;
    }
}