using Settlement.Setting.Constants;
namespace Settlement.Setting.Models;

public class HoldSetting
{
    private Dictionary<string, short> holdBitPosition => new()
    {
        {"isMtdHold", HoldBitPosition.MtdHold},
        {"isUndecided", HoldBitPosition.Undecided},
        {"isPending", HoldBitPosition.Pending},
        {"isUnderSettle", HoldBitPosition.UnderSettle},
        {"isKeyHold", HoldBitPosition.KeyHold}
    };

    private Dictionary<string, string> holdDescription => new()
    {
        {"isMtdHold", "Mtd. Hold"},
        {"isUndecided", "Undecided"},
        {"isPending","Result Pending"},
        {"isUnderSettle", "Under Settlement"},
        {"isKeyHold", "Hold Key"},
        {"", string.Empty}
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
}