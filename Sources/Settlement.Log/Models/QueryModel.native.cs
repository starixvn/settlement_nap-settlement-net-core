using System;

namespace Settlement.Log.Models;

public class QueryModel
{
    public QueryModel()
    {
        FromDate = Convert.ToDateTime(DateTime.Now.AddDays(-1).ToShortDateString());
        ToDate = DateTime.Today;
        IsShowMenu = true;
    }

    public bool IsShowMenu { get; set; }

    public string MatchCode { get; set; }

    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public DateTime BalanceUpDay { get; set; }
}