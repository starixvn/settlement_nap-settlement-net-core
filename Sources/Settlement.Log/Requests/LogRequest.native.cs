using MediatR;
using Settlement.Log.Models;

namespace Settlement.Log.Requests;

public class LogRequest : IRequest<List<LogModel>>
{
    public string MatchCode { get; set; }

    public string ProductType { get; set; } = "ALL";

    public DateTime FromDate { get; set; } = Convert.ToDateTime(DateTime.Now.AddDays(-1).ToShortDateString());

    public DateTime ToDate { get; set; } = DateTime.Today;

    public DateTime BalanceUpDay { get; set; }

    public bool IsArchivedLog => FromDate < BalanceUpDay;
}