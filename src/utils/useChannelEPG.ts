import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Channel, EPGProgram, EPGProgramCategory, EPGSchedule } from '../types';
import { 
  generateEPGSchedule, 
  getSavedReminders, 
  toggleProgramReminder, 
  isProgramReminderSet 
} from './epgService';

export function useChannelEPG(channel: Channel | null) {
  const [dateOffset, setDateOffset] = useState<number>(0); // 0 = today, 1 = tomorrow, -1 = yesterday
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [schedule, setSchedule] = useState<EPGSchedule | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reminders, setReminders] = useState<string[]>(() => getSavedReminders());
  const [currentTimeTick, setCurrentTimeTick] = useState<number>(Date.now());

  // Update clock tick every 10 seconds to keep live progress bar & active program updated
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeTick(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Fetch / Generate schedule whenever channel, dateOffset or clock tick updates
  useEffect(() => {
    if (!channel) {
      setSchedule(null);
      return;
    }

    setIsLoading(true);
    // Slight microtask debounce / async simulation to simulate realistic network fetch
    const timeout = setTimeout(() => {
      const generated = generateEPGSchedule(channel, dateOffset);
      setSchedule(generated);
      setIsLoading(false);
    }, 120);

    return () => clearTimeout(timeout);
  }, [channel?.id, dateOffset, currentTimeTick]);

  // Toggle reminder
  const handleToggleReminder = useCallback((programId: string) => {
    const isNowSaved = toggleProgramReminder(programId);
    setReminders(getSavedReminders());
    return isNowSaved;
  }, []);

  // Filter programs based on category and search query
  const filteredPrograms = useMemo(() => {
    if (!schedule) return [];

    return schedule.programs.filter((prog) => {
      // Category filter
      if (selectedCategory !== 'all' && prog.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = prog.title.toLowerCase().includes(q);
        const matchesDesc = prog.description.toLowerCase().includes(q);
        const matchesSubtitle = prog.subtitle?.toLowerCase().includes(q);
        const matchesTags = prog.tags?.some((t) => t.toLowerCase().includes(q));
        return matchesTitle || matchesDesc || matchesSubtitle || matchesTags;
      }

      return true;
    });
  }, [schedule, selectedCategory, searchQuery]);

  return {
    schedule,
    isLoading,
    dateOffset,
    setDateOffset,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filteredPrograms,
    reminders,
    toggleReminder: handleToggleReminder,
    isReminderSet: isProgramReminderSet,
    refresh: () => {
      if (channel) {
        setSchedule(generateEPGSchedule(channel, dateOffset));
      }
    },
  };
}
