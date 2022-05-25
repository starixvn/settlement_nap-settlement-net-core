using Fanex.Data.Repository;

namespace Settlement.Setting.Criteria.Notification
{
    public class GetNumberOfNotificationCriteria : CriteriaBase
    {
        public int AdminId { get; set; }

        public int NumberError { get; set; }

        public override string GetSettingKey()
        {
            return "NAP_Set_GetNumberError";
        }

        public override bool IsValid()
        {
            return AdminId > 0;
        }
    }
}
