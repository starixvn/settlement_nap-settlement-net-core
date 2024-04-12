using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Core.Constants;

public static class ErrorCode
{
    public const int ParentFantasyNotCalc = 33;
}

public static class ErrorMessage
{
    public const string ParentFantasyNotCalc = "Cannot continue due to some Parent-match scores have not been calculated.";
}