namespace MIS330_GroupProject1.Models;

public class Trainer
{
    public int EmployeeId { get; set; }
    public int HourlyRate { get; set; }
    public string Specialities { get; set; } = string.Empty;
    public Employee Employee { get; set; } = null!;
    public List<Class> Classes { get; set; } = new();
}
