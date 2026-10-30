using System.ComponentModel.DataAnnotations;

namespace ShineApi.Dtos;

/// <summary>A dated staff role at one team, person and team names resolved.
/// Exactly one of clubId / nationalTeamId is set — take the pair (id, name)
/// from whichever is non-null, per the team's stack.</summary>
public class StaffAppointmentDto
{
    public int StaffAppointmentId { get; set; }
    public int StaffMemberId { get; set; }

    /// <summary>Display name resolved from the staff member.</summary>
    public string? StaffMemberName { get; set; }

    /// <summary>Canonical role code — see StaffRoles (head_coach, …, other).</summary>
    public string Role { get; set; } = string.Empty;

    public int? ClubId { get; set; }
    public string? ClubName { get; set; }

    public int? NationalTeamId { get; set; }
    public string? NationalTeamName { get; set; }

    public DateOnly? StartDate { get; set; }

    /// <summary>Blank = ongoing.</summary>
    public DateOnly? EndDate { get; set; }

    public string? SourceUrl { get; set; }
}

/// <summary>Filters, sort and paging for the appointment browser (the staff
/// list per team). Matching is case-insensitive.</summary>
public class StaffAppointmentQuery
{
    private int _page = 1;
    private int _pageSize = 25;

    /// <summary>Free text matched against the staff member and team names.</summary>
    public string? Q { get; set; }

    /// <summary>Appointments for this person.</summary>
    public int? StaffMemberId { get; set; }

    /// <summary>Appointments at this club.</summary>
    public int? ClubId { get; set; }

    /// <summary>Appointments at this national team.</summary>
    public int? NationalTeamId { get; set; }

    /// <summary>Exact canonical role match, e.g. head_coach.</summary>
    public string? Role { get; set; }

    /// <summary>Only appointments still running (endDate not set).</summary>
    public bool? Ongoing { get; set; }

    /// <summary>One of startDate, role, createdAt. Unknown values fall back to startDate.</summary>
    public string? Sort { get; set; }

    /// <summary>asc or desc. Defaults to desc for startDate, asc otherwise.</summary>
    public string? Order { get; set; }

    public int Page
    {
        get => _page;
        set => _page = Math.Max(1, value);
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = Math.Clamp(value, 1, 100);
    }
}

public class CreateStaffAppointmentDto
{
    [Required]
    public int? StaffMemberId { get; set; }

    [Required]
    public string? Role { get; set; }

    /// <summary>Exactly one of clubId / nationalTeamId — enforced in the
    /// service, so an unsaved row can never have both or neither.</summary>
    public int? ClubId { get; set; }
    public int? NationalTeamId { get; set; }

    public DateOnly? StartDate { get; set; }

    /// <summary>Blank = ongoing.</summary>
    public DateOnly? EndDate { get; set; }

    public string? SourceUrl { get; set; }
}

public class UpdateStaffAppointmentDto
{
    [Required]
    public int? StaffMemberId { get; set; }

    [Required]
    public string? Role { get; set; }

    /// <summary>Full replace: fields left empty clear their stored value, and
    /// moving between a club and a national team is a normal edit.</summary>
    public int? ClubId { get; set; }
    public int? NationalTeamId { get; set; }

    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }

    public string? SourceUrl { get; set; }
}
