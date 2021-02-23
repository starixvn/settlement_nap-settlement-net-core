namespace Settlement.Core.Models
{
    public class ResultDetail
    {
        private string value;

        public int? MatchId { get; set; }

        public string ResourceId { get; set; }

        public int SourceId { get; set; }

        public string SourceName { get; set; }

        public string HomeValue
        {
            get
            {
                return UppercaseFirst(value);
            }

            set
            {
                this.value = value;
            }
        }

        public bool InvalidValue { get; set; }

        public string AwayValue { get; set; }

        public string TicketStatus { get; set; }

        public byte? ResultStatusId { get; set; }

        public byte? SettlementStatusId { get; set; }

        public string OtherInfo { get; set; }

        private static string UppercaseFirst(string value)
        {
            return string.IsNullOrEmpty(value) ? null : char.ToUpper(value[0]) + value.Substring(1);
        }
    }
}
