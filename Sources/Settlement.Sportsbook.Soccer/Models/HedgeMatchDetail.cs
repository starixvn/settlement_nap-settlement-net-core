namespace Settlement.Sportsbook.Soccer.Models
{
    public class HedgeMatchDetail
    {
        public int MatchId { get; set; }

        public string MatchCode { get; set; }

        public bool IsDeterminedHedgeMatch { get; set; }

        public bool IsUndecided { get; set; }
    }
}