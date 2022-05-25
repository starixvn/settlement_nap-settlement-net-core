using Fanex.Data.Repository;

namespace Settlement.Setting.Criteria.Notification
{
    public class ShowTopNotificationCriteria : CriteriaBase
    {
        private int? top;

        public int? Top
        {
            get
            {
                if (!top.HasValue || top.Value <= 0)
                {
                    return int.MaxValue;
                }

                return top.Value;
            }

            set
            {
                top = value;
            }
        }

        public int AdminId { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_SettledErrorSel";
        }

        public override bool IsValid()
        {
            return AdminId > 0;
        }
    }
}
