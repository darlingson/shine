namespace ShineApi.Dtos;

public class SpotlightResponseDto
{
    /// <summary>The rotation date the spotlight was computed for — YYYY-MM-DD.</summary>
    public string AsOf { get; set; } = string.Empty;
    public SpotlightPlayerDto? Player { get; set; }
    public SpotlightTeamDto? Team { get; set; }
}

public class SpotlightPlayerDto
{
    public int PlayerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? FullName { get; set; }

    /// <summary>Canonical position code, e.g. <c>cf</c>.</summary>
    public string? PositionPrimary { get; set; }

    /// <summary>Coarse pitch area derived from PositionPrimary — GK / DF / MF / FW.</summary>
    public string? PrimaryRole { get; set; }

    /// <summary>ISO 8601 date: YYYY-MM-DD.</summary>
    public string? DateOfBirth { get; set; }
    public int? HeightCm { get; set; }

    /// <summary>left / right / both.</summary>
    public string? Foot { get; set; }

    /// <summary>active / retired / unknown.</summary>
    public string? Status { get; set; }
    public string? Nationality { get; set; }

    /// <summary>Club of the player's current affiliation, when one exists.</summary>
    public string? CurrentClub { get; set; }

    /// <summary>The most recent national side from squad history, when any — e.g. Malawi U20.</summary>
    public string? NationalTeam { get; set; }

    /// <summary>The player's own record across recorded matches — never a ranking.</summary>
    public SpotlightRecordDto Record { get; set; } = new();
    public List<SpotlightMatchDto> RecentMatches { get; set; } = [];
}

public class SpotlightRecordDto
{
    public int ClubAppearances { get; set; }
    public int ClubGoals { get; set; }
    public int ClubAssists { get; set; }
    public int NationalAppearances { get; set; }
    public int NationalGoals { get; set; }
    public int NationalAssists { get; set; }
}

/// <summary>One of the player's recent matches, with their participation in it.</summary>
public class SpotlightMatchDto
{
    /// <summary>clubMatch / nationalMatch — same vocabulary as search.</summary>
    public string Kind { get; set; } = string.Empty;
    public int MatchId { get; set; }

    /// <summary>ISO 8601 date: YYYY-MM-DD.</summary>
    public string Date { get; set; } = string.Empty;
    public string? Competition { get; set; }

    /// <summary>Sides and score, e.g. "Malawi 3–1 Botswana" or "Bullets vs Wanderers".</summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>Canonical line-up status — see the squad vocabulary.</summary>
    public string? LineupStatus { get; set; }
    public int? MinutesPlayed { get; set; }
    public int Goals { get; set; }
    public int Assists { get; set; }
    public bool Captain { get; set; }
}

public class SpotlightTeamDto
{
    /// <summary>club / nationalTeam — same vocabulary as search.</summary>
    public string Kind { get; set; } = string.Empty;
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ShortName { get; set; }
    public string? Subtitle { get; set; }

    /// <summary>Derived "the coach": highest-priority ongoing appointment
    /// (head_coach → manager → caretaker); for national teams falls back to
    /// the record's own coach field.</summary>
    public string? Coach { get; set; }

    /// <summary>Clubs: players currently affiliated. National teams: distinct players recorded in squads.</summary>
    public int SquadSize { get; set; }
    public List<SpotlightTeamMatchDto> RecentMatches { get; set; } = [];
}

public class SpotlightTeamMatchDto
{
    public string Kind { get; set; } = string.Empty;
    public int MatchId { get; set; }

    /// <summary>ISO 8601 date: YYYY-MM-DD.</summary>
    public string Date { get; set; } = string.Empty;
    public string? Competition { get; set; }

    /// <summary>Sides and score, e.g. "Malawi 3–1 Botswana" or "Bullets vs Wanderers".</summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>W / D / L from the spotlighted team's perspective, when both scores exist.</summary>
    public string? Result { get; set; }
}
