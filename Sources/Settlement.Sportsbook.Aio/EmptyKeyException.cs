namespace Settlement.Sportsbook.Aio;

[Serializable]
public class EmptyKeyException : Exception
{
    public EmptyKeyException(string message)
        : base(message)
    {
        Description = message;
    }

    public EmptyKeyException(string message, Exception innerException)
        : base(message, innerException)
    {
    }

    public string Description
    {
        get;
        protected set;
    }
}