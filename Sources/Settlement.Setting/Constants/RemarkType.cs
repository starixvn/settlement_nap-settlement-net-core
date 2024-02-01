using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Settlement.Setting.Requests;

namespace Settlement.Setting.Constants;

public static class RemarkType
{
    public const short IsMtdHold = 16;
    public const short IsUndecided = 2;
    public const short IsPending = 1;
    public const short IsUnderSettle = 4;
    public const short IsKeyHold = 64;
}