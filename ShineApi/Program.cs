using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ShineApi.Models;
using ShineApi.Repositories;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services;
using ShineApi.Services.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.HttpOverrides;
using Serilog;
using Serilog.Events;
using ShineApi.Authorization;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((_, configuration) =>
{
    configuration
        .MinimumLevel.Debug()
        .WriteTo.Console()
        .WriteTo.File(
            "logs/ShineApi.json",
            rollingInterval: RollingInterval.Day,
            restrictedToMinimumLevel: LogEventLevel.Error
        );
});
// Add services to the container.

builder.Services.AddControllers();

// CORS — allow the Vite dev server and any configured frontend origin.
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>()
    ?? ["http://localhost:5173"];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer<ShineApi.OpenApi.BearerSecuritySchemeTransformer>();
});

builder.Services.AddDbContext<ShineDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<ShineDbContext>()
    .AddDefaultTokenProviders();

// Explicit password policy so the API and the UI enforce the same rule.
// (Identity's built-in defaults would otherwise reject most human passwords.)
builder.Services.Configure<IdentityOptions>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredUniqueChars = 1;
});

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Missing Jwt:Key (user-secrets or Jwt__Key env var).");
if (jwtKey.Length < 32)
    throw new InvalidOperationException("Jwt:Key must be at least 32 characters.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException("Missing Jwt:Issuer (user-secrets or Jwt__Issuer env var).");
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? jwtIssuer;

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    foreach (var permission in Permissions.All)
    {
        options.AddPolicy(
            Permissions.PolicyFor(permission),
            policy => policy.Requirements.Add(new PermissionRequirement(permission)));
    }
});
builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

// Repository interfaces
builder.Services.AddScoped<IClubRepository, ClubRepository>();
builder.Services.AddScoped<IPlayerRepository, PlayerRepository>();
builder.Services.AddScoped<IMatchRepository, MatchRepository>();
builder.Services.AddScoped<IPlayerClubRepository, PlayerClubRepository>();
builder.Services.AddScoped<IClubMatchSquadRepository, ClubMatchSquadRepository>();
builder.Services.AddScoped<INationalTeamMatchSquadRepository, NationalTeamMatchSquadRepository>();

// Service interfaces
builder.Services.AddScoped<IClubService, ClubService>();
builder.Services.AddScoped<IPlayerService, PlayerService>();
builder.Services.AddScoped<IMatchService, MatchService>();
builder.Services.AddScoped<IPlayerClubService, PlayerClubService>();
builder.Services.AddScoped<IClubMatchSquadService, ClubMatchSquadService>();
builder.Services.AddScoped<INationalTeamMatchSquadService, NationalTeamMatchSquadService>();
builder.Services.AddScoped<ShineApi.Services.Auth.ITokenService, ShineApi.Services.Auth.TokenService>();

var app = builder.Build();

var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("Starting web host");

// Apply pending EF migrations before anything touches the schema, so a
// fresh database (e.g. an empty Neon/Render Postgres) is created on boot
// instead of crash-looping inside the seeder below.
await using (var scope = app.Services.CreateAsyncScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ShineDbContext>();
    await db.Database.MigrateAsync();
}

await RoleSeeder.EnsureAsync(app.Services);

// Render terminates TLS at its proxy and forwards plain HTTP with
// X-Forwarded-Proto. Honor those headers (first in the pipeline) so URL
// generation and the HTTPS-redirection middleware see the original
// client scheme instead of redirect-looping behind the proxy.
var forwardedHeadersOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
};
forwardedHeadersOptions.KnownIPNetworks.Clear();
forwardedHeadersOptions.KnownProxies.Clear();
app.UseForwardedHeaders(forwardedHeadersOptions);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUi(options =>
    {
        options.DocumentPath = "/openapi/v1.json";
    });
}

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Liveness probe for the hosting platform (Render health check path: /healthz).
app.MapGet("/healthz", () => Results.Ok("healthy"));

app.Run();
