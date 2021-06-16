using Fanex.Data.Repository;

namespace Settlement.Sportsbook.Aio.Criterias
{
    public class ResultSettingCriteria : NonQueryCommand
    {
        public int MatchId { get; set; }

        public string ResourceIds { get; set; }

        public bool IsEnabled { get; set; }

        public int Type { get; set; }

        public int AdminId { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_ResultDetailSettingUpd";
        }

        public override bool IsValid()
        {
            return MatchId > 0;
        }
    }
}
