export const prepareGraphData = (entries: any[], getEntryDate: (entry: any) => string) => {
  if (!entries?.length) return [];
  
  const today = new Date();
  const currentDay = today.getDay();
  const daysToSaturday = currentDay === 0 ? 7 : currentDay;
  
  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - daysToSaturday + i);
    return date.toLocaleDateString('en-CA');
  });
  
  const dailyCompletions = last7Days.map(date => {
    const completedCount = entries.filter(entry => {
      const entryDate = new Date(getEntryDate(entry));
      entryDate.setDate(entryDate.getDate() + 1); // Adjust for timezone offset
      const compareDate = new Date(date);
      return entryDate.getDate() === compareDate.getDate() &&
             entryDate.getMonth() === compareDate.getMonth() &&
             entryDate.getFullYear() === compareDate.getFullYear();
    }).length;
    
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      completed: completedCount
    };
  });

  return dailyCompletions;
}; 