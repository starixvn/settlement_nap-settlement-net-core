using Fanex.Data.Repository;
using Settlement.Sportsbook.Aio.Criterias;

namespace Settlement.Sportsbook.Aio.Tennis.Criteria
{
    public class SaveScoreCriteria : SaveScoreCriteriaBase
    {
        public int UserId { get; set; }

        public string OutsideSources { get; set; }

        public string Sources { get; set; }

        public string Ip { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_ExternalResultDetailESIns";
        }

    }
}
