import { GameMode } from './game/GameMode.js';
import { PlayerController } from './game/PlayerController.js';
import { Renderer } from './rendering/Renderer.js';

// ============================================================================
// Application - Main application entry point
// ============================================================================
class Application {
    constructor() {
        this.canvas = null;
        this.gameMode = null;
        this.renderer = null;
        this.playerController = null;
    }

    /**
     * Initialize the application
     */
    initialize() {
        // Get the canvas element
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }

        // Create the renderer
        this.renderer = new Renderer(this.canvas);
        this.renderer.resizeCanvas();

        // Create the game mode
        this.gameMode = new GameMode(this.canvas);
        this.gameMode.setRenderer(this.renderer);

        // Create the player controller
        this.playerController = new PlayerController(this.gameMode, this.renderer);
        this.playerController.bindInputEvents(this.canvas);
        this.gameMode.setPlayerController(this.playerController);

        // Set up animation context for the renderer
        this.renderer.setAnimationContext(
            this.gameMode.getGameState(),
            this.playerController
        );

        // Initialize the game with 2 players
        this.gameMode.initGame(2);

        // Set up DOM bindings for UI controls
        this.setupDOMBindings();

        // Set up resize handler
        this.setupResizeHandler();

        // Initial render
        this.gameMode.render();
    }

    /**
     * Set up DOM event bindings for UI controls
     */
    setupDOMBindings() {
        // Player count selector
        const playerCountSelect = document.getElementById('playerCount');
        if (playerCountSelect) {
            playerCountSelect.addEventListener('change', (e) => {
                const count = parseInt(e.target.value, 10);
                this.setPlayerCount(count);
            });
        }

        // Reset button
        const resetButton = document.getElementById('resetButton');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetGame();
            });
        }
    }

    /**
     * Set up window resize handling
     */
    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.renderer.resizeCanvas();
            this.renderer.setAnimationContext(
                this.gameMode.getGameState(),
                this.playerController
            );
            this.gameMode.render();
        });
    }

    /**
     * Change the player count
     * @param {number} count - Number of players (2-6)
     */
    setPlayerCount(count) {
        this.gameMode.setPlayerCount(count);
        this.renderer.setAnimationContext(
            this.gameMode.getGameState(),
            this.playerController
        );
    }

    /**
     * Reset the game
     */
    resetGame() {
        this.gameMode.resetGame();
        this.renderer.setAnimationContext(
            this.gameMode.getGameState(),
            this.playerController
        );
    }
}

// ============================================================================
// Initialize Application
// ============================================================================
const app = new Application();

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.initialize());
} else {
    app.initialize();
}

// Export for potential external access
export { app, Application };
