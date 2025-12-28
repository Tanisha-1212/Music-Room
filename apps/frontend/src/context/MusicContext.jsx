// src/context/MusicContext.jsx
import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const MusicContext = createContext();

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within MusicProvider');
  }
  return context;
};

export const MusicProvider = ({ children }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [currentMusic, setCurrentMusic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchMusic = async (query, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/music/search', { 
        params: { q: query, limit } 
      });

      const results = response.data.data.results || response.data.data;
      setSearchResults(results);

      return {
        success: true,
        results
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to search music';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const getMusicDetails = async (videoId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/music/details/${videoId}`);

      const music = response.data.data.music || response.data.data;
      setCurrentMusic(music);

      return {
        success: true,
        music
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get music details';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setError(null);
  };

  const clearCurrentMusic = () => {
    setCurrentMusic(null);
    setError(null);
  };

  const value = {
    searchResults,
    currentMusic,
    loading,
    error,
    searchMusic,
    getMusicDetails,
    clearSearch,
    clearCurrentMusic,
    setSearchResults,
    setCurrentMusic,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
};