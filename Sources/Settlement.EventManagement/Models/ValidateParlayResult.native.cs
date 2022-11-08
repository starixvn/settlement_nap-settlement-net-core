namespace Settlement.EventManagement.Models
{
    public class ValidateParlayResult
    {
        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public string MatchIdsValid { get; set; }

        public string MatchIdsInvalid { get; set; }
    }
}
