import { useState } from 'react';
import styles from '../FlappyFrog.module.css';

interface DifficultySelectorProps {
  onSelectDifficulty: (gravity: number, difficultyName: string) => void;
}

export default function DifficultySelector({ onSelectDifficulty }: DifficultySelectorProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  
  const difficulties = [
    { name: "I am a wimp", gravity: 0.3 },
    { name: "Hey, not too rough", gravity: 0.45 },
    { name: "Hurt me plenty", gravity: 0.6 },
    { name: "Ultra-violence", gravity: 0.8 }
  ];

  const handleSelectDifficulty = (index: number) => {
    setSelectedDifficulty(index);
  };

  const handleStartGame = () => {
    if (selectedDifficulty !== null) {
      onSelectDifficulty(
        difficulties[selectedDifficulty].gravity,
        difficulties[selectedDifficulty].name
      );
    }
  };

  return (
    <div className={styles.difficultySelector}>
      <h2>Select Difficulty</h2>
      <div className={styles.difficultyOptions}>
        {difficulties.map((difficulty, index) => (
          <button
            key={index}
            className={`${styles.difficultyButton} ${selectedDifficulty === index ? styles.selected : ''}`}
            onClick={() => handleSelectDifficulty(index)}
          >
            {difficulty.name}
          </button>
        ))}
      </div>
      <button 
        className={styles.startButton}
        onClick={handleStartGame}
        disabled={selectedDifficulty === null}
      >
        Start Game
      </button>
    </div>
  );
} 