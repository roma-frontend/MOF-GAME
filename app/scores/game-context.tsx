'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Типы данных
export interface Game {
  id: number;
  name: string;
  points: {
    first: number;
    second: number;
    third: number;
  };
}

export interface Team {
  id: number;
  name: string;
  color: string;
  icon: string;
}

export interface GameResults {
  [gameId: number]: {
    first?: number;
    second?: number;
    third?: number;
  };
}

interface GameContextType {
  games: Game[];
  teams: Team[];
  gameResults: GameResults;
  totalScores: { [teamId: number]: number };
  isAllGamesCompleted: boolean;
  winner: Team | null;
  setTeamPlace: (gameId: number, teamId: number, place: 'first' | 'second' | 'third') => void;
  resetScores: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Статические данные
const GAMES: Game[] = [
  { id: 1, name: 'Ճանաչիր Սևանը', points: { first: 20, second: 15, third: 10 } },
  { id: 2, name: 'Քարհավաք', points: { first: 40, second: 25, third: 15 } },
  { id: 3, name: 'Ճանաչիր ՖՆ', points: { first: 15, second: 10, third: 5 } },
  { id: 4, name: 'Ճանաչիր ԱԶԲ', points: { first: 15, second: 10, third: 5 } },
  { id: 5, name: 'Թիմային խաղ', points: { first: 35, second: 20, third: 10 } },
];

const TEAMS: Team[] = [
  { id: 1, name: 'Ջրում', color: 'from-blue-400 to-cyan-600', icon: '💧' },
  { id: 2, name: 'Ցամաքում', color: 'from-emerald-400 to-green-600', icon: '🏔️' },
  { id: 3, name: 'Օդում', color: 'from-purple-400 to-pink-600', icon: '☁️' }
];

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameResults, setGameResults] = useState<GameResults>({});
  const [totalScores, setTotalScores] = useState<{ [teamId: number]: number }>(() => {
    const initial: { [teamId: number]: number } = {};
    TEAMS.forEach(team => {
      initial[team.id] = 0;
    });
    return initial;
  });

  // Проверка завершения всех игр
  const isAllGamesCompleted = GAMES.every(game => {
    const result = gameResults[game.id];
    return result && result.first && result.second && result.third;
  });

  // Определение победителя
  const winner = isAllGamesCompleted ? (() => {
    const maxScore = Math.max(...Object.values(totalScores));
    if (maxScore === 0) return null;
    const winnerId = Object.entries(totalScores).find(([, score]) => score === maxScore)?.[0];
    return winnerId ? TEAMS.find(team => team.id === parseInt(winnerId)) || null : null;
  })() : null;

  // Загрузка данных при монтировании
  useEffect(() => {
    try {
      const savedResults = localStorage.getItem('gameResults');
      if (savedResults) {
        const parsed = JSON.parse(savedResults);
        if (typeof parsed === 'object' && parsed !== null) {
          setGameResults(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading gameResults:', error);
      localStorage.removeItem('gameResults'); // Очищаем поврежденные данные
    }
  }, []);

  // Сохранение результатов при изменении
  useEffect(() => {
    if (Object.keys(gameResults).length > 0) {
      try {
        localStorage.setItem('gameResults', JSON.stringify(gameResults));
      } catch (error) {
        console.error('Error saving gameResults:', error);
      }
    }
  }, [gameResults]);

  // Вычисление общих очков
  useEffect(() => {
    const calculateTotalScores = () => {
      const newTotalScores: { [teamId: number]: number } = {};
      
      // Инициализируем все команды нулями
      TEAMS.forEach(team => {
        newTotalScores[team.id] = 0;
      });

      // Подсчитываем очки
      Object.entries(gameResults).forEach(([gameId, result]) => {
        if (!result || typeof result !== 'object') return;
        
        const game = GAMES.find(g => g.id === parseInt(gameId));
        if (!game) return;
        
        if (result.first && typeof result.first === 'number' && newTotalScores.hasOwnProperty(result.first)) {
          newTotalScores[result.first] = (newTotalScores[result.first] || 0) + game.points.first;
        }
        if (result.second && typeof result.second === 'number' && newTotalScores.hasOwnProperty(result.second)) {
          newTotalScores[result.second] = (newTotalScores[result.second] || 0) + game.points.second;
        }
        if (result.third && typeof result.third === 'number' && newTotalScores.hasOwnProperty(result.third)) {
          newTotalScores[result.third] = (newTotalScores[result.third] || 0) + game.points.third;
        }
      });

      return newTotalScores;
    };

    const newScores = calculateTotalScores();
    setTotalScores(newScores);
    
    try {
      localStorage.setItem('totalScores', JSON.stringify(newScores));
    } catch (error) {
      console.error('Error saving totalScores:', error);
    }
  }, [gameResults]);

  // Слушаем изменения из других вкладок
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gameResults' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (typeof parsed === 'object' && parsed !== null) {
            setGameResults(parsed);
          }
        } catch (error) {
          console.error('Error parsing gameResults from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Функция для установки места команды в игре
  const setTeamPlace = (gameId: number, teamId: number, place: 'first' | 'second' | 'third') => {
    setGameResults(prev => {
      const newResults = { ...prev };
      
      // Инициализируем объект для игры, если его нет
      if (!newResults[gameId]) {
        newResults[gameId] = {};
      }
      
      // Удаляем команду из других мест в этой игре
      const places: Array<'first' | 'second' | 'third'> = ['first', 'second', 'third'];
      places.forEach(p => {
        if (newResults[gameId][p] === teamId) {
          delete newResults[gameId][p];
        }
      });
      
      // Если команда уже занимает это место, убираем её
      if (newResults[gameId][place] === teamId) {
        delete newResults[gameId][place];
      } else {
        // Проверяем, не занято ли это место другой командой
        const currentTeam = newResults[gameId][place];
        if (!currentTeam) {
          newResults[gameId][place] = teamId;
        }
      }
      
      // Если в игре нет результатов, удаляем её из объекта
      if (Object.keys(newResults[gameId]).length === 0) {
        delete newResults[gameId];
      }
      
      return newResults;
    });
  };

  // Функция для сброса всех очков
  const resetScores = () => {
    setGameResults({});
    const emptyScores: { [teamId: number]: number } = {};
    TEAMS.forEach(team => {
      emptyScores[team.id] = 0;
    });
    setTotalScores(emptyScores);
    
    try {
      localStorage.removeItem('gameResults');
      localStorage.removeItem('totalScores');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  return (
    <GameContext.Provider value={{ 
      games: GAMES, 
      teams: TEAMS, 
      gameResults, 
      totalScores,
      isAllGamesCompleted,
      winner,
      setTeamPlace, 
      resetScores 
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}