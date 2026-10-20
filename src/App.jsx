import "./Containment.css";
import GameUI from "./GameUI.jsx";
import { useEffect, useRef, useState } from "react";

const powerUpTypes = [
  "overcharge",
  "cryo",
  "mutagen",
];

function App() {

  const [showLobby, setShowLobby] = useState(true);
  const [countdown, setCountdown] = useState(null);

  const rows = 9;
  const columns = 18;

  // 🧱 WALL POSITIONS
  const walls = [
    { row: 2, col: 5 },
    { row: 2, col: 6 },
    { row: 2, col: 7 },
    { row: 2, col: 8 },

    { row: 5, col: 3 },
    { row: 5, col: 4 },
    { row: 5, col: 5 },

    { row: 3, col: 10 },
    { row: 4, col: 10 },
    { row: 5, col: 10 },

    { row: 6, col: 7 },
    { row: 6, col: 8 },
    { row: 6, col: 9 },
    { row: 6, col: 10 },
  ];

  const stickyTiles = [
    { row: 1, col: 3 },
    { row: 6, col: 13 },
    { row: 3, col: 7 },
  ];

  // Starting positions
  const startingRobot = { row: 3, col: 2 };
  const startingAlien = { row: 4, col: 13 };

  const [robot, setRobot] = useState(startingRobot);
  const [alien, setAlien] = useState(startingAlien);
  // Facing is visual only and persists until the next allowed movement input.
  const [robotDirection, setRobotDirection] = useState("down");
  const [alienDirection, setAlienDirection] = useState("down");

  // Game state
  const [gameOver, setGameOver] = useState(false);

  // Who won?
  const [winner, setWinner] = useState(null);

  // ⏱️ Timer
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [powerUps, setPowerUps] = useState([]);

  const spawnedMilestones = useRef(new Set());
  const spawnPowerUpRef = useRef(null);

  const [robotPowerUp, setRobotPowerUp] = useState(null);
  const [alienPowerUp, setAlienPowerUp] = useState(null);

  const [robotFrozen, setRobotFrozen] = useState(false);
  const [alienFrozen, setAlienFrozen] = useState(false);
  // Visual metadata only: the existing frozen flags/timers still govern movement.
  const [robotFreezeSource, setRobotFreezeSource] = useState(null);
  const [alienFreezeSource, setAlienFreezeSource] = useState(null);

  const [robotRecharging, setRobotRecharging] = useState(false);

  const [robotOvercharged, setRobotOvercharged] = useState(false);
  const [alienOvercharged, setAlienOvercharged] = useState(false);

  const [robotMutagen, setRobotMutagen] = useState(false);
  const [alienMutagen, setAlienMutagen] = useState(false);

    // Check whether a position is a wall
  function isWall(row, col) {
    return walls.some(
      (wall) => wall.row === row && wall.col === col
    );
  }

  function isSticky(row, col) {
    return stickyTiles.some(
      (tile) => tile.row === row && tile.col === col
    );
  }

  function spawnPowerUp() {
    const validTiles = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const occupiedByWall = isWall(row, col);
        const occupiedBySticky = isSticky(row, col);

        const occupiedByRobot =
          robot.row === row && robot.col === col;

        const occupiedByAlien =
          alien.row === row && alien.col === col;

        const occupiedByPowerUp = powerUps.some(
          (powerUp) =>
            powerUp.row === row &&
            powerUp.col === col
        );

        if (
          !occupiedByWall &&
          !occupiedBySticky &&
          !occupiedByRobot &&
          !occupiedByAlien &&
          !occupiedByPowerUp
        ) {
          validTiles.push({ row, col });
        }
      }
    }

    if (validTiles.length === 0) {
      return;
    }

    const randomTile =
      validTiles[
        Math.floor(Math.random() * validTiles.length)
      ];

    const randomType =
      powerUpTypes[
        Math.floor(Math.random() * powerUpTypes.length)
      ];

    const newPowerUp = {
      type: randomType,
      row: randomTile.row,
      col: randomTile.col,
    };

    setPowerUps((current) => [
      ...current,
      newPowerUp,
    ]);
  }

  function collectPowerUp(player, position) {
    const powerUp = powerUps.find(
      (powerUp) =>
        powerUp.row === position.row &&
        powerUp.col === position.col
    );

    if (!powerUp) {
      return;
    }

    if (player === "robot") {
      if (robotPowerUp !== null) {
        return;
      }

      setRobotPowerUp(powerUp.type);
    }

    if (player === "alien") {
      if (alienPowerUp !== null) {
        return;
      }

      setAlienPowerUp(powerUp.type);
    }

    setPowerUps((current) =>
      current.filter(
        (powerUp) =>
          !(
            powerUp.row === position.row &&
            powerUp.col === position.col
          )
      )
    );
  }

  function activateRobotPowerUp() {
    if (robotPowerUp === null) {
      return;
    }

    if (robotPowerUp === "overcharge") {
      setRobotOvercharged(true);
    }

    if (robotPowerUp === "cryo") {
      setAlienFreezeSource("cryo");
      setAlienFrozen(true);

      setTimeout(() => {
        setAlienFrozen(false);
      }, 2000);
    }

    if (robotPowerUp === "mutagen") {
      setRobotMutagen(true);
    }

    setRobotPowerUp(null);
  }

  function activateAlienPowerUp() {
    if (alienPowerUp === null) {
      return;
    }

    if (alienPowerUp === "overcharge") {
      setAlienOvercharged(true);
    }

    if (alienPowerUp === "cryo") {
      setRobotFreezeSource("cryo");
      setRobotFrozen(true);

      setTimeout(() => {
        setRobotFrozen(false);
      }, 2000);
    }

    if (alienPowerUp === "mutagen") {
      setAlienMutagen(true);
    }

    setAlienPowerUp(null);
  }

  // Calculate a player's next position
  function getNewPosition(current, direction, hasPowerUp) {
    let row = current.row;
    let col = current.col;

    if (direction === "up") row--;
    if (direction === "down") row++;
    if (direction === "left") col--;
    if (direction === "right") col++;

    // Don't leave the map
    if (
      row < 0 ||
      row >= rows ||
      col < 0 ||
      col >= columns
    ) {
      return current;
    }

    // Don't walk through walls
    if (isWall(row, col)) {
      return current;
    }

    const powerUpOnTile = powerUps.some(
      (powerUp) =>
        powerUp.row === row &&
        powerUp.col === col
    );

    if (hasPowerUp && powerUpOnTile) {
      return current;
    }

    return { row, col };
  }

  // ⏱️ COUNTDOWN TIMER
  useEffect(() => {
    if (!gameStarted || gameOver) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((current) => {
        const nextTime = current - 1;

        if (
          nextTime === 45 ||
          nextTime === 30 ||
          nextTime === 15
        ) {
          setRobotRecharging(true);

          setTimeout(() => {
            setRobotRecharging(false);
          }, 3000);
        }

        if (nextTime <= 0) {
          setGameOver(true);
          setWinner("alien");
          return 0;
        }

        return nextTime;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [gameStarted, gameOver]);

  // Refresh the callback without making movement trigger extra spawns.
  useEffect(() => { spawnPowerUpRef.current = spawnPowerUp; });

  useEffect(() => {
    if (gameOver) {
      return;
    }

    const spawnTimes = [30, 15];

    if (
      spawnTimes.includes(timeLeft) &&
      !spawnedMilestones.current.has(timeLeft)
    ) {
      spawnedMilestones.current.add(timeLeft);
      spawnPowerUpRef.current();
    }
  }, [timeLeft, gameOver]);

  // 🎮 KEYBOARD CONTROLS
  useEffect(() => {
    function handleKeyDown(event) {
      // Don't allow movement after game ends
      if (gameOver || showLobby || !gameStarted) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "e") {
        event.preventDefault();

        if (!gameOver && !robotRecharging) {
          activateRobotPowerUp();
        }

        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();

        if (!gameOver) {
          activateAlienPowerUp();
        }

        return;
      }

      // =========================
      // ROBOT MOVEMENT
      // =========================

      if (["w", "a", "s", "d"].includes(key)) {
        event.preventDefault();

        if (robotFrozen) {
          return;
        }

        let direction;

        if (robotRecharging) { return;}
        if (key === "w") direction = "up";
        if (key === "s") direction = "down";
        if (key === "a") direction = "left";
        if (key === "d") direction = "right";

        setRobotDirection(direction);
        setRobot((current) => {
          let newPosition;
          let enteredWall = false;

          if (robotMutagen) {
            const mutagenMove = getMutagenPosition(
              current,
              direction
            );

            newPosition = mutagenMove.position;
            enteredWall = mutagenMove.enteredWall;
          } else {
            const move = getPlayerMovePosition(
              current,
              direction,
              robotOvercharged,
              robotPowerUp !== null
            );

            newPosition = move.position;

            if (move.usedOvercharge) {
              setRobotOvercharged(false);
            }
          }

          if (enteredWall) {
            setRobotMutagen(false);
          }

          collectPowerUp("robot", newPosition);

          // Did the Robot catch the Alien?
          if (
            newPosition.row === alien.row &&
            newPosition.col === alien.col
          ) {
            setGameOver(true);
            setWinner("robot");
          }

          if (isSticky(newPosition.row, newPosition.col)) {
            setRobotFreezeSource("goo");
            setRobotFrozen(true);

            setTimeout(() => {
              setRobotFrozen(false);
            }, 1000);
          }

          return newPosition;
        });
      }

      // =========================
      // ALIEN MOVEMENT
      // =========================

      if (event.key.startsWith("Arrow")) {
        event.preventDefault();

        let direction;

        if (event.key === "ArrowUp") direction = "up";
        if (event.key === "ArrowDown") direction = "down";
        if (event.key === "ArrowLeft") direction = "left";
        if (event.key === "ArrowRight") direction = "right";

        moveAlien(direction);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }); // Rebind after each render to use current positions, effects, and inventory.

  function getMutagenPosition(current, direction) {
    let row = current.row;
    let col = current.col;

    if (direction === "up") row--;
    if (direction === "down") row++;
    if (direction === "left") col--;
    if (direction === "right") col++;

    // Don't leave the map
    if (
      row < 0 ||
      row >= rows ||
      col < 0 ||
      col >= columns
    ) {
      return {
        position: current,
        enteredWall: false,
      };
    }

    // Mutagen allows entering ONE wall tile
    if (isWall(row, col)) {
      return {
        position: { row, col },
        enteredWall: true,
      };
    }

    return {
      position: { row, col },
      enteredWall: false,
    };
  }

  function getOverchargePosition(current, direction) {
    let row = current.row;
    let col = current.col;

    if (direction === "up") row -= 2;
    if (direction === "down") row += 2;
    if (direction === "left") col -= 2;
    if (direction === "right") col += 2;

    // Outside arena
    if (
      row < 0 ||
      row >= rows ||
      col < 0 ||
      col >= columns
    ) {
      return null;
    }

    // Cannot jump through a wall
    const middleRow =
      direction === "up"
        ? current.row - 1
        : direction === "down"
        ? current.row + 1
        : current.row;

    const middleCol =
      direction === "left"
        ? current.col - 1
        : direction === "right"
        ? current.col + 1
        : current.col;

    if (isWall(middleRow, middleCol)) {
      return null;
    }

    // Cannot land on a wall
    if (isWall(row, col)) {
      return null;
    }

    return { row, col };
  }

  function getPlayerMovePosition(
    current,
    direction,
    overcharged,
    hasPowerUp
  ) {
    if (overcharged) {
      const overchargePosition =
        getOverchargePosition(
          current,
          direction
        );

      if (overchargePosition !== null) {
        return {
          position: overchargePosition,
          usedOvercharge: true,
        };
      }

      return {
        position: getNewPosition(
          current,
          direction,
          hasPowerUp
        ),
        usedOvercharge: true,
      };
    }

    return {
      position: getNewPosition(
        current,
        direction,
        hasPowerUp
      ),
      usedOvercharge: false,
    };
  }

  function moveAlien(direction) {
    if (gameOver) {
      return;
    }

    if (alienFrozen) {
      return;
    }

    setAlienDirection(direction);
    setAlien((current) => {
      let newPosition;
      let enteredWall = false;

      if (alienMutagen) {
        const mutagenMove = getMutagenPosition(
          current,
          direction
        );

        newPosition = mutagenMove.position;
        enteredWall = mutagenMove.enteredWall;
      } else {
        const move = getPlayerMovePosition(
          current,
          direction,
          alienOvercharged,
          alienPowerUp !== null
        );

        newPosition = move.position;

        if (move.usedOvercharge) {
          setAlienOvercharged(false);
        }
      }

      if (enteredWall) {
        setAlienMutagen(false);
      }

      collectPowerUp("alien", newPosition);

      // Did the Alien move onto the Robot?
      if (
        newPosition.row === robot.row &&
        newPosition.col === robot.col
      ) {
        setGameOver(true);
        setWinner("robot");
      }

      if (isSticky(newPosition.row, newPosition.col)) {
        setAlienFreezeSource("goo");
        setAlienFrozen(true);

        setTimeout(() => {
          setAlienFrozen(false);
        }, 1000);
      }

      return newPosition;
    });
  }

  // Start game
  function startGame() {
    if (countdown !== null || gameStarted) return;
    setTimeLeft(60);
    setGameStarted(false);

    setCountdown(3);

    setTimeout(() => {
      setCountdown(2);
    }, 1000);

    setTimeout(() => {
      setCountdown(1);
    }, 2000);

    setTimeout(() => {
      setCountdown("GO!");
    }, 3000);

    setTimeout(() => {
      setCountdown(null);
      setShowLobby(false);
      setGameStarted(true);

      spawnPowerUp();
    }, 3500);
  }

  // 🔄 RESTART GAME
  function restartGame() {
    setRobotRecharging(false);
    setCountdown(null);
    setRobot(startingRobot);
    setAlien(startingAlien);
    setRobotDirection("down");
    setAlienDirection("down");
    setGameOver(false);
    setWinner(null);
    setTimeLeft(60);
    setGameStarted(false);

    setRobotFrozen(false);
    setAlienFrozen(false);
    setRobotFreezeSource(null);
    setAlienFreezeSource(null);

    setRobotOvercharged(false);
    setAlienOvercharged(false);

    setRobotMutagen(false);
    setAlienMutagen(false);

    setPowerUps([]);
    setRobotPowerUp(null);
    setAlienPowerUp(null);

    setShowLobby(true);

    spawnedMilestones.current.clear();
  }

  return (
    <GameUI
      showLobby={showLobby} countdown={countdown}
      onStart={startGame} onBack={restartGame}
      rows={rows} columns={columns} robot={robot} alien={alien}
      robotDirection={robotDirection} alienDirection={alienDirection}
      isWall={isWall} isSticky={isSticky} powerUps={powerUps}
      robotPowerUp={robotPowerUp} alienPowerUp={alienPowerUp}
      robotFrozen={robotFrozen} alienFrozen={alienFrozen}
      robotFreezeSource={robotFreezeSource} alienFreezeSource={alienFreezeSource}
      robotRecharging={robotRecharging}
      robotOvercharged={robotOvercharged} alienOvercharged={alienOvercharged}
      robotMutagen={robotMutagen} alienMutagen={alienMutagen}
      timeLeft={timeLeft} gameOver={gameOver} winner={winner}
    />
  );
}

export default App;
