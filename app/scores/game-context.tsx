'use client';

import { Bird, Fish, Trees } from 'lucide-react';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Типы данных
export interface Game {
  id: number;
  name: string;
  color: string;
  bgColor: string;
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

// Новый тип для детального подсчета очков по играм
export interface DetailedScores {
  [teamId: number]: {
    [gameId: number]: number;
  };
}

interface GameContextType {
  games: Game[];
  teams: Team[];
  gameResults: GameResults;
  totalScores: { [teamId: number]: number };
  detailedScores: DetailedScores; // Детальные очки по играм
  isAllGamesCompleted: boolean;
  winner: Team | null;
  setTeamPlace: (gameId: number, teamId: number, place: 'first' | 'second' | 'third') => void;
  resetScores: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Статические данные с цветами для игр
const GAMES: Game[] = [
  {
    id: 1,
    name: 'Ճանաչիր Սևանը',
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-gradient-to-r from-indigo-50 to-purple-100',
    points: { first: 20, second: 15, third: 10 }
  },
  {
    id: 2,
    name: 'Քարհավաք',
    color: 'from-rose-400 to-pink-600',
    bgColor: 'bg-gradient-to-r from-rose-50 to-pink-100',
    points: { first: 40, second: 25, third: 15 }
  },
  {
    id: 3,
    name: 'Ճանաչիր ՖՆ',
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-gradient-to-r from-amber-50 to-orange-100',
    points: { first: 15, second: 10, third: 5 }
  },
  {
    id: 4,
    name: 'Ճանաչիր ԱԶԲ',
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-gradient-to-r from-emerald-50 to-green-100',
    points: { first: 15, second: 10, third: 5 }
  },
  {
    id: 5,
    name: 'Թիմային խաղ',
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-100',
    points: { first: 35, second: 20, third: 10 }
  },
];

const TEAMS: Team[] = [
  { id: 1, name: 'Ջրում', color: 'from-cyan-400 to-blue-500', icon: "Fish" },
  { id: 2, name: 'Ցամաքում', color: 'from-teal-500 to-green-600', icon: "Trees" },
  { id: 3, name: 'Օդում', color: 'from-blue-400 to-purple-600', icon: "Bird" }
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


  const [detailedScores, setDetailedScores] = useState<DetailedScores>(() => {
    const initial: DetailedScores = {};
    TEAMS.forEach(team => {
      initial[team.id] = {};
      GAMES.forEach(game => {
        initial[team.id][game.id] = 0;
      });
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
      localStorage.removeItem('gameResults');
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


  // Вычисление общих очков и детальных очков
  useEffect(() => {
    const calculateScores = () => {
      const newTotalScores: { [teamId: number]: number } = {};
      const newDetailedScores: DetailedScores = {};

      // Инициализируем все команды нулями
      TEAMS.forEach(team => {
        newTotalScores[team.id] = 0;
        newDetailedScores[team.id] = {};
        GAMES.forEach(game => {
          newDetailedScores[team.id][game.id] = 0;
        });
      });

      // Подсчитываем очки
      Object.entries(gameResults).forEach(([gameId, result]) => {
        if (!result || typeof result !== 'object') return;

        const game = GAMES.find(g => g.id === parseInt(gameId));
        if (!game) return;

        if (result.first && typeof result.first === 'number' && newTotalScores.hasOwnProperty(result.first)) {
          const points = game.points.first;
          newTotalScores[result.first] = (newTotalScores[result.first] || 0) + points;
          newDetailedScores[result.first][game.id] = points;
        }
        if (result.second && typeof result.second === 'number' && newTotalScores.hasOwnProperty(result.second)) {
          const points = game.points.second;
          newTotalScores[result.second] = (newTotalScores[result.second] || 0) + points;
          newDetailedScores[result.second][game.id] = points;
        }
        if (result.third && typeof result.third === 'number' && newTotalScores.hasOwnProperty(result.third)) {
          const points = game.points.third;
          newTotalScores[result.third] = (newTotalScores[result.third] || 0) + points;
          newDetailedScores[result.third][game.id] = points;
        }
      });

      return { newTotalScores, newDetailedScores };
    };

    const { newTotalScores, newDetailedScores } = calculateScores();
    setTotalScores(newTotalScores);
    setDetailedScores(newDetailedScores);

    try {
      localStorage.setItem('totalScores', JSON.stringify(newTotalScores));
      localStorage.setItem('detailedScores', JSON.stringify(newDetailedScores));
    } catch (error) {
      console.error('Error saving scores:', error);
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

      if (!newResults[gameId]) {
        newResults[gameId] = {};
      }

      // Удаляем команду из других мест в этой игре
      for (const key in newResults[gameId]) {
        if (newResults[gameId][key as keyof typeof newResults[number]] === teamId) {
          delete newResults[gameId][key as keyof typeof newResults[number]];
        }
      }

      // Устанавливаем новое место
      newResults[gameId][place] = teamId;

      return newResults;
    });
  };


  // Функция для сброса всех очков
  const resetScores = () => {
    setGameResults({});
    const emptyScores: { [teamId: number]: number } = {};
    const emptyDetailedScores: DetailedScores = {};

    TEAMS.forEach(team => {
      emptyScores[team.id] = 0;
      emptyDetailedScores[team.id] = {};
      GAMES.forEach(game => {
        emptyDetailedScores[team.id][game.id] = 0;
      });
    });

    setTotalScores(emptyScores);
    setDetailedScores(emptyDetailedScores);

    try {
      localStorage.removeItem('gameResults');
      localStorage.removeItem('totalScores');
      localStorage.removeItem('detailedScores');
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
      detailedScores,
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