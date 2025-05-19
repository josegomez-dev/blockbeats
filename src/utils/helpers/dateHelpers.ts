export function formatDate(date: Date): string {
    // Your date formatting logic
    return date.toISOString().split('T')[0];
  }