"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import styles from "./FlappyFrog.module.css";
import DifficultySelector from "./components/DifficultySelector";

// Define an interface for the tube object
interface Tube {
  x: number;
  gapTop: number;
  gapBottom: number;
  passed: boolean;
  color: string;
}

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [frogPosition, setFrogPosition] = useState(250);
  const [frogVelocity, setFrogVelocity] = useState(0);
  // Properly type the tubes state
  const [tubes, setTubes] = useState<Tube[]>([]);
  const [backgroundColor, setBackgroundColor] = useState('#B0E0E6'); // Initial light blue
  const [showDifficultySelector, setShowDifficultySelector] = useState(true);
  const [gravity, setGravity] = useState(0.6); // Default gravity
  const [difficultyName, setDifficultyName] = useState("");
  
  // Refs for game state
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const tubeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const frogPositionRef = useRef<number>(250);
  const frogVelocityRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Game constants
  const JUMP_FORCE = -10;
  const TUBE_WIDTH = 80;
  const TUBE_GAP = 180;
  const TUBE_SPEED = 3;
  const FROG_WIDTH = 50;
  const FROG_HEIGHT = 50;

  // Initialize game
  useEffect(() => {
    if (gameAreaRef.current) {
      gameAreaRef.current.focus();
    }
    
    // Create audio element for Doom theme
    const basePath = process.env.NODE_ENV === 'production' ? '/your-repo-name' : '';
    audioRef.current = new Audio(`${basePath}/doom-theme.mp3`);
    audioRef.current.loop = true;
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (tubeIntervalRef.current) {
        clearInterval(tubeIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle difficulty selection
  const handleSelectDifficulty = (selectedGravity: number, selectedDifficultyName: string) => {
    setGravity(selectedGravity);
    setDifficultyName(selectedDifficultyName);
    setShowDifficultySelector(false);
  };

  // Handle jump
  const handleJump = () => {
    if (!gameStarted && !showDifficultySelector) {
      startGame();
    } else if (!gameOver && gameStarted) {
      // Set velocity directly on the ref for immediate effect
      frogVelocityRef.current = JUMP_FORCE;
      setFrogVelocity(JUMP_FORCE); // Update state for rendering
    } else if (gameOver) {
      resetGame();
    }
  };

  // Start game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    
    // Initialize position and velocity
    frogPositionRef.current = 250;
    frogVelocityRef.current = 0;
    setFrogPosition(250);
    setFrogVelocity(0);
    
    setTubes([]);
    lastTimeRef.current = 0;
    
    // Start playing the Doom theme
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
    
    // Generate tubes at regular intervals
    tubeIntervalRef.current = setInterval(() => {
      const gapPosition = Math.floor(Math.random() * 300) + 100;
      
      setTubes(prevTubes => [
        ...prevTubes,
        {
          x: 800,
          gapTop: gapPosition,
          gapBottom: gapPosition + TUBE_GAP,
          passed: false,
          color: getColorForScore(score)
        }
      ]);
    }, 2000);

    // Start game loop
    requestRef.current = requestAnimationFrame(updateGameState);
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setShowDifficultySelector(true);
    
    frogPositionRef.current = 250;
    frogVelocityRef.current = 0;
    setFrogPosition(250);
    setFrogVelocity(0);
    
    setTubes([]);
    
    // Stop the music
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (tubeIntervalRef.current) {
      clearInterval(tubeIntervalRef.current);
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  };

  // Game update function
  const updateGameState = (timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }
    
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // Apply gravity to velocity using refs for immediate effect
    frogVelocityRef.current += gravity;
    
    // Update frog position based on velocity
    frogPositionRef.current += frogVelocityRef.current;
    
    // Check if frog hits the ground or ceiling
    if (frogPositionRef.current > 550 || frogPositionRef.current < 0) {
      setGameOver(true);
      if (tubeIntervalRef.current) {
        clearInterval(tubeIntervalRef.current);
        tubeIntervalRef.current = null;
      }
      // Stop the music
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      // Update the state values for rendering
      setFrogPosition(frogPositionRef.current);
      setFrogVelocity(frogVelocityRef.current);
    }

    // Update tubes position and check collisions
    setTubes(prevTubes => {
      const updatedTubes = prevTubes
        .map(tube => {
          // Move tube to the left
          const updatedTube = {
            ...tube,
            x: tube.x - TUBE_SPEED
          };

          // Check if frog passed the tube
          if (!tube.passed && updatedTube.x + TUBE_WIDTH < 150) {
            setScore(prevScore => {
              const newScore = prevScore + 1;
              updateTubeColors(newScore);
              return newScore;
            });
            updatedTube.passed = true;
          }

          // Check collision using the ref value
          if (
            150 + FROG_WIDTH > updatedTube.x &&
            150 < updatedTube.x + TUBE_WIDTH &&
            (frogPositionRef.current < updatedTube.gapTop || 
             frogPositionRef.current + FROG_HEIGHT > updatedTube.gapBottom)
          ) {
            setGameOver(true);
            if (tubeIntervalRef.current) {
              clearInterval(tubeIntervalRef.current);
              tubeIntervalRef.current = null;
            }
            // Stop the music
            if (audioRef.current) {
              audioRef.current.pause();
            }
          }

          return updatedTube;
        })
        .filter(tube => tube.x > -TUBE_WIDTH);

      return updatedTubes;
    });

    if (!gameOver) {
      requestRef.current = requestAnimationFrame(updateGameState);
    }
  };

  // Get tube color based on score
  const getColorForScore = (score: number): string => {
    const colorLevel = Math.floor(score / 4);
    
    switch (colorLevel % 5) {
      case 0: return '#4CAF50'; // Green
      case 1: return '#2196F3'; // Blue
      case 2: return '#9C27B0'; // Purple
      case 3: return '#FF9800'; // Orange
      case 4: return '#F44336'; // Red
      default: return '#4CAF50';
    }
  };
  
  // Get background color based on score
  const getBackgroundColorForScore = (score: number): string => {
    const colorLevel = Math.floor(score / 4);
    const darkenFactor = Math.min(colorLevel * 5, 40); // Max 40% darker
    
    switch (colorLevel % 5) {
      case 0: return `hsl(180, 50%, ${80 - darkenFactor}%)`; // Light blue getting darker
      case 1: return `hsl(120, 50%, ${75 - darkenFactor}%)`; // Light green getting darker
      case 2: return `hsl(240, 50%, ${80 - darkenFactor}%)`; // Light purple getting darker
      case 3: return `hsl(30, 60%, ${80 - darkenFactor}%)`; // Light orange getting darker
      case 4: return `hsl(0, 60%, ${80 - darkenFactor}%)`; // Light red getting darker
      default: return `hsl(180, 50%, ${80 - darkenFactor}%)`;
    }
  };

  // Update tube colors based on score
  const updateTubeColors = (newScore: number): void => {
    if (newScore % 4 === 0) {
      // Update tube colors
      setTubes(prevTubes => 
        prevTubes.map(tube => ({
          ...tube,
          color: getColorForScore(newScore)
        }))
      );
      
      // Update background color
      setBackgroundColor(getBackgroundColorForScore(newScore));
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Flappy Frog</h1>
      
      <div 
        className={styles.gameArea} 
        ref={gameAreaRef}
        onClick={handleJump}
        onKeyDown={(e) => e.key === ' ' && handleJump()}
        tabIndex={0}
        style={{ backgroundColor }}
      >
        {/* Background elements */}
        <div className={styles.background}>
          <div className={styles.clouds}></div>
          <div className={styles.water}></div>
          <div className={styles.lilyPads}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={styles.lilyPad} style={{ left: `${i * 200}px` }}></div>
            ))}
          </div>
          <div className={styles.reeds}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={styles.reed} style={{ left: `${i * 120 + 50}px` }}></div>
            ))}
          </div>
        </div>
        
        {/* Frog with animation */}
        <div 
          className={`${styles.frog} ${frogVelocity < 0 ? styles.jumping : ''}`}
          style={{ top: `${frogPosition}px` }}
        >
          🐸
        </div>
        
        {/* Mario-style tubes */}
        {tubes.map((tube, index) => (
          <div key={index}>
            {/* Top tube */}
            <div 
              className={styles.tube}
              style={{
                left: `${tube.x}px`,
                height: `${tube.gapTop}px`,
                top: 0,
                backgroundColor: tube.color
              }}
            >
              <div className={styles.tubeCap}></div>
            </div>
            {/* Bottom tube */}
            <div 
              className={styles.tube}
              style={{
                left: `${tube.x}px`,
                height: `${600 - tube.gapBottom}px`,
                top: `${tube.gapBottom}px`,
                backgroundColor: tube.color
              }}
            >
              <div className={styles.tubeCap}></div>
            </div>
          </div>
        ))}
        
        {/* Score */}
        <div className={styles.score}>
          Score: {score}
        </div>
        
        {/* Difficulty display */}
        {gameStarted && (
          <div className={styles.difficultyDisplay}>
            Difficulty: {difficultyName}
          </div>
        )}
        
        {/* Difficulty Selector */}
        {showDifficultySelector && (
          <DifficultySelector onSelectDifficulty={handleSelectDifficulty} />
        )}
        
        {/* Start message */}
        {!gameStarted && !showDifficultySelector && (
          <div className={styles.message}>
            Click or Press Space to Start
          </div>
        )}
        
        {/* Game Over message */}
        {gameOver && (
          <div className={styles.message}>
            Game Over! Score: {score}<br/>
            Click or Press Space to Restart
          </div>
        )}
      </div>
      
      <div className={styles.instructions}>
        <p>Click or press Space to make the frog jump</p>
        <p>Avoid the tubes and try to get the highest score!</p>
        <p>Tube colors change every 4 points</p>
        <p>Made for Chris and his birthday present 🎁</p>
      </div>
    </div>
  );
}
