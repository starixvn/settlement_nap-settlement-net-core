using System.Net;
using MessagePack;
using Microsoft.AspNetCore.Mvc;

namespace Settlement.Core.ActionResults
{
    public class MessagePackResult<T> : ActionResult
    {
        private readonly T content;

        public MessagePackResult(T content)
        {
            this.content = content;
        }

        public override void ExecuteResult(ActionContext context)
        {
            var bytes = MessagePackSerializer.Serialize(content);

            context.HttpContext.Response.StatusCode = (int)HttpStatusCode.OK;
            context.HttpContext.Response.ContentType = "application/x-msgpack";
            context.HttpContext.Response.Body.WriteAsync(bytes);
        }
    }
}