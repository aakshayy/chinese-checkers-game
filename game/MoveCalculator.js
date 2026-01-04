import { HEX_DIRECTIONS } from '../core/hexUtils.js';
import { createSimpleMove, createJumpMove } from '../core/types.js';

// ============================================================================
// MoveCalculator - Calculates valid moves for pieces
// ============================================================================
export class MoveCalculator {
    /**
     * Create a new move calculator
     * @param {GameState} gameState - The game state to use for calculations
     */
    constructor(gameState) {
        this.gameState = gameState;
    }

    /**
     * Find all valid moves for a piece at a given position
     * @param {HexPosition} startPos - The starting position
     * @returns {Array} Array of MoveInfo objects
     */
    findValidMoves(startPos) {
        const visited = new Set();
        const moves = [];

        this._findMoves(startPos, startPos, false, [], visited, moves);

        return moves;
    }

    /**
     * Recursive helper to find moves
     * @private
     */
    _findMoves(startPos, currentPos, hasJumped, currentPath, visited, moves) {
        if (visited.has(currentPos.key)) return;
        visited.add(currentPos.key);

        HEX_DIRECTIONS.forEach(dir => {
            const adjPos = currentPos.add(dir);

            // Check for simple adjacent moves (only if we haven't jumped yet)
            if (this.gameState.isPositionOnBoard(adjPos)) {
                if (!this.gameState.isPositionOccupied(adjPos) && !hasJumped) {
                    moves.push(createSimpleMove(adjPos));
                }
            }

            // Check for long-distance jumps
            this._checkJumpInDirection(startPos, currentPos, dir, currentPath, visited, moves);
        });
    }

    /**
     * Check for a valid jump in a specific direction
     * @private
     */
    _checkJumpInDirection(startPos, currentPos, dir, currentPath, visited, moves) {
        let distance = 1;
        let foundPiece = false;
        let pieceDistance = 0;

        while (distance <= 16) {
            const checkPos = currentPos.add(dir.scale(distance));

            // Off the board - stop checking this direction
            if (!this.gameState.isPositionOnBoard(checkPos)) break;

            const isOccupied = this.gameState.isPositionOccupied(checkPos);

            if (!foundPiece) {
                if (isOccupied) {
                    // Check if this is the piece being moved (at the original position)
                    if (checkPos.equals(startPos)) {
                        break; // Can't jump over yourself
                    }
                    foundPiece = true;
                    pieceDistance = distance;
                }
            } else {
                if (isOccupied) {
                    break; // Another piece blocks the landing
                } else if (distance === pieceDistance * 2) {
                    // Valid jump landing spot
                    if (!visited.has(checkPos.key)) {
                        const newPath = [...currentPath, checkPos];
                        moves.push(createJumpMove(checkPos, newPath));
                        // Recursively find more jumps from this position
                        this._findMoves(startPos, checkPos, true, newPath, visited, moves);
                    }
                    break;
                }
            }

            distance++;
        }
    }

    /**
     * Check if a specific move is valid
     * @param {HexPosition} fromPos - Starting position
     * @param {HexPosition} toPos - Target position
     * @returns {Object|null} The MoveInfo if valid, null otherwise
     */
    isValidMove(fromPos, toPos) {
        const validMoves = this.findValidMoves(fromPos);
        return validMoves.find(move => move.targetPos.equals(toPos)) || null;
    }
}
