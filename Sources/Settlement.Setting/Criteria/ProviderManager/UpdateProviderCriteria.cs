using Fanex.Data.Repository;

namespace Settlement.Setting.Criteria
{
    public class UpdateProviderCriteria : NonQueryCommand
    {
        public int GameType { get; set; }

        public string ProviderSources { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_ProviderInfoUpd";
        }

        public override bool IsValid()
        {
            return GameType > 0;
        }
    }
}