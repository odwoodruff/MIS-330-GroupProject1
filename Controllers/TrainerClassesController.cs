using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MIS330_GroupProject1.Data;
using MIS330_GroupProject1.Models;

namespace MIS330_GroupProject1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrainerClassesController : ControllerBase
{
    private readonly PetTrainingDbContext _context;

    public TrainerClassesController(PetTrainingDbContext context)
    {
        _context = context;
    }

    // GET: api/trainerclasses/trainer/5
    [HttpGet("trainer/{trainerId}")]
    public async Task<ActionResult<IEnumerable<Class>>> GetTrainerClasses(int trainerId)
    {
        return await _context.Classes
            .Include(s => s.Trainer)
            .Include(s => s.Bookings)
                .ThenInclude(b => b.Pet)
            .Include(s => s.Bookings)
                .ThenInclude(b => b.Customer)
            .Where(s => s.TrainerId == trainerId)
            .ToListAsync();
    }

    // GET: api/trainerclasses/trainer/5/bookings
    [HttpGet("trainer/{trainerId}/bookings")]
    public async Task<ActionResult<IEnumerable<Booking>>> GetTrainerBookings(int trainerId)
    {
        return await _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Pet)
            .Include(b => b.Class)
                .ThenInclude(s => s.Trainer)
            .Where(b => b.Class.TrainerId == trainerId)
            .OrderByDescending(b => b.SessionDateTime)
            .ToListAsync();
    }

    // GET: api/trainerclasses/trainer/5/bookings/upcoming
    [HttpGet("trainer/{trainerId}/bookings/upcoming")]
    public async Task<ActionResult<IEnumerable<Booking>>> GetUpcomingBookings(int trainerId)
    {
        return await _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Pet)
            .Include(b => b.Class)
                .ThenInclude(s => s.Trainer)
            .Where(b => b.Class.TrainerId == trainerId && 
                       b.SessionDateTime >= DateTime.Now && 
                       b.Status != "Cancelled")
            .OrderBy(b => b.SessionDateTime)
            .ToListAsync();
    }

    // PUT: api/trainerclasses/booking/5/status
    [HttpPut("booking/{bookingId}/status")]
    public async Task<IActionResult> UpdateBookingStatus(int bookingId, [FromBody] UpdateStatusRequest request)
    {
        var booking = await _context.Bookings.FindAsync(bookingId);
        if (booking == null)
        {
            return NotFound();
        }

        booking.Status = request.Status;
        if (!string.IsNullOrEmpty(request.Notes))
        {
            booking.Notes = request.Notes;
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Booking status updated successfully" });
    }
}

public class UpdateStatusRequest
{
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

