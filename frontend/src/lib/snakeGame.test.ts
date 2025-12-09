import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  generateFood,
  isOppositeDirection,
  changeDirection,
  getNextHead,
  checkWallCollision,
  checkSelfCollision,
  tick,
  startGame,
  pauseGame,
  resumeGame,
  resetGame,
  getAIDirection,
  GRID_SIZE,
  POINTS_PER_FOOD,
  type Position,
  type GameState,
} from './snakeGame';

describe('Snake Game Logic', () => {
  describe('createInitialState', () => {
    it('should create initial state with walls mode', () => {
      const state = createInitialState('walls');
      expect(state.mode).toBe('walls');
      expect(state.status).toBe('idle');
      expect(state.snake.length).toBe(3);
      expect(state.score).toBe(0);
      expect(state.direction).toBe('RIGHT');
    });

    it('should create initial state with pass-through mode', () => {
      const state = createInitialState('pass-through');
      expect(state.mode).toBe('pass-through');
    });

    it('should place snake in center of grid', () => {
      const state = createInitialState('walls');
      const center = Math.floor(GRID_SIZE / 2);
      expect(state.snake[0]).toEqual({ x: center, y: center });
    });
  });

  describe('generateFood', () => {
    it('should generate food not on snake', () => {
      const snake: Position[] = [{ x: 10, y: 10 }, { x: 9, y: 10 }];
      const food = generateFood(snake);
      
      const isOnSnake = snake.some(s => s.x === food.x && s.y === food.y);
      expect(isOnSnake).toBe(false);
    });

    it('should generate food within grid bounds', () => {
      const snake: Position[] = [{ x: 10, y: 10 }];
      const food = generateFood(snake);
      
      expect(food.x).toBeGreaterThanOrEqual(0);
      expect(food.x).toBeLessThan(GRID_SIZE);
      expect(food.y).toBeGreaterThanOrEqual(0);
      expect(food.y).toBeLessThan(GRID_SIZE);
    });
  });

  describe('isOppositeDirection', () => {
    it('should identify UP and DOWN as opposite', () => {
      expect(isOppositeDirection('UP', 'DOWN')).toBe(true);
      expect(isOppositeDirection('DOWN', 'UP')).toBe(true);
    });

    it('should identify LEFT and RIGHT as opposite', () => {
      expect(isOppositeDirection('LEFT', 'RIGHT')).toBe(true);
      expect(isOppositeDirection('RIGHT', 'LEFT')).toBe(true);
    });

    it('should not identify perpendicular directions as opposite', () => {
      expect(isOppositeDirection('UP', 'LEFT')).toBe(false);
      expect(isOppositeDirection('UP', 'RIGHT')).toBe(false);
      expect(isOppositeDirection('DOWN', 'LEFT')).toBe(false);
      expect(isOppositeDirection('DOWN', 'RIGHT')).toBe(false);
    });
  });

  describe('changeDirection', () => {
    it('should change direction when valid', () => {
      const state = createInitialState('walls');
      const newState = changeDirection(state, 'UP');
      expect(newState.nextDirection).toBe('UP');
    });

    it('should not change to opposite direction', () => {
      const state = createInitialState('walls');
      state.direction = 'RIGHT';
      const newState = changeDirection(state, 'LEFT');
      expect(newState.nextDirection).toBe('RIGHT');
    });
  });

  describe('getNextHead', () => {
    const head: Position = { x: 10, y: 10 };

    it('should calculate next head position for each direction', () => {
      expect(getNextHead(head, 'UP', 'walls')).toEqual({ x: 10, y: 9 });
      expect(getNextHead(head, 'DOWN', 'walls')).toEqual({ x: 10, y: 11 });
      expect(getNextHead(head, 'LEFT', 'walls')).toEqual({ x: 9, y: 10 });
      expect(getNextHead(head, 'RIGHT', 'walls')).toEqual({ x: 11, y: 10 });
    });

    it('should wrap around in pass-through mode', () => {
      expect(getNextHead({ x: 0, y: 10 }, 'LEFT', 'pass-through')).toEqual({ x: GRID_SIZE - 1, y: 10 });
      expect(getNextHead({ x: GRID_SIZE - 1, y: 10 }, 'RIGHT', 'pass-through')).toEqual({ x: 0, y: 10 });
      expect(getNextHead({ x: 10, y: 0 }, 'UP', 'pass-through')).toEqual({ x: 10, y: GRID_SIZE - 1 });
      expect(getNextHead({ x: 10, y: GRID_SIZE - 1 }, 'DOWN', 'pass-through')).toEqual({ x: 10, y: 0 });
    });

    it('should not wrap in walls mode', () => {
      expect(getNextHead({ x: 0, y: 10 }, 'LEFT', 'walls')).toEqual({ x: -1, y: 10 });
    });
  });

  describe('checkWallCollision', () => {
    it('should detect wall collision', () => {
      expect(checkWallCollision({ x: -1, y: 10 })).toBe(true);
      expect(checkWallCollision({ x: GRID_SIZE, y: 10 })).toBe(true);
      expect(checkWallCollision({ x: 10, y: -1 })).toBe(true);
      expect(checkWallCollision({ x: 10, y: GRID_SIZE })).toBe(true);
    });

    it('should not detect collision within bounds', () => {
      expect(checkWallCollision({ x: 0, y: 0 })).toBe(false);
      expect(checkWallCollision({ x: GRID_SIZE - 1, y: GRID_SIZE - 1 })).toBe(false);
      expect(checkWallCollision({ x: 10, y: 10 })).toBe(false);
    });
  });

  describe('checkSelfCollision', () => {
    it('should detect self collision', () => {
      const snake: Position[] = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 8, y: 11 },
      ];
      expect(checkSelfCollision({ x: 9, y: 10 }, snake)).toBe(true);
    });

    it('should not detect collision with tail', () => {
      const snake: Position[] = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
      ];
      // Tail position - should not collide as tail moves
      expect(checkSelfCollision({ x: 8, y: 10 }, snake)).toBe(false);
    });
  });

  describe('tick', () => {
    it('should move snake forward', () => {
      let state = createInitialState('walls');
      state = startGame(state);
      const initialHead = state.snake[0];
      const newState = tick(state);
      
      expect(newState.snake[0].x).toBe(initialHead.x + 1);
      expect(newState.snake[0].y).toBe(initialHead.y);
    });

    it('should grow snake when eating food', () => {
      let state = createInitialState('walls');
      state = startGame(state);
      const initialLength = state.snake.length;
      
      // Place food right in front of snake
      state.food = { x: state.snake[0].x + 1, y: state.snake[0].y };
      
      const newState = tick(state);
      expect(newState.snake.length).toBe(initialLength + 1);
      expect(newState.score).toBe(POINTS_PER_FOOD);
    });

    it('should end game on wall collision in walls mode', () => {
      let state = createInitialState('walls');
      state = startGame(state);
      state.snake = [{ x: GRID_SIZE - 1, y: 10 }, { x: GRID_SIZE - 2, y: 10 }];
      state.direction = 'RIGHT';
      state.nextDirection = 'RIGHT';
      
      const newState = tick(state);
      expect(newState.status).toBe('game-over');
    });

    it('should wrap around in pass-through mode', () => {
      let state = createInitialState('pass-through');
      state = startGame(state);
      state.snake = [{ x: GRID_SIZE - 1, y: 10 }, { x: GRID_SIZE - 2, y: 10 }];
      state.direction = 'RIGHT';
      state.nextDirection = 'RIGHT';
      
      const newState = tick(state);
      expect(newState.status).toBe('playing');
      expect(newState.snake[0].x).toBe(0);
    });

    it('should end game on self collision', () => {
      let state = createInitialState('walls');
      state = startGame(state);
      // Create a snake that will collide with itself
      state.snake = [
        { x: 10, y: 10 },
        { x: 11, y: 10 },
        { x: 11, y: 9 },
        { x: 10, y: 9 },
        { x: 9, y: 9 },
        { x: 9, y: 10 },
      ];
      state.direction = 'LEFT';
      state.nextDirection = 'LEFT';
      
      const newState = tick(state);
      expect(newState.status).toBe('game-over');
    });

    it('should not tick when game is not playing', () => {
      const state = createInitialState('walls');
      const newState = tick(state);
      expect(newState).toEqual(state);
    });
  });

  describe('game controls', () => {
    it('should start game', () => {
      const state = createInitialState('walls');
      const newState = startGame(state);
      expect(newState.status).toBe('playing');
    });

    it('should pause game', () => {
      let state = createInitialState('walls');
      state = startGame(state);
      const newState = pauseGame(state);
      expect(newState.status).toBe('paused');
    });

    it('should resume game', () => {
      let state = createInitialState('walls');
      state = startGame(state);
      state = pauseGame(state);
      const newState = resumeGame(state);
      expect(newState.status).toBe('playing');
    });

    it('should reset game', () => {
      let state = createInitialState('walls');
      state = startGame(state);
      state = { ...state, score: 100 };
      const newState = resetGame('walls');
      expect(newState.score).toBe(0);
      expect(newState.status).toBe('idle');
    });
  });

  describe('AI movement', () => {
    it('should return a valid direction', () => {
      const state = createInitialState('walls');
      const direction = getAIDirection(state);
      expect(['UP', 'DOWN', 'LEFT', 'RIGHT']).toContain(direction);
    });

    it('should not return opposite direction', () => {
      let state = createInitialState('walls');
      state.direction = 'RIGHT';
      const direction = getAIDirection(state);
      expect(direction).not.toBe('LEFT');
    });

    it('should prefer direction towards food', () => {
      let state = createInitialState('walls');
      state.snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
      state.food = { x: 10, y: 5 }; // Food is above
      state.direction = 'RIGHT';
      
      const direction = getAIDirection(state);
      // Should move UP towards food
      expect(direction).toBe('UP');
    });
  });
});
