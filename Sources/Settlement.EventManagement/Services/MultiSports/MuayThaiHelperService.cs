namespace Settlement.EventManagement.Services.MultiSports;

public interface MuayThaiHelperService
{
    (string Home, string Away, string Round) MapSboToSettle(int homeValue, int awayValue);
}

public class MuayThaiHelperServiceImp : MuayThaiHelperService
{
    private const int Zero = 0;

    private const int One = 1;

    private const int Five = 5;

    private const int Six = 6;

    public (string Home, string Away, string Round) MapSboToSettle(int homeValue, int awayValue)
    {
        return homeValue switch
        {
            >= One and <= Five when awayValue == Zero => (One.ToString(), Zero.ToString(), homeValue.ToString()),
            Zero when awayValue is >= One and <= Five => (Zero.ToString(), One.ToString(), awayValue.ToString()),
            Six when awayValue == Zero => (Five.ToString(), Zero.ToString(), string.Empty),
            Zero when awayValue == Six => (Zero.ToString(), Five.ToString(), string.Empty),
            Six when awayValue == Six => (Five.ToString(), Five.ToString(), string.Empty),
            _ => (homeValue.ToString(), awayValue.ToString(), string.Empty)
        };
    }
}