using Microsoft.EntityFrameworkCore;
using ShineApi.Models;
using ShineApi.Repositories;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services;
using ShineApi.Services.Interfaces;

using System;
using Microsoft.AspNetCore.HttpOverrides;
using Serilog;
using Serilog.Events;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .WriteTo.Console()
    .WriteTo.File(
        "logs/ShineApi.json", 
        rollingInterval: RollingInterval.Day,
        restrictedToMinimumLevel: LogEventLevel.Error
        )
    .CreateLogger();

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<ShineDbContext>(options =>
    options.UseInMemoryDatabase("ShineDb"));

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

var app = builder.Build();

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

app.UseAuthorization();

app.MapControllers();

// Liveness probe for the hosting platform (Render health check path: /healthz).
app.MapGet("/healthz", () => Results.Ok("healthy"));

app.Run();
