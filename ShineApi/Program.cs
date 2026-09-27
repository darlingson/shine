using Microsoft.EntityFrameworkCore;
using ShineApi.Models;
using ShineApi.Repositories;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services;
using ShineApi.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<ShineDbContext>(options =>
    options.UseInMemoryDatabase("ShineDb"));

// Repositories: endpoints -> controller -> iservice -> service -> irepository -> repository
builder.Services.AddScoped<IClubRepository, ClubRepository>();
builder.Services.AddScoped<IPlayerRepository, PlayerRepository>();
builder.Services.AddScoped<IMatchRepository, MatchRepository>();
builder.Services.AddScoped<IPlayerClubRepository, PlayerClubRepository>();
builder.Services.AddScoped<IClubMatchSquadRepository, ClubMatchSquadRepository>();
builder.Services.AddScoped<INationalTeamMatchSquadRepository, NationalTeamMatchSquadRepository>();

// Services
builder.Services.AddScoped<IClubService, ClubService>();
builder.Services.AddScoped<IPlayerService, PlayerService>();
builder.Services.AddScoped<IMatchService, MatchService>();
builder.Services.AddScoped<IPlayerClubService, PlayerClubService>();
builder.Services.AddScoped<IClubMatchSquadService, ClubMatchSquadService>();
builder.Services.AddScoped<INationalTeamMatchSquadService, NationalTeamMatchSquadService>();

var app = builder.Build();

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

app.Run();
