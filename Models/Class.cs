namespace MIS330_GroupProject1.Models;

public class Class
{
    public int ClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ClassType { get; set; } = string.Empty;
    public string DifficultyLevel { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public decimal Price { get; set; }
    public string Location { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public int EmployeeId { get; set; }
    public Trainer Trainer { get; set; } = null!;
    public List<Booking> Bookings { get; set; } = new();
}
