using Fanex.NAP.Client.AspNetCore.Session;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Linq;
using System.Net;
using Microsoft.AspNetCore.Mvc;

namespace Settlement.Core.ActionFilters
{
    /// <summary>
    /// Super authorize attribute.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
    public class SessionAuthorizeAttribute : AuthorizeAttribute, IAuthorizationFilter
    {
        /// <summary>
        /// Authorize action handler.
        /// </summary>
        /// <param name="filterContext">Filter context.</param>
        public void OnAuthorization(AuthorizationFilterContext filterContext)
        {
            var skipAuthorization = SkipAuthorization(filterContext);

            if (skipAuthorization)
            {
                return;
            }

            if (SessionIsValid())
            {
                return;
            }

            CloseConnection(filterContext);
        }

        private static void CloseConnection(ActionContext context)
        {
            if (IsAjaxRequest(context.HttpContext.Request))
            {
                var response = context.HttpContext.Response;
                const string messageContent = "Sorry, you have lost connection to the session! Please sign-in again.";
                response.StatusCode = (int)HttpStatusCode.Forbidden;
                response.WriteAsync(messageContent);
            }
            else
            {
                context.HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            }
        }

        private static bool IsAjaxRequest(HttpRequest request)
            => string.Equals(request.Query["X-Requested-With"], "XMLHttpRequest", StringComparison.Ordinal) ||
               string.Equals(request.Headers["X-Requested-With"], "XMLHttpRequest", StringComparison.Ordinal);

        private static bool SkipAuthorization(ActionContext filterContext)
        {
            if (filterContext.ActionDescriptor.EndpointMetadata.Any(em => em.GetType() == typeof(AllowAnonymousAttribute)))
            {
                return true;
            }

            return filterContext.ActionDescriptor is ControllerActionDescriptor controllerDescriptor
                   && controllerDescriptor.EndpointMetadata.Any(em => em.GetType() == typeof(AllowAnonymousAttribute));
        }

        private static bool SessionIsValid()
        {
            var accessor = new HttpContextAccessor();
            var session = new NapSession(accessor);
            return !string.IsNullOrEmpty(session.UserName) && session.UserId > 0;
        }
    }
}