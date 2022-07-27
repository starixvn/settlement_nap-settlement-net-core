namespace Settlement.EventManagement.Models.Calculation
{
    public class ResultDetail
    {
        public int MatchId { get; set; }

        public int SourceId { get; set; }

        public string ResourceId { get; set; }

        public string SourceName { get; set; }

        public string HomeValue { get; set; }

        public string AwayValue { get; set; }
    }
}
