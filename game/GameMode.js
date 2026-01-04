import { MatchPhase } from '../core/types.js';
import { GameConfig, TriangleGenerator } from '../core/config.js';
import { GameState } from './GameState.js';
import { PlayerState } from './PlayerState.js';
import { Piece } from '../actors/Piece.js';
import { MoveCalculator } from './MoveCalculator.js';

// ============================================================================
// GameMode - Defines game rules, spawns pieces, manages game flow
// ============================================================================
export class GameMode {
    /**
     * Create a new game mode
     * @param {HTMLCanvasElement} canvas - The game canvas
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.gameState = new GameState();
        this.moveCalculator = new MoveCalculator(this.gameState);
        this.renderer = null; // Set by application
        this.playerController = null; // Set by application

        // Pre-generate triangle positions
        this.homeSpaces = TriangleGenerator.generateAllTriangles();
    }

    /**
     * Set the renderer (called by application)
     * @param {Renderer} renderer
     */
    setRenderer(renderer) {
        this.renderer = renderer;
    }

    /**
     * Set the player controller (called by application)
     * @param {PlayerController} controller
     */
    setPlayerController(controller) {
        this.playerController = controller;
    }

    // ========================================================================
    // Game Flow
    // ========================================================================

    /**
     * Initialize the game with a specific player count
     * @param {number} playerCount - Number of players (2-6)
     */
    initGame(playerCount) {
        // Reset game state
        this.gameState.reset();
        this.gameState.initializeBoard();

        // Get triangle indices for this player count
        const triangleIndices = GameConfig.getPlayerTriangleIndices(playerCount);

        // Create player states
        triangleIndices.forEach((triangleIndex, playerIndex) => {
            const playerState = new PlayerState(playerIndex, triangleIndex);
            this.gameState.players.push(playerState);
        });

        // Set turn order
        this.gameState.turnOrder = GameConfig.getTurnOrder(triangleIndices);

        // Spawn pieces for each player
        this.gameState.players.forEach(playerState => {
            this.spawnPiecesForPlayer(playerState);
        });

        // Set match phase
        this.gameState.matchPhase = MatchPhase.InProgress;
    }

    /**
     * Start the match
     */
    startMatch() {
        this.gameState.matchPhase = MatchPhase.InProgress;
        this.render();
    }

    /**
     * End the match with a winner
     * @param {PlayerState} winner - The winning player
     */
    endMatch(winner) {
        this.gameState.matchPhase = MatchPhase.GameOver;
        this.render();

        // Notify with a slight delay for the render to complete
        setTimeout(() => {
            alert(`${winner.getDisplayName()} player wins!`);
        }, 100);
    }

    /**
     * Reset the game with current player count
     */
    resetGame() {
        const playerCount = this.gameState.players.length;
        this.initGame(playerCount > 0 ? playerCount : 2);

        if (this.playerController) {
            this.playerController.reset();
        }

        this.render();
    }

    // ========================================================================
    // Spawn Logic
    // ========================================================================

    /**
     * Spawn pieces for a player in their home triangle
     * @param {PlayerState} playerState - The player state
     */
    spawnPiecesForPlayer(playerState) {
        const homeTriangle = this.homeSpaces[playerState.homeTriangleIndex];

        homeTriangle.forEach(pos => {
            const piece = new Piece(pos, playerState.homeTriangleIndex);
            this.gameState.placePiece(pos, piece);
            playerState.addPiecePosition(pos.key);
        });
    }

    // ========================================================================
    // Rules
    // ========================================================================

    /**
     * Check if any player has won
     * @returns {{ winner: boolean, playerState?: PlayerState }}
     */
    checkWinCondition() {
        for (const playerState of this.gameState.players) {
            if (playerState.hasWon(this.gameState)) {
                return { winner: true, playerState };
            }
        }
        return { winner: false };
    }

    /**
     * Get valid moves for a piece
     * @param {Piece} piece - The piece to get moves for
     * @returns {Array} Array of MoveInfo objects
     */
    getValidMovesForPiece(piece) {
        return this.moveCalculator.findValidMoves(piece.getPosition());
    }

    /**
     * Validate a move
     * @param {HexPosition} fromPos - Starting position
     * @param {HexPosition} toPos - Target position
     * @returns {Object|null} The MoveInfo if valid, null otherwise
     */
    validateMove(fromPos, toPos) {
        return this.moveCalculator.isValidMove(fromPos, toPos);
    }

    /**
     * Execute a move
     * @param {HexPosition} fromPos - Starting position
     * @param {HexPosition} toPos - Target position
     * @returns {boolean} True if successful
     */
    executeMove(fromPos, toPos) {
        return this.gameState.movePiece(fromPos, toPos);
    }

    // ========================================================================
    // Turn Management
    // ========================================================================

    /**
     * Advance to the next turn
     */
    advanceTurn() {
        this.gameState.nextTurn();
    }

    /**
     * Get the current player
     * @returns {PlayerState}
     */
    getCurrentPlayer() {
        return this.gameState.getCurrentPlayer();
    }

    /**
     * Get the current player's triangle index
     * @returns {number}
     */
    getCurrentPlayerIndex() {
        return this.gameState.currentPlayerIndex;
    }

    // ========================================================================
    // Player Count
    // ========================================================================

    /**
     * Change the player count and restart the game
     * @param {number} count - New player count (2-6)
     */
    setPlayerCount(count) {
        this.initGame(count);

        if (this.playerController) {
            this.playerController.reset();
        }

        this.render();
    }

    // ========================================================================
    // Rendering
    // ========================================================================

    /**
     * Trigger a render
     */
    render() {
        if (this.renderer) {
            this.renderer.render(this.gameState, this.playerController);
        }
    }

    // ========================================================================
    // Accessors
    // ========================================================================

    /**
     * Get the game state
     * @returns {GameState}
     */
    getGameState() {
        return this.gameState;
    }

    /**
     * Get the move calculator
     * @returns {MoveCalculator}
     */
    getMoveCalculator() {
        return this.moveCalculator;
    }
}
