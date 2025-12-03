using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MIS330_GroupProject1.Data;
using MIS330_GroupProject1.Models;

namespace MIS330_GroupProject1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrainersController : ControllerBase
{
    private readonly PetTrainingDbContext _context;

    public TrainersController(PetTrainingDbContext context)
    {
        _context = context;
    }

    // GET: api/trainers
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Trainer>>> GetTrainers()
    {
        return await _context.Trainers.ToListAsync();
    }
}

