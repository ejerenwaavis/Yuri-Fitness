import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from '../App';

export type WeightUnit = 'kg' | 'lbs';

interface UnitContextType {
  unit: WeightUnit;
  setUnit: (unit: WeightUnit) => void;
  formatWeight: (kgVal?: number | null) => string;
  toDisplayWeight: (kgVal?: number | null) => number;
  fromDisplayWeight: (displayVal: number) => number;
  weightPickerOptions: number[];
}

const KG_TO_LBS = 2.20462;

export const UnitContext = createContext<UnitContextType>({
  unit: 'kg',
  setUnit: () => {},
  formatWeight: () => '0 kg',
  toDisplayWeight: () => 0,
  fromDisplayWeight: () => 0,
  weightPickerOptions: []
});

export const useUnit = () => useContext(UnitContext);

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useContext(AuthContext);

  const [unit, setUnitState] = useState<WeightUnit>(() => {
    const saved = localStorage.getItem('yuri_unit');
    if (saved === 'lbs' || saved === 'kg') return saved;
    if (user?.profile?.weightUnit === 'lbs' || user?.profile?.weightUnit === 'kg') {
      return user.profile.weightUnit;
    }
    return 'kg';
  });

  // Sync with user profile if it updates
  useEffect(() => {
    if (user?.profile?.weightUnit && user.profile.weightUnit !== unit) {
      setUnitState(user.profile.weightUnit);
      localStorage.setItem('yuri_unit', user.profile.weightUnit);
    }
  }, [user?.profile?.weightUnit]);

  const setUnit = async (newUnit: WeightUnit) => {
    setUnitState(newUnit);
    localStorage.setItem('yuri_unit', newUnit);

    const token = localStorage.getItem('yuri_token');
    if (token) {
      try {
        const res = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            profile: { weightUnit: newUnit }
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (updateUser) updateUser(data);
        }
      } catch (err) {
        console.error('Failed to sync unit preference to backend:', err);
      }
    }
  };

  const toDisplayWeight = (kgVal?: number | null): number => {
    if (kgVal == null || isNaN(kgVal)) return 0;
    if (unit === 'lbs') {
      return Math.round(kgVal * KG_TO_LBS);
    }
    return Math.round(kgVal * 2) / 2; // nearest 0.5 kg
  };

  const fromDisplayWeight = (displayVal: number): number => {
    if (!displayVal || isNaN(displayVal)) return 0;
    if (unit === 'lbs') {
      return Math.round((displayVal / KG_TO_LBS) * 10) / 10;
    }
    return displayVal;
  };

  const formatWeight = (kgVal?: number | null): string => {
    if (kgVal == null || kgVal === 0) return 'Bodyweight';
    const val = toDisplayWeight(kgVal);
    return `${val} ${unit}`;
  };

  const weightPickerOptions =
    unit === 'lbs'
      ? [
          0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85,
          90, 95, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 225,
          250, 275, 300
        ]
      : [
          0, 2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35,
          37.5, 40, 42.5, 45, 47.5, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
          100, 110, 120, 130, 140, 150
        ];

  return (
    <UnitContext.Provider
      value={{
        unit,
        setUnit,
        formatWeight,
        toDisplayWeight,
        fromDisplayWeight,
        weightPickerOptions
      }}
    >
      {children}
    </UnitContext.Provider>
  );
}
