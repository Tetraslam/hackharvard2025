export interface Position {
  x: number;
  y: number;
}

export function getPlayerPosition(): Position {
  return {
    x: 17,
    y: 82,
  };
}

export function getOpponentPosition(): Position {
  return {
    x: 78,
    y: 30,
  };
}

export function getPositionForPlayerId(playerId: string, currentPlayerId: string): Position {
  return playerId === currentPlayerId ? getPlayerPosition() : getOpponentPosition();
}

export function getMidpoint(from: Position, to: Position): Position {
  return {
    x: (from.x + to.x) / 2,
    y: (from.y + to.y) / 2,
  };
}

