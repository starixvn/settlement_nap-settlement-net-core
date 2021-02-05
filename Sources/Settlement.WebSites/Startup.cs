using Fanex.NAP.Client;
using Fanex.NAP.Client.Configuration;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.NAP.Client.Web;
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

            services.AddRazorPages();
            services.AddControllersWithViews();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseDeveloperExceptionPage();

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCookiePolicy();
            app.UseSession();
            app.UseMiddleware<ApiLoggingMiddleware>();
            app.UseMiddleware<ErrorHandler>();
            app.UseRouting();
            app.UseCors(allowOrigin);
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
            });

            NapClientManager
            .UseConfig(app.ApplicationServices.GetService<INapSettings>())
            .UseRestClient(app.ApplicationServices.GetService<IRestClient>())
            .UseSession(app.ApplicationServices.GetService<INapSession>());
        }
    }
}