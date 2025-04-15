import { describe, it } from 'testing';
import { assertEquals } from 'assert';
import { ScotlandYard } from '../src/models/scotland.ts';

describe('test playerNames', () => {
  it('should provide playerNames', () => {
    const players = new Set(['a', 'b', 'c', 'd', 'e', 'd']);
    const sy = new ScotlandYard([...players]);
    assertEquals(sy.getPlayers(), [...players]);
  });
});
