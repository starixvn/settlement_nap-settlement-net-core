using Fanex.NAP.Client;
using Fanex.NAP.Client.Configuration;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Settlement.WebSites.Middleware;

namespace Settlement.WebSites
{
    public partial class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            ConfigureCORS(services);
            ConfigureAuthorization(services);
            ConfigureAuthentication(services);
            ConfigureRedis(services);
            ConfigureSession(services);

            ConfigureNapServices(services);
            ConfigureFanex();
            ConfigureCore(services);
            ConfigureMediator(services);

            ConfigInternalService(services);
            ConfigureAutoMapper(services);
            ConfigureMessagePack(services);
            services.AddRazorPages();
            services.AddControllersWithViews();
            services.AddHttpClient();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public static void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseDeveloperExceptionPage();
            app.UseResponseCompression();
            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCookiePolicy();
            app.UseSession();
            app.UseMiddleware<ErrorHandler>();
            app.UseRouting();
            app.UseCors(allowOrigin);
            app.UseAuthentication();
            app.UseAuthorization();

            //app.Use(async (context, next) =>
            //{
            //    if (context.Request.Path == "/")
            //    {
            //        context.Response.Redirect("Home/Index", true);

            //        return;
            //    }
            //    await next();
            //});

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    "default",
                    "{controller=Home}/{action=Index}/{id?}");
            });

            NapClientManager
            .UseConfig(app.ApplicationServices.GetService<INapSettings>())
            .UseSession(app.ApplicationServices.GetService<INapSession>());
        }
    }
}