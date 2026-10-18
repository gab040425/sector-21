import "./App.css";
import { useEffect, useRef, useState } from "react";

const powerUpTypes = [
  "overcharge",
  "cryo",
  "mutagen",
];

function App() {

  const [showLobby, setShowLobby] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [players, setPlayers] = useState([]);

  const robotCount = players.filter(
    (player) => player.character === "robot"
  ).length;

  const alienCount = players.filter(
    (player) => player.character === "alien"
  ).length;

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

  // Game state
  const [gameOver, setGameOver] = useState(false);

  // Who won?
  const [winner, setWinner] = useState(null);

  // ⏱️ Timer
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [powerUps, setPowerUps] = useState([]);

  const spawnedMilestones = useRef(new Set());

  const [robotPowerUp, setRobotPowerUp] = useState(null);
  const [alienPowerUp, setAlienPowerUp] = useState(null);

  const [robotFrozen, setRobotFrozen] = useState(false);
  const [alienFrozen, setAlienFrozen] = useState(false);

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
      spawnPowerUp();
    }
  }, [timeLeft, gameOver]);

  // 🎮 KEYBOARD CONTROLS
  useEffect(() => {
    function handleKeyDown(event) {
      // Don't allow movement after game ends
      if (gameOver) {
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
  }, [gameOver, robot, alien, robotFrozen, alienFrozen, robotOvercharged, alienOvercharged, robotMutagen, alienMutagen, robotRecharging]);

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

  function moveRobot(direction) {
    if (gameOver) {
      return;
    }

    if (robotFrozen) {
      return;
    }

    if (robotRecharging) {
      return;
    }

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

      if (
        newPosition.row === alien.row &&
        newPosition.col === alien.col
      ) {
        setGameOver(true);
        setWinner("robot");
      }

      if (
        isSticky(
          newPosition.row,
          newPosition.col
        )
      ) {
        setRobotFrozen(true);

        setTimeout(() => {
          setRobotFrozen(false);
        }, 1000);
      }

      return newPosition;
    });
  }

  function moveAlien(direction) {
    if (gameOver) {
      return;
    }

    if (alienFrozen) {
      return;
    }

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
    setRobot(startingRobot);
    setAlien(startingAlien);
    setGameOver(false);
    setWinner(null);
    setTimeLeft(60);
    setGameStarted(false);

    setRobotFrozen(false);
    setAlienFrozen(false);

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

  // Timer displayed in seconds
  const formattedTime = timeLeft;

  return (
    <>
      {showLobby ? (
        <div className="lobby-screen">
          {countdown !== null && (
            <div className="countdown-overlay">
              <div className="countdown-number">
                {countdown}
              </div>
            </div>
          )}
          <div className="lobby">

            <div className="lobby-title">
              <h1>SECTOR 21</h1>
              <p>EXPERIMENT LAB</p>
            </div>

                <button
                  className="start-game-button"
                  onClick={startGame}
                >
                  START GAME
                </button>

          </div>
        </div>
      ) : (
        <div className="game">

          <h1>SECTOR 21</h1>

          {/* TIMER */}
          <div className="timer">{formattedTime}</div>

          <div
            className="game-board"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
            }}
          >
            {Array.from({
              length: rows * columns,
            }).map((_, index) => {
              const row = Math.floor(index / columns);
              const col = index % columns;

              const isRobot =
                robot.row === row &&
                robot.col === col;

              const isAlien =
                alien.row === row &&
                alien.col === col;

              const wall = isWall(row, col);
              const sticky = isSticky(row, col);

              const powerUpOnTile = powerUps.find(
                (powerUp) =>
                  powerUp.row === row &&
                  powerUp.col === col
              );

              return (
                <div
                  className={`tile ${
                    wall
                      ? "wall"
                      : sticky
                      ? "sticky"
                      : ""
                  }`}
                  key={index}
                >
                  {isRobot && (
                    <span
                      className={`player robot ${
                        robotFrozen
                          ? "frozen"
                          : ""
                      } ${
                        robotMutagen
                          ? "mutagen-active"
                          : ""
                      } ${
                        robotRecharging
                          ? "robot-recharging"
                          : ""
                      }`}
                    >
                      🤖
                    </span>
                  )}

                  {isAlien && (
                    <span
                      className={`player alien ${
                        alienFrozen
                          ? "frozen"
                          : ""
                      } ${
                        alienMutagen
                          ? "mutagen-active"
                          : ""
                      }`}
                    >
                      👽
                    </span>
                  )}

                  {powerUpOnTile && (
                    <span className="power-up">
                      ⚡
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="hud">

            {/* ROBOT HUD */}
            <div
              className={`player-hud robot-hud ${
                robotRecharging ? "recharging" : ""
              }`}
            >
              <div className="hud-player">
                <span className="hud-icon">
                  🤖
                </span>

                <div>
                  <div className="hud-name">
                    ROBOT
                  </div>

                  {robotRecharging && (
                    <div className="recharge-status">
                      🔋 RECHARGING...
                    </div>
                  )}

                  <div className="hud-controls">
                    W A S D • E USE
                  </div>
                </div>
              </div>

              <div className="inventory">
                <div className="inventory-label">
                  POWER-UP
                </div>

                <div className="inventory-slot">
                  {robotPowerUp ? (
                    <>
                      <span className="inventory-icon">
                        {robotPowerUp ===
                          "overcharge" &&
                          "⚡"}

                        {robotPowerUp ===
                          "cryo" &&
                          "🧊"}

                        {robotPowerUp ===
                          "mutagen" &&
                          "🧬"}
                      </span>

                      <span className="inventory-name">
                        {robotPowerUp.toUpperCase()}
                      </span>
                    </>
                  ) : (
                    <span className="inventory-empty">
                      EMPTY
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ALIEN HUD */}
            <div className="player-hud alien-hud">
              <div className="hud-player">
                <span className="hud-icon">
                  👽
                </span>

                <div>
                  <div className="hud-name">
                    ALIEN
                  </div>

                  <div className="hud-controls">
                    ARROW KEYS • ENTER USE
                  </div>
                </div>
              </div>

              <div className="inventory">
                <div className="inventory-label">
                  POWER-UP
                </div>

                <div className="inventory-slot">
                  {alienPowerUp ? (
                    <>
                      <span className="inventory-icon">
                        {alienPowerUp ===
                          "overcharge" &&
                          "⚡"}

                        {alienPowerUp ===
                          "cryo" &&
                          "🧊"}

                        {alienPowerUp ===
                          "mutagen" &&
                          "🧬"}
                      </span>

                      <span className="inventory-name">
                        {alienPowerUp.toUpperCase()}
                      </span>
                    </>
                  ) : (
                    <span className="inventory-empty">
                      EMPTY
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* WIN SCREEN */}
          {gameOver && (
            <div className="win-screen">
              <div className="win-box">

                {winner === "robot" ? (
                  <>
                    <div className="win-icon">
                      🤖
                    </div>

                    <h2>
                      ALIEN CAPTURED
                    </h2>

                    <p>
                      SECTOR 21 HAS BEEN
                      SECURED.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="win-icon">
                      👽
                    </div>

                    <h2>
                      ALIEN ESCAPED
                    </h2>

                    <p>
                      THE ALIEN SUCCESSFULLY
                      ESCAPED!
                    </p>
                  </>
                )}

                <button onClick={restartGame}>
                  PLAY AGAIN
                </button>

              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
}


export default App;
