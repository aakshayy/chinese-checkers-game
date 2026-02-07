# Hexagonal Chinese Checkers

A web-based implementation of Chinese Checkers demonstrating hexagonal tile operations.

## How to Play

1. Click on a piece of your color to select it
2. Valid moves will be highlighted:
   - Green circles: adjacent moves
   - Gold circles: jump moves
3. Click on a highlighted position to move your piece
4. Players alternate turns
5. First player to move all pieces to the opposite triangle wins

## Run Locally with Python

1. Open a terminal in the project folder
2. Start a simple Python server:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser to `http://localhost:8000`
4. Open `index.html` from the served files

## Hexagonal Coordinate System

This implementation uses axial coordinates (q, r) for the hexagonal grid, providing efficient operations for:
- Neighbor finding
- Distance calculations
- Coordinate to pixel conversion
- Move validation

## Live Demo

[Play the game here](https://aakshayy.github.io/chinese-checkers-game/)

## Technologies Used

- HTML5 Canvas
- Vanilla JavaScript
- Hexagonal grid mathematics

## Features

- Hexagonal grid system using axial coordinates
- Upto six-player Chinese Checkers game
- Interactive canvas-based UI
- Move validation with support for jumps
- Win condition detection
