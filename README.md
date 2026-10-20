# SECTOR 21

**A two-player Robot vs Alien chase game built with React and JavaScript.**

Enter Sector 21, a high-security containment laboratory where an escaped Alien must survive while a security Robot attempts to capture it.

**Two players. One keyboard. Sixty seconds. Only one winner.**

## 🎮 About the Game

This is my first attempt to build my own game.

Sector 21 is a local multiplayer browser game where two players compete on the same computer. One controls the Robot, whose objective is to capture the Alien, while the other controls the Alien, whose objective is to survive until the timer reaches zero.

Both players must navigate a laboratory filled with machinery, chemical spills, and unpredictable power-ups. Strategic movement, timing, and the ability to anticipate your opponent's decisions are essential.

## ✨ Features

### Asymmetric Two-Player Gameplay

- **Robot:** Chase and capture the Alien before time runs out.
- **Alien:** Evade the Robot and survive the full 60 seconds.
- Both players compete simultaneously using a single keyboard.

### Laboratory Arena

- A 9×18 grid-based arena with custom pixel-art visuals.
- Industrial machinery that blocks movement.
- Toxic chemical spills that temporarily immobilize players.
- Custom directional sprites for the Robot and Alien.
- Visual effects that communicate freezing, recharging, and active abilities.

### Power-Ups

Three collectible abilities introduce additional strategy:

| Power-Up | Effect |
|---|---|
| ⚡ Overcharge | Attempts a two-tile movement in the selected direction |
| ❄️ Cryo | Freezes the opposing player for 2 seconds |
| 🧬 Mutagen | Allows the player to enter one normally impassable wall tile |

Players can carry only one power-up at a time and must decide when to activate it.

### Robot Recharge

The Robot temporarily recharges when the timer reaches **45, 30, and 15 seconds**.

During each three-second recharge, the Robot cannot move or activate abilities, giving the Alien an opportunity to escape.

### Status Effects

- **Cryo:** An icy-blue visual effect indicates freezing.
- **Chemical spills:** A green effect indicates temporary immobilization.
- **Mutagen:** A purple blinking effect indicates an active mutation.
- **Recharge:** The Robot flashes red while recharging.

## 🕹️ How to Play

### Objectives

**Robot wins:** Capture the Alien before the timer reaches zero.

**Alien wins:** Survive until the 60-second timer expires.

### Controls

| Action | Robot | Alien |
|---|---|---|
| Move up | W | ↑ |
| Move down | S | ↓ |
| Move left | A | ← |
| Move right | D | → |
| Activate power-up | E | Enter |

Both players use the same keyboard.

### Gameplay Tips

- Use laboratory machinery to block or redirect your opponent.
- Avoid chemical spills unless you can afford to be immobilized.
- Collect power-ups and activate them strategically.
- As the Alien, take advantage of the Robot's recharge periods.
- As the Robot, plan your movements carefully before time runs out.

## 🛠️ Built With

| Technology | Purpose |
|---|---|
| React | Game interface and state-driven rendering |
| JavaScript | Movement, collision detection, power-ups, timers, and game logic |
| Vite | Development server and production build |
| CSS | Containment Lab interface, sprite effects, and responsive styling |
| PNG pixel-art assets | Characters, laboratory machinery, floors, and chemical spills |

The game runs entirely in the browser without a backend or database.

## 🚀 Getting Started

### Requirements

- Node.js and npm
- Git (for cloning the repository)
- A modern web browser

### Installation

Clone the repository:

```bash
git clone https://github.com/gab040425/sector-21.git
cd sector-21
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal to play Sector 21.

### Production Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Code Quality

Run the ESLint checks:

```bash
npm run lint
```

## 📁 Project Structure

```text
sector-21/
├── public/
│   ├── sprites/
│   │   ├── robot/         # Directional Robot sprites
│   │   └── alien/         # Directional Alien sprites
│   └── tiles/
│       ├── floor/         # Laboratory floor textures
│       ├── machinery/     # Impassable laboratory equipment
│       └── goo/           # Chemical spill artwork
├── src/
│   ├── App.jsx            # Game state and gameplay logic
│   ├── GameUI.jsx         # Lobby, arena, HUD, and result screens
│   ├── Containment.css    # Arena styling and visual effects
│   ├── App.css            # Additional application styles
│   ├── index.css          # Global styles
│   └── main.jsx           # Application entry point
├── index.html
├── package.json
└── vite.config.js
```

## 💡 Development Notes

Sector 21 was created as an opportunity to explore game development using React and JavaScript.

Some of the key development areas include:

- Managing simultaneous player inputs on one keyboard.
- Implementing movement and collision detection on a grid.
- Handling temporary abilities and timed status effects.
- Managing game states such as the lobby, countdown, active match, and results screen.
- Integrating custom pixel-art assets into a responsive interface.
- Communicating gameplay mechanics through visual feedback and animations.

The project combines interactive game logic with frontend development and UI design.

## 📄 License

No license has been specified yet. All rights are reserved by default unless a license is added to this repository.
