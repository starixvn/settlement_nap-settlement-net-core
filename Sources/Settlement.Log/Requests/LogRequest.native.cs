using MediatR;
using Settlement.Log.Models;

namespace Settlement.Log.Requests;

public class LogRequest : IRequest<List<LogModel>>
{
    private DateTime toDate = DateTime.Today;
    public string MatchCode { get; set; }

    public string ProductType { get; set; } = "ALL";

    public DateTime FromDate { get; set; } = Convert.ToDateTime(DateTime.Now.AddDays(-1).ToShortDateString());

    public DateTime ToDate
    {
        get => toDate.AddDays(1).AddSeconds(-1);
        set => toDate = value;
    }

    public DateTime BalanceUpDay { get; set; }

    public bool IsArchivedLog => FromDate < BalanceUpDay;
}