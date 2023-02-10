using System.Collections.Generic;
using System.Linq;
using Settlement.Core.Constants;

namespace Settlement.FastMarkets.Models;

public static class Status
{
    private const int RunningTicket = 2;

    private const int CalculatedTicket = 3;

    private const int NoTicket = 4;

    private const int MarkedTicket = 5;

    private const int RunningResult = 3;

    private const int CompletedAutoResult = 4;

    private const int CompletedManualResult = 5;

    private const int RefundResult = 6;

    private const int RefundDeterminedResult = 7;

    private static Dictionary<int, string> TicketStatusName => new Dictionary<int, string>
    {
        { RunningTicket, TicketStatus.Running }, { CalculatedTicket, TicketStatus.Calculated }, { NoTicket, TicketStatus.NoTicket }, { MarkedTicket, TicketStatus.Marked }
    };

    public static Dictionary<int, string> ResultStatus => new Dictionary<int, string>
    {
        { RunningResult, "Running" }, { CompletedAutoResult, "Completed (Auto)" }, { CompletedManualResult,"Completed (Manual)" },
        { RefundResult, "Refund" }, { RefundDeterminedResult, "Refund SDT" }
    };

    public static string GetTicketStatusNameById(int id)
    {
        return TicketStatusName.FirstOrDefault(x => x.Key == id).Value;
    }

    public static string GetResultStatusNameById(int id)
    {
        var running = new List<int> { 0, 1, 2, 3 };

        return running.Contains(id) ? "Running" : ResultStatus.FirstOrDefault(x => x.Key == id).Value;
    }
}