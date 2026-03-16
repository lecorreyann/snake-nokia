/**
 * Snake Game - Nokia 3310 Style
 * React Native + Web
 */

import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Vibration,
  Pressable,
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

// Nokia 3310 colors
const NOKIA_COLORS = {
  background: '#9BBC0F', // LCD green/yellow background
  pixel: '#0F380F', // Dark green/black for pixels
  pixelLight: '#8BAC0F', // Lighter green for empty cells
  border: '#306230', // Border color
};

// Game constants
const GRID_SIZE = 15;
const CELL_SIZE = Platform.OS === 'web' ? 20 : Math.floor(
  (Dimensions.get('window').width - 40) / GRID_SIZE,
);
const GAME_SPEED = 150;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = {x: number; y: number};

// Safe vibration function for all platforms
const vibrate = (duration: number) => {
  if (Platform.OS === 'web') {
    return;
  }
  try {
    Vibration.vibrate(duration);
  } catch (e) {
    // Vibration not available
  }
};

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={NOKIA_COLORS.background} />
      <SafeAreaView style={styles.safeArea}>
        <SnakeGame />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function SnakeGame(): React.JSX.Element {
  const [snake, setSnake] = useState<Position[]>([
    {x: 7, y: 7},
    {x: 6, y: 7},
    {x: 5, y: 7},
  ]);
  const [food, setFood] = useState<Position>({x: 10, y: 7});
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const directionRef = useRef(direction);
  const isPausedRef = useRef(isPaused);
  const isGameOverRef = useRef(isGameOver);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isGameOverRef.current = isGameOver;
  }, [isGameOver]);

  const generateFood = useCallback(
    (currentSnake: Position[]): Position => {
      let newFood: Position;
      do {
        newFood = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
        };
      } while (
        currentSnake.some(
          segment => segment.x === newFood.x && segment.y === newFood.y,
        )
      );
      return newFood;
    },
    [],
  );

  const checkCollision = useCallback((head: Position, body: Position[]): boolean => {
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    return body.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
  }, []);

  const moveSnake = useCallback(() => {
    setSnake(currentSnake => {
      const head = {...currentSnake[0]};
      const currentDirection = directionRef.current;

      switch (currentDirection) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      if (checkCollision(head, currentSnake)) {
        setIsGameOver(true);
        setIsPaused(true);
        vibrate(200);
        setHighScore(prev => Math.max(prev, score));
        return currentSnake;
      }

      const newSnake = [head, ...currentSnake];

      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood(newSnake));
        vibrate(50);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, checkCollision, generateFood, score]);

  useEffect(() => {
    if (!isPaused && !isGameOver) {
      const gameLoop = setInterval(moveSnake, GAME_SPEED);
      return () => clearInterval(gameLoop);
    }
  }, [isPaused, isGameOver, moveSnake]);

  const changeDirection = useCallback((newDirection: Direction) => {
    const current = directionRef.current;
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };

    if (opposites[newDirection] !== current) {
      setDirection(newDirection);
    }
  }, []);

  const startGame = useCallback(() => {
    setSnake([
      {x: 7, y: 7},
      {x: 6, y: 7},
      {x: 5, y: 7},
    ]);
    setDirection('RIGHT');
    setFood({x: 10, y: 7});
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
  }, []);

  const handleScreenPress = useCallback(() => {
    if (isGameOver || isPaused) {
      startGame();
    }
  }, [isGameOver, isPaused, startGame]);

  // Keyboard controls for web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            e.preventDefault();
            if (isPausedRef.current || isGameOverRef.current) {
              startGame();
            } else {
              changeDirection('UP');
            }
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            e.preventDefault();
            if (isPausedRef.current || isGameOverRef.current) {
              startGame();
            } else {
              changeDirection('DOWN');
            }
            break;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            e.preventDefault();
            if (isPausedRef.current || isGameOverRef.current) {
              startGame();
            } else {
              changeDirection('LEFT');
            }
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            e.preventDefault();
            if (isPausedRef.current || isGameOverRef.current) {
              startGame();
            } else {
              changeDirection('RIGHT');
            }
            break;
          case ' ':
          case 'Enter':
            e.preventDefault();
            if (isGameOverRef.current || isPausedRef.current) {
              startGame();
            }
            break;
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [changeDirection, startGame]);

  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isSnake = snake.some(segment => segment.x === x && segment.y === y);
        const isHead = snake[0].x === x && snake[0].y === y;
        const isFood = food.x === x && food.y === y;

        cells.push(
          <View
            key={`${x}-${y}`}
            style={[
              styles.cell,
              isSnake && styles.snakeCell,
              isHead && styles.snakeHead,
              isFood && styles.foodCell,
            ]}
          />,
        );
      }
    }
    return cells;
  };

  return (
    <View style={styles.container}>
      {/* Nokia Header */}
      <View style={styles.header}>
        <Text style={styles.nokiaText}>NOKIA</Text>
        <Text style={styles.titleText}>SNAKE II</Text>
      </View>

      {/* Score Display */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>SCORE: {score}</Text>
        <Text style={styles.scoreText}>HI: {highScore}</Text>
      </View>

      {/* Game Board - Touchable */}
      <Pressable onPress={handleScreenPress}>
        <View style={styles.gameBoard}>
          <View style={styles.grid}>{renderGrid()}</View>

          {/* Overlay Messages */}
          {isPaused && !isGameOver && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>SNAKE</Text>
              <Text style={styles.overlaySubText}>Toucher pour jouer</Text>
            </View>
          )}

          {isGameOver && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>GAME OVER</Text>
              <Text style={styles.overlaySubText}>Score: {score}</Text>
              <Text style={styles.overlaySubText}>Toucher pour rejouer</Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* D-Pad Controls - Centered at bottom */}
      <View style={styles.controlsContainer}>
        <View style={styles.dPad}>
          {/* Up button */}
          <View style={styles.dPadRow}>
            <TouchableOpacity
              style={styles.dPadButton}
              onPress={() => changeDirection('UP')}
              activeOpacity={0.7}>
              <View style={styles.dPadArrow}>
                <Text style={styles.arrowText}>▲</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Left, Center, Right */}
          <View style={styles.dPadRow}>
            <TouchableOpacity
              style={styles.dPadButton}
              onPress={() => changeDirection('LEFT')}
              activeOpacity={0.7}>
              <View style={styles.dPadArrow}>
                <Text style={styles.arrowText}>◀</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.dPadCenter} />

            <TouchableOpacity
              style={styles.dPadButton}
              onPress={() => changeDirection('RIGHT')}
              activeOpacity={0.7}>
              <View style={styles.dPadArrow}>
                <Text style={styles.arrowText}>▶</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Down button */}
          <View style={styles.dPadRow}>
            <TouchableOpacity
              style={styles.dPadButton}
              onPress={() => changeDirection('DOWN')}
              activeOpacity={0.7}>
              <View style={styles.dPadArrow}>
                <Text style={styles.arrowText}>▼</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: NOKIA_COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: NOKIA_COLORS.background,
    alignItems: 'center',
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  nokiaText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: NOKIA_COLORS.pixel,
    letterSpacing: 6,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: NOKIA_COLORS.pixel,
    letterSpacing: 3,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: GRID_SIZE * CELL_SIZE + 8,
    marginBottom: 8,
    paddingHorizontal: 5,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: NOKIA_COLORS.pixel,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  gameBoard: {
    borderWidth: 4,
    borderColor: NOKIA_COLORS.border,
    backgroundColor: NOKIA_COLORS.pixelLight,
    padding: 2,
  },
  grid: {
    width: GRID_SIZE * CELL_SIZE,
    height: GRID_SIZE * CELL_SIZE,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: NOKIA_COLORS.pixelLight,
    borderWidth: 0.5,
    borderColor: NOKIA_COLORS.background,
  },
  snakeCell: {
    backgroundColor: NOKIA_COLORS.pixel,
  },
  snakeHead: {
    backgroundColor: NOKIA_COLORS.pixel,
  },
  foodCell: {
    backgroundColor: NOKIA_COLORS.pixel,
    borderRadius: CELL_SIZE / 4,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(155, 188, 15, 0.95)',
  },
  overlayText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: NOKIA_COLORS.pixel,
    marginBottom: 15,
  },
  overlaySubText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: NOKIA_COLORS.pixel,
    marginTop: 5,
  },
  controlsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  dPad: {
    alignItems: 'center',
  },
  dPadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dPadButton: {
    width: 65,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dPadCenter: {
    width: 65,
    height: 65,
    backgroundColor: NOKIA_COLORS.border,
    borderRadius: 32,
  },
  dPadArrow: {
    width: 60,
    height: 60,
    backgroundColor: NOKIA_COLORS.border,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.3,
      shadowRadius: 3,
    }),
  },
  arrowText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: NOKIA_COLORS.pixelLight,
  },
});

export default App;
