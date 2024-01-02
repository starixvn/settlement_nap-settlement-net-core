using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Models;

public class ResultChanged
{
    public string ResourceId { get; set; }
    public string HomeValue { get; set; }
    public string AwayValue { get; set; }
    public string Action { get; set; }
    public string OtherInfo { get; set; }
    public DateTime LogDate { get; set; }
    public short ReSettleType { get; set; }
}