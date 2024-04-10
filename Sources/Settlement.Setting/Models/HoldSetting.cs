using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Setting.Models;

public class HoldSetting
{
    private Dictionary<string, short> holdBitPosition => new Dictionary<string, short>
    {
        {"isMtdHold", 16},
        {"isUndecided", 2},
        {"isPending", 1},
        {"isUnderSettle", 4},
        {"isKeyHold", 64},
    };

    private Dictionary<string, string> holdDescription => new Dictionary<string, string>
    {
        {"isMtdHold", "Mtd. Hold"},
        {"isUndecided", "Undecided"},
        {"isPending","Result Pending"},
        {"isUnderSettle", "Under Settlement"},
        {"isKeyHold", "Hold Key"},
        {"", string.Empty},
    };

    public string Name { get; set; }
    public short Type => holdBitPosition[Name];
    public bool Value { get; set; }
    public bool IsApplyChild { get; set; }
    public string Description => $"{holdDescription[Name]}";

    public override bool Equals(object obj)
    {
        return obj is HoldSetting item &&
               Name == item.Name &&
               Value == item.Value &&
               IsApplyChild == item.IsApplyChild;
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(Name, Value, IsApplyChild);
    }
};