namespace Settlement.Sportsbook.Cricket.Models
{
    public class MatchResultSetting
    {
        private const int HoldResultPosition = 0;

        public string ResultSetting { get; set; }

        public bool IsHoldResult => !string.IsNullOrWhiteSpace(ResultSetting) && ResultSetting[HoldResultPosition].Equals('1');
    }
}