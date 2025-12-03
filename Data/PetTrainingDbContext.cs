using Microsoft.EntityFrameworkCore;
using MIS330_GroupProject1.Models;

namespace MIS330_GroupProject1.Data;

public class PetTrainingDbContext : DbContext
{
    public PetTrainingDbContext(DbContextOptions<PetTrainingDbContext> options) : base(options)
    {
    }

    public DbSet<Customer> Customers { get; set; }
    public DbSet<Pet> Pets { get; set; }
    public DbSet<Trainer> Trainers { get; set; }
    public DbSet<Employee> Employees { get; set; }
    public DbSet<Class> Classes { get; set; }
    public DbSet<Booking> Bookings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Map to database table names (singular, lowercase)
        modelBuilder.Entity<Customer>().ToTable("customer");
        modelBuilder.Entity<Pet>().ToTable("pet");
        modelBuilder.Entity<Trainer>().ToTable("trainer");
        modelBuilder.Entity<Employee>().ToTable("employee");
        modelBuilder.Entity<Class>().ToTable("class");
        modelBuilder.Entity<Booking>().ToTable("booking");

        // Configure primary keys
        modelBuilder.Entity<Customer>().HasKey(c => c.CustomerId);
        modelBuilder.Entity<Pet>().HasKey(p => p.PetId);
        modelBuilder.Entity<Employee>().HasKey(e => e.EmployeeId);
        modelBuilder.Entity<Trainer>().HasKey(t => t.EmployeeId);
        modelBuilder.Entity<Class>().HasKey(c => c.ClassId);
        modelBuilder.Entity<Booking>().HasKey(b => b.BookingId);

        // Configure relationships
        modelBuilder.Entity<Pet>()
            .HasOne(p => p.Customer)
            .WithMany(c => c.Pets)
            .HasForeignKey(p => p.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Pet)
            .WithMany(p => p.Bookings)
            .HasForeignKey(b => b.PetId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Booking>()
            .HasOne(b => b.Class)
            .WithMany(c => c.Bookings)
            .HasForeignKey(b => b.ClassId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Trainer>()
            .HasOne(t => t.Employee)
            .WithOne(e => e.Trainer)
            .HasForeignKey<Trainer>(t => t.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Class>()
            .HasOne(c => c.Trainer)
            .WithMany(t => t.Classes)
            .HasForeignKey(c => c.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
