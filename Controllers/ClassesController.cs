using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MIS330_GroupProject1.Data;
using MIS330_GroupProject1.Models;

namespace MIS330_GroupProject1.Controllers;

[ApiController]
[Route("api/sessions")] // Keep route as "sessions" for frontend compatibility
public class ClassesController : ControllerBase
{
    private readonly PetTrainingDbContext _context;

    public ClassesController(PetTrainingDbContext context)
    {
        _context = context;
    }

    // GET: api/sessions?search=keyword&sortBy=price&sortOrder=asc&trainerId=1
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Class>>> GetSessions(
        [FromQuery] string? search,
        [FromQuery] string? sortBy,
        [FromQuery] string? sortOrder,
        [FromQuery] int? trainerId,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice)
    {
        var query = _context.Classes.Include(s => s.Trainer).AsQueryable();

        // Search filtering
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(s => 
                s.Type.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                s.Description.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                s.Trainer.FirstName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                s.Trainer.LastName.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        // Trainer filtering
        if (trainerId.HasValue)
        {
            query = query.Where(s => s.TrainerId == trainerId.Value);
        }

        // Price filtering
        if (minPrice.HasValue)
        {
            query = query.Where(s => s.Price >= minPrice.Value);
        }
        if (maxPrice.HasValue)
        {
            query = query.Where(s => s.Price <= maxPrice.Value);
        }

        // Sorting
        sortBy = sortBy?.ToLower() ?? "id";
        sortOrder = sortOrder?.ToLower() ?? "asc";

        query = sortBy switch
        {
            "price" => sortOrder == "desc" ? query.OrderByDescending(s => s.Price) : query.OrderBy(s => s.Price),
            "duration" => sortOrder == "desc" ? query.OrderByDescending(s => s.DurationMinutes) : query.OrderBy(s => s.DurationMinutes),
            "type" => sortOrder == "desc" ? query.OrderByDescending(s => s.Type) : query.OrderBy(s => s.Type),
            _ => sortOrder == "desc" ? query.OrderByDescending(s => s.Id) : query.OrderBy(s => s.Id)
        };

        return await query.ToListAsync();
    }

    // GET: api/sessions/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Class>> GetSession(int id)
    {
        var session = await _context.Classes
            .Include(s => s.Trainer)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (session == null)
        {
            return NotFound();
        }

        return session;
    }

    // POST: api/sessions
    [HttpPost]
    public async Task<ActionResult<Class>> CreateSession(Class session)
    {
        _context.Classes.Add(session);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSession), new { id = session.Id }, session);
    }

    // PUT: api/sessions/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSession(int id, Class session)
    {
        if (id != session.Id)
        {
            return BadRequest();
        }

        _context.Entry(session).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!SessionExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/sessions/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSession(int id)
    {
        var session = await _context.Classes.FindAsync(id);
        if (session == null)
        {
            return NotFound();
        }

        _context.Classes.Remove(session);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/sessions/trainer/5
    [HttpGet("trainer/{trainerId}")]
    public async Task<ActionResult<IEnumerable<Class>>> GetSessionsByTrainer(int trainerId)
    {
        return await _context.Classes
            .Include(s => s.Trainer)
            .Where(s => s.TrainerId == trainerId)
            .ToListAsync();
    }

    private bool SessionExists(int id)
    {
        return _context.Classes.Any(e => e.Id == id);
    }
}

