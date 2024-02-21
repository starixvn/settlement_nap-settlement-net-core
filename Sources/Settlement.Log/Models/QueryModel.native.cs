namespace Settlement.Log.Models;

public class QueryModel
{
    public bool IsShowMenu { get; set; } = true;

    public string MatchCode { get; set; }

    public DateTime FromDate { get; set; } = Convert.ToDateTime(DateTime.Now.AddDays(-1).ToShortDateString());

    public DateTime ToDate { get; set; } = DateTime.Today;

    public DateTime BalanceUpDay { get; set; }
}