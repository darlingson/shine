using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

public class NationalTeamMatchSquadService : INationalTeamMatchSquadService
{
    private readonly INationalTeamMatchSquadRepository _repository;

    public NationalTeamMatchSquadService(INationalTeamMatchSquadRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<NationalTeamMatchSquad>> GetAllAsync()
        => await _repository.GetAllAsync();

    public async Task<NationalTeamMatchSquad?> GetByIdAsync(int matchId, string nationalTeam, int playerId)
        => await _repository.GetByIdAsync(matchId, nationalTeam, playerId);

    public async Task<NationalTeamMatchSquad?> CreateAsync(CreateNationalTeamMatchSquadDto dto)
    {
        if (await _repository.ExistsAsync(dto.MatchId, dto.NationalTeam, dto.PlayerId))
            return null;

        var squad = new NationalTeamMatchSquad
        {
            MatchId = dto.MatchId,
            NationalTeam = dto.NationalTeam,
            PlayerId = dto.PlayerId,
            LineupStatus = dto.LineupStatus,
            ShirtNumber = dto.ShirtNumber,
            Position = dto.Position,
            MinutesPlayed = dto.MinutesPlayed,
            Goals = dto.Goals,
            Assists = dto.Assists,
            YellowCards = dto.YellowCards,
            RedCards = dto.RedCards,
            Captain = dto.Captain,
            SourceUrl = dto.SourceUrl,
            Notes = dto.Notes
        };

        await _repository.AddAsync(squad);
        await _repository.SaveChangesAsync();
        return squad;
    }

    public async Task<NationalTeamMatchSquad?> UpdateAsync(int matchId, string nationalTeam, int playerId, UpdateNationalTeamMatchSquadDto dto)
    {
        var squad = await _repository.GetByIdAsync(matchId, nationalTeam, playerId);
        if (squad is null) return null;

        squad.LineupStatus = dto.LineupStatus;
        squad.ShirtNumber = dto.ShirtNumber;
        squad.Position = dto.Position;
        squad.MinutesPlayed = dto.MinutesPlayed;
        squad.Goals = dto.Goals;
        squad.Assists = dto.Assists;
        squad.YellowCards = dto.YellowCards;
        squad.RedCards = dto.RedCards;
        squad.Captain = dto.Captain;
        squad.SourceUrl = dto.SourceUrl;
        squad.Notes = dto.Notes;

        _repository.Update(squad);
        await _repository.SaveChangesAsync();
        return squad;
    }

    public async Task<bool> DeleteAsync(int matchId, string nationalTeam, int playerId)
    {
        var squad = await _repository.GetByIdAsync(matchId, nationalTeam, playerId);
        if (squad is null) return false;

        _repository.Delete(squad);
        await _repository.SaveChangesAsync();
        return true;
    }
}
