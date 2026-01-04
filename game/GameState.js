import { HexPosition } from '../core/hexUtils.js';
import { MatchPhase, EventEmitter } from '../core/types.js';
import { TriangleGenerator } from '../core/config.js';
import { BoardCell } from '../actors/BoardCell.js';
import { Piece } from '../actors/Piece.js';

// ============================================================================
// GameState - Shared game state
// ============================================================================
export class GameState {
    constructor() {
        // Board is a map of position key -> BoardCell
        this.board = new Map();

        // Players array
        this.players = [];

        // Turn management
        this.turnIndex = 0;
        this.turnOrder = [];

        // Match phase
        this.matchPhase = MatchPhase.WaitingToStart;

        // Pre-generate all triangle positions
        this.homeSpaces = TriangleGenerator.generateAllTriangles();

        // Event emitter for state changes
        this.events = new EventEmitter();
    }

    // ========================================================================
    // Turn Management
    // ========================================================================

    /**
     * Get the current player's triangle index
     * @returns {number}
     */
    get currentPlayerIndex() {
        return this.turnOrder[this.turnIndex];
    }

    /**
     * Get the current player state
     * @returns {PlayerState}
     */
    getCurrentPlayer() {
        const triangleIndex = this.currentPlayerIndex;
        return this.players.find(p => p.homeTriangleIndex === triangleIndex);
    }

    /**
     * Advance to the next turn
     */
    nextTurn() {
        this.turnIndex = (this.turnIndex + 1) % this.turnOrder.length;
        this.events.emit('turnChanged', { playerIndex: this.currentPlayerIndex });
    }

    // ========================================================================
    // Board Access
    // ========================================================================

    /**
     * Get a board cell at a position
     * @param {HexPosition} pos - The position to query
     * @returns {BoardCell|null}
     */
    getBoardCell(pos) {
        return this.board.get(pos.key) || null;
    }

    /**
     * Get a board cell by key
     * @param {string} key - The position key
     * @returns {BoardCell|null}
     */
    getBoardCellByKey(key) {
        return this.board.get(key) || null;
    }

    /**
     * Get the piece at a position
     * @param {HexPosition} pos - The position to query
     * @returns {Piece|null}
     */
    getPieceAt(pos) {
        const cell = this.getBoardCell(pos);
        return cell ? cell.getPiece() : null;
    }

    /**
     * Check if a position is on the board
     * @param {HexPosition} pos - The position to check
     * @returns {boolean}
     */
    isPositionOnBoard(pos) {
        return this.board.has(pos.key);
    }

    /**
     * Check if a position is occupied
     * @param {HexPosition} pos - The position to check
     * @returns {boolean}
     */
    isPositionOccupied(pos) {
        const cell = this.getBoardCell(pos);
        return cell ? cell.hasPiece() : false;
    }

    /**
     * Get all pieces belonging to a player
     * @param {number} playerIndex - The player's triangle index
     * @returns {Piece[]}
     */
    getPlayerPieces(playerIndex) {
        const pieces = [];
        this.board.forEach(cell => {
            if (cell.hasPiece() && cell.getPiece().belongsTo(playerIndex)) {
                pieces.push(cell.getPiece());
            }
        });
        return pieces;
    }

    // ========================================================================
    // Board Modification
    // ========================================================================

    /**
     * Move a piece from one position to another
     * @param {HexPosition} fromPos - Source position
     * @param {HexPosition} toPos - Destination position
     * @returns {boolean} True if move was successful
     */
    movePiece(fromPos, toPos) {
        const fromCell = this.getBoardCell(fromPos);
        const toCell = this.getBoardCell(toPos);

        if (!fromCell || !toCell || !fromCell.hasPiece() || toCell.hasPiece()) {
            return false;
        }

        const piece = fromCell.removePiece();
        toCell.setPiece(piece);

        // Update player's piece positions
        const player = this.players.find(p => p.homeTriangleIndex === piece.getOwnerPlayerIndex());
        if (player) {
            player.updatePiecePosition(fromPos.key, toPos.key);
        }

        this.events.emit('pieceMoved', { from: fromPos, to: toPos, piece });
        return true;
    }

    /**
     * Place a piece at a position (used during setup)
     * @param {HexPosition} pos - The position
     * @param {Piece} piece - The piece to place
     */
    placePiece(pos, piece) {
        const cell = this.getBoardCell(pos);
        if (cell) {
            cell.setPiece(piece);
        }
    }

    /**
     * Remove a piece from a position (returns the piece)
     * @param {HexPosition} pos - The position
     * @returns {Piece|null}
     */
    removePieceAt(pos) {
        const cell = this.getBoardCell(pos);
        return cell ? cell.removePiece() : null;
    }

    // ========================================================================
    // Board Setup
    // ========================================================================

    /**
     * Initialize the board structure (cells only, no pieces)
     */
    initializeBoard() {
        this.board.clear();

        // Create the central hexagon (radius 4, side length 5)
        for (let q = -4; q <= 4; q++) {
            for (let r = -4; r <= 4; r++) {
                const s = -q - r;
                if (Math.abs(s) <= 4) {
                    const pos = new HexPosition(q, r);
                    const cell = new BoardCell(pos, -1); // -1 = center
                    this.board.set(pos.key, cell);
                }
            }
        }

        // Add all 6 triangular protrusions to the board
        this.homeSpaces.forEach((triangle, triangleIndex) => {
            triangle.forEach(pos => {
                const cell = new BoardCell(pos, triangleIndex);
                this.board.set(pos.key, cell);
            });
        });
    }

    /**
     * Get the positions for a specific triangle
     * @param {number} triangleIndex - The triangle index (0-5)
     * @returns {HexPosition[]}
     */
    getTrianglePositions(triangleIndex) {
        return this.homeSpaces[triangleIndex];
    }

    /**
     * Get the home index for a position (which triangle it belongs to)
     * @param {HexPosition} pos - The position to check
     * @returns {number} -1 for center, 0-5 for triangles
     */
    getHomeIndex(pos) {
        const cell = this.getBoardCell(pos);
        return cell ? cell.getHomeIndex() : -1;
    }

    // ========================================================================
    // State Reset
    // ========================================================================

    /**
     * Reset the game state for a new game
     */
    reset() {
        this.turnIndex = 0;
        this.matchPhase = MatchPhase.WaitingToStart;
        this.players = [];
        this.turnOrder = [];

        // Clear all pieces from cells
        this.board.forEach(cell => {
            cell.removePiece();
        });

        this.events.emit('stateReset', {});
    }

    // ========================================================================
    // Iteration
    // ========================================================================

    /**
     * Iterate over all board cells
     * @param {Function} callback - Callback receiving (cell, key)
     */
    forEachCell(callback) {
        this.board.forEach((cell, key) => callback(cell, key));
    }

    /**
     * Get all board cells as an array
     * @returns {BoardCell[]}
     */
    getAllCells() {
        return Array.from(this.board.values());
    }
}
