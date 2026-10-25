using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

public class NationalTeamMatchSquadService : INationalTeamMatchSquadService
{
    private readonly INationalTeamMatchSquadRepository _repository;
    private readonly INationalTeamMatchRepository _matchRepository;
    private readonly INationalTeamRepository _nationalTeamRepository;
    private readonly IPlayerRepository _playerRepository;

    public NationalTeamMatchSquadService(
        INationalTeamMatchSquadRepository repository,
        INationalTeamMatchRepository matchRepository,
        INationalTeamRepository nationalTeamRepository,
        IPlayerRepository playerRepository)
    {
        _repository = repository;
        _matchRepository = matchRepository;
        _nationalTeamRepository = nationalTeamRepository;
        _playerRepository = playerRepository;
    }

    public async Task<IEnumerable<NationalTeamMatchSquad>> GetAllAsync()
        => await _repository.GetAllAsync();

    public async Task<NationalTeamMatchSquad?> GetByIdAsync(int matchId, int nationalTeamId, int playerId)
        => await _repository.GetByIdAsync(matchId, nationalTeamId, playerId);

    public async Task<NationalTeamMatchSquad?> CreateAsync(CreateNationalTeamMatchSquadDto dto, List<string> errors)
    {
        var before = errors.Count;
        if (!await _matchRepository.ExistsAsync(dto.MatchId))
            errors.Add($"Unknown matchId {dto.MatchId}.");
        if (!await _nationalTeamRepository.ExistsAsync(dto.NationalTeamId))
            errors.Add($"Unknown nationalTeamId {dto.NationalTeamId}.");
        if (!await _playerRepository.ExistsAsync(dto.PlayerId))
            errors.Add($"Unknown playerId {dto.PlayerId}.");
        var position = Positions.NormalizeOrError(dto.Position, "position", errors);
        var status = LineupStatuses.NormalizeOrError(dto.LineupStatus, "lineupStatus", errors);
        if (errors.Count != before) return null;

        if (await _repository.ExistsAsync(dto.MatchId, dto.NationalTeamId, dto.PlayerId))
            return null;

        var squad = new NationalTeamMatchSquad
        {
            MatchId = dto.MatchId,
            NationalTeamId = dto.NationalTeamId,
            PlayerId = dto.PlayerId,
            LineupStatus = status,
            ShirtNumber = dto.ShirtNumber,
            Position = position?.Position,
            Role = position?.Role,
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

    public async Task<NationalTeamMatchSquad?> UpdateAsync(int matchId, int nationalTeamId, int playerId, UpdateNationalTeamMatchSquadDto dto, List<string> errors)
    {
        var squad = await _repository.GetByIdAsync(matchId, nationalTeamId, playerId);
        if (squad is null) return null;

        var position = Positions.NormalizeOrError(dto.Position, "position", errors);
        var status = LineupStatuses.NormalizeOrError(dto.LineupStatus, "lineupStatus", errors);
        if (errors.Count > 0) return squad;

        squad.LineupStatus = status;
        squad.ShirtNumber = dto.ShirtNumber;
        squad.Position = position?.Position;
        squad.Role = position?.Role;
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

    public async Task<bool> DeleteAsync(int matchId, int nationalTeamId, int playerId)
    {
        var squad = await _repository.GetByIdAsync(matchId, nationalTeamId, playerId);
        if (squad is null) return false;

        _repository.Delete(squad);
        await _repository.SaveChangesAsync();
        return true;
    }
}
