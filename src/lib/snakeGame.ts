export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type GameMode = 'walls' | 'pass-through';
export type GameStatus = 'idle' | 'playing' | 'paused' | 'game-over';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  status: GameStatus;
  mode: GameMode;
  gridSize: number;
  speed: number;
}

export const INITIAL_SPEED = 150;
export const SPEED_INCREMENT = 5;
export const MIN_SPEED = 50;
export const GRID_SIZE = 20;
export const POINTS_PER_FOOD = 10;

export function createInitialState(mode: GameMode = 'walls'): GameState {
  const center = Math.floor(GRID_SIZE / 2);
  return {
    snake: [
      { x: center, y: center },
      { x: center - 1, y: center },
      { x: center - 2, y: center },
    ],
    food: generateFood([{ x: center, y: center }, { x: center - 1, y: center }, { x: center - 2, y: center }]),
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    score: 0,
    status: 'idle',
    mode,
    gridSize: GRID_SIZE,
    speed: INITIAL_SPEED,
  };
}

export function generateFood(snake: Position[]): Position {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  return food;
}

export function isOppositeDirection(dir1: Direction, dir2: Direction): boolean {
  return (
    (dir1 === 'UP' && dir2 === 'DOWN') ||
    (dir1 === 'DOWN' && dir2 === 'UP') ||
    (dir1 === 'LEFT' && dir2 === 'RIGHT') ||
    (dir1 === 'RIGHT' && dir2 === 'LEFT')
  );
}

export function changeDirection(state: GameState, newDirection: Direction): GameState {
  if (isOppositeDirection(state.direction, newDirection)) {
    return state;
  }
  return { ...state, nextDirection: newDirection };
}

export function getNextHead(head: Position, direction: Direction, mode: GameMode): Position {
  let newHead: Position;
  
  switch (direction) {
    case 'UP':
      newHead = { x: head.x, y: head.y - 1 };
      break;
    case 'DOWN':
      newHead = { x: head.x, y: head.y + 1 };
      break;
    case 'LEFT':
      newHead = { x: head.x - 1, y: head.y };
      break;
    case 'RIGHT':
      newHead = { x: head.x + 1, y: head.y };
      break;
  }

  // Handle pass-through mode (wrap around)
  if (mode === 'pass-through') {
    if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
    if (newHead.x >= GRID_SIZE) newHead.x = 0;
    if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
    if (newHead.y >= GRID_SIZE) newHead.y = 0;
  }

  return newHead;
}

export function checkWallCollision(head: Position): boolean {
  return head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;
}

export function checkSelfCollision(head: Position, snake: Position[]): boolean {
  // Check against all segments except the tail (which will move)
  return snake.slice(0, -1).some(segment => segment.x === head.x && segment.y === head.y);
}

export function tick(state: GameState): GameState {
  if (state.status !== 'playing') {
    return state;
  }

  const direction = state.nextDirection;
  const head = state.snake[0];
  const newHead = getNextHead(head, direction, state.mode);

  // Check wall collision in walls mode
  if (state.mode === 'walls' && checkWallCollision(newHead)) {
    return { ...state, status: 'game-over' };
  }

  // Check self collision
  if (checkSelfCollision(newHead, state.snake)) {
    return { ...state, status: 'game-over' };
  }

  const newSnake = [newHead, ...state.snake];
  let newFood = state.food;
  let newScore = state.score;
  let newSpeed = state.speed;

  // Check if food is eaten
  if (newHead.x === state.food.x && newHead.y === state.food.y) {
    newFood = generateFood(newSnake);
    newScore += POINTS_PER_FOOD;
    newSpeed = Math.max(MIN_SPEED, state.speed - SPEED_INCREMENT);
  } else {
    newSnake.pop(); // Remove tail if no food eaten
  }

  return {
    ...state,
    snake: newSnake,
    food: newFood,
    direction,
    score: newScore,
    speed: newSpeed,
  };
}

export function startGame(state: GameState): GameState {
  return { ...state, status: 'playing' };
}

export function pauseGame(state: GameState): GameState {
  if (state.status !== 'playing') return state;
  return { ...state, status: 'paused' };
}

export function resumeGame(state: GameState): GameState {
  if (state.status !== 'paused') return state;
  return { ...state, status: 'playing' };
}

export function resetGame(mode: GameMode): GameState {
  return createInitialState(mode);
}

// AI movement for spectate mode
export function getAIDirection(state: GameState): Direction {
  const head = state.snake[0];
  const food = state.food;
  const possibleDirections: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  
  // Remove opposite direction
  const validDirections = possibleDirections.filter(
    dir => !isOppositeDirection(state.direction, dir)
  );

  // Sort by distance to food
  validDirections.sort((a, b) => {
    const headA = getNextHead(head, a, state.mode);
    const headB = getNextHead(head, b, state.mode);
    
    const distA = Math.abs(headA.x - food.x) + Math.abs(headA.y - food.y);
    const distB = Math.abs(headB.x - food.x) + Math.abs(headB.y - food.y);
    
    return distA - distB;
  });

  // Check if the best direction would cause collision
  for (const dir of validDirections) {
    const nextHead = getNextHead(head, dir, state.mode);
    
    if (state.mode === 'walls' && checkWallCollision(nextHead)) {
      continue;
    }
    
    if (!checkSelfCollision(nextHead, state.snake)) {
      return dir;
    }
  }

  // If all directions cause collision, just return current direction
  return state.direction;
}
