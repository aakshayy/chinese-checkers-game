# Hexagonal Chinese Checkers

A web-based implementation of Chinese Checkers demonstrating hexagonal tile operations.

## Features

- Hexagonal grid system using axial coordinates
- Upto six-player Chinese Checkers game
- Interactive canvas-based UI
- Move validation with support for jumps
- Win condition detection

## How to Play

1. Open `index.html` in your web browser
2. Click on a piece of your color to select it
3. Valid moves will be highlighted:
   - Green circles: adjacent moves
   - Gold circles: jump moves
4. Click on a highlighted position to move your piece
5. Players alternate turns
6. First player to move all pieces to the opposite triangle wins

## Hexagonal Coordinate System

This implementation uses axial coordinates (q, r) for the hexagonal grid, providing efficient operations for:
- Neighbor finding
- Distance calculations
- Coordinate to pixel conversion
- Move validation

## Live Demo

[Play the game here](https://arlik.github.io/hexagonal-chinese-checkers/)

## Technologies Used

- HTML5 Canvas
- Vanilla JavaScript
- Hexagonal grid mathematics
