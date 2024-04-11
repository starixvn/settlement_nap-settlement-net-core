using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Models;

public class ResultHistoryItem
{
    public int SeqNo { get; set; }
    public string WrongResult { get; set; }
    public string ActualResult { get; set; }
    public int ActionType { get; set; }
    public string ExtraInfo { get; set; }
}