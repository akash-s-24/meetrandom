import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useUserStats() {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('meetrandom_profile');
    if (saved) return JSON.parse(saved);
    return {
      userId: uuidv4(),
      nickname: '',
      gender: '',
      country: '',
      interests: [],
      targetGender: '',
      targetCountry: ''
    };
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('meetrandom_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('meetrandom_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('meetrandom_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('meetrandom_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('meetrandom_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const updateProfile = (updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const addHistory = (partner) => {
    if (!partner || !partner.userId) return;
    setHistory(prev => {
      // Avoid immediate duplicates
      if (prev.length > 0 && prev[0].userId === partner.userId) return prev;
      const newHistory = [{ ...partner, date: new Date().toISOString() }, ...prev];
      return newHistory.slice(0, 50); // Keep last 50
    });
  };

  const toggleFavorite = (partner) => {
    if (!partner || !partner.userId) return;
    setFavorites(prev => {
      const exists = prev.find(p => p.userId === partner.userId);
      if (exists) {
        return prev.filter(p => p.userId !== partner.userId);
      } else {
        return [{ ...partner, dateAdded: new Date().toISOString() }, ...prev];
      }
    });
  };

  return {
    profile,
    updateProfile,
    history,
    addHistory,
    favorites,
    toggleFavorite
  };
}
