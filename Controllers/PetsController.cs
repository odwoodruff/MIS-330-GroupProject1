using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MIS330_GroupProject1.Data;
using MIS330_GroupProject1.Models;

namespace MIS330_GroupProject1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PetsController : ControllerBase
{
    private readonly PetTrainingDbContext _context;

    public PetsController(PetTrainingDbContext context)
    {
        _context = context;
    }

    // GET: api/pets
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Pet>>> GetPets()
    {
        return await _context.Pets
            .Include(p => p.Customer)
            .ToListAsync();
    }

    // GET: api/pets/customer/5
    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<IEnumerable<Pet>>> GetPetsByCustomer(int customerId)
    {
        return await _context.Pets
            .Where(p => p.CustomerId == customerId)
            .Include(p => p.Customer)
            .ToListAsync();
    }

    // GET: api/pets/owner/5 (backward compatibility)
    [HttpGet("owner/{ownerId}")]
    public async Task<ActionResult<IEnumerable<Pet>>> GetPetsByOwner(int ownerId)
    {
        return await _context.Pets
            .Where(p => p.CustomerId == ownerId)
            .Include(p => p.Customer)
            .ToListAsync();
    }

    // POST: api/pets
    [HttpPost]
    public async Task<ActionResult<Pet>> CreatePet(Pet pet)
    {
        _context.Pets.Add(pet);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPets), new { id = pet.PetId }, pet);
    }
}

