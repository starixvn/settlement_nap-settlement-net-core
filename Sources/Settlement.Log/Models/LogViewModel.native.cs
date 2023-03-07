using System.Collections.Generic;

namespace Settlement.Log.Models;

public class LogViewModel
{
    public List<LogModel> Logs { get; set; }

    public QueryModel Query { get; set; }
}