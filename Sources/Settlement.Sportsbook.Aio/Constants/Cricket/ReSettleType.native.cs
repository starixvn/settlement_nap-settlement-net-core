using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Constants.Cricket;

public static class ReSettleType
{
    public const short ReCalc = 1;
    public const short RefundToCalc = 3;
    public const short CalcToRefund = 2;
    public const short Unknow = 0;
}