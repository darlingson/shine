using ShineApi.Dtos;
using ShineApi.Models;
using ShineApi.Repositories.Interfaces;
using ShineApi.Services.Interfaces;

namespace ShineApi.Services;

public class ClubMatchSquadService : IClubMatchSquadService
{
    private readonly IClubMatchSquadRepository _repository;
    private readonly IClubMatchRepository _matchRepository;
    private readonly IClubRepository _clubRepository;
    private readonly IPlayerRepository _playerRepository;

    public ClubMatchSquadService(
        IClubMatchSquadRepository repository,
        IClubMatchRepository matchRepository,
        IClubRepository clubRepository,
        IPlayerRepository playerRepository)
    {
        _repository = repository;
        _matchRepository = matchRepository;
        _clubRepository = clubRepository;
        _playerRepository = playerRepository;
    }

    public async Task<IEnumerable<ClubMatchSquad>> GetAllAsync()
        => await _repository.GetAllAsync();

    public async Task<ClubMatchSquad?> GetByIdAsync(int matchId, int clubId, int playerId)
        => await _repository.GetByIdAsync(matchId, clubId, playerId);

    public async Task<ClubMatchSquad?> CreateAsync(CreateClubMatchSquadDto dto, List<string> errors)
    {
        var before = errors.Count;
        if (!await _matchRepository.ExistsAsync(dto.MatchId))
            errors.Add($"Unknown matchId {dto.MatchId}.");
        if (!await _clubRepository.ExistsAsync(dto.ClubId))
            errors.Add($"Unknown clubId {dto.ClubId}.");
        if (!await _playerRepository.ExistsAsync(dto.PlayerId))
            errors.Add($"Unknown playerId {dto.PlayerId}.");
        if (errors.Count != before) return null;

        if (await _repository.ExistsAsync(dto.MatchId, dto.ClubId, dto.PlayerId))
            return null;

        var squad = new ClubMatchSquad
        {
            MatchId = dto.MatchId,
            ClubId = dto.ClubId,
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

    public async Task<ClubMatchSquad?> UpdateAsync(int matchId, int clubId, int playerId, UpdateClubMatchSquadDto dto)
    {
        var squad = await _repository.GetByIdAsync(matchId, clubId, playerId);
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

    public async Task<bool> DeleteAsync(int matchId, int clubId, int playerId)
    {
        var squad = await _repository.GetByIdAsync(matchId, clubId, playerId);
        if (squad is null) return false;

        _repository.Delete(squad);
        await _repository.SaveChangesAsync();
        return true;
    }
}
