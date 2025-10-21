namespace Settlement.Outright.Models;

public class TeamResult
{
    public int OrId { get; set; }

    public int TeamId { get; set; }

    public string Result { get; set; }

    public bool IsDeadheat { get; set; }
    public int ResultStatusId { get; set; }
}
