using System;
using System.Runtime.Serialization;

namespace Settlement.Sportsbook.Aio
{
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

        protected EmptyKeyException(SerializationInfo info, StreamingContext context)
            : base(info, context)
        {
        }

        public string Description
        {
            get;
            protected set;
        }
    }
}
