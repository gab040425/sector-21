const samples = {
  overcharge: { name: "Overcharge", code: "OVR", description: "Two-tile movement" },
  cryo: { name: "Cryo", code: "CRY", description: "Freeze your opponent" },
  mutagen: { name: "Mutagen", code: "MUT", description: "Enter one wall tile" },
};

const machineryTiles = ["computer", "console", "tank", "crate", "server", "generator", "containment", "barrel"];

function spriteEffect(frozen, freezeSource, recharging, mutated) {
  // One sprite effect wins visually; all underlying gameplay flags remain intact.
  if (frozen) return freezeSource === "goo" ? "goo" : "cryo";
  if (recharging) return "recharge";
  if (mutated) return "mutagen";
  return "none";
}

function Symbol({ kind, className = "" }) {
  const paths = {
    robot: <><path d="M7 8V5h10v3M12 2v3M4 10H2v7h2m16-7h2v7h-2M4 8h16v13H4z" /><path d="M8 12v3m8-3v3M8 18h8" /></>,
    alien: <><path d="M12 2C5 2 2 6 3 12c1 6 6 10 9 10s8-4 9-10C22 6 19 2 12 2Z" /><path d="m6 9 4 3-1 3-3-2zm12 0-4 3 1 3 3-2zM10 18h4" /></>,
    overcharge: <path d="m14 2-9 12h6l-1 8 9-12h-6z" />,
    cryo: <><path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3M9 20l3-3 3 3M4 10l4-1-1-4m13 9-4 1 1 4M4 14l4 1-1 4m13-9-4-1 1-4" /></>,
    mutagen: <><path d="M7 2c0 8 10 12 10 20M17 2C17 10 7 14 7 22M8 5h8M9 9h6m-6 6h6m-7 4h8" /></>,
    shield: <><path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6z" /><path d="m8 12 3 3 5-6" /></>,
    alert: <><path d="m12 2 10 19H2zM12 8v6m0 3v1" /></>,
  };
  return <svg className={`symbol ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}

function Brand() {
  return <div className="brand"><span className="brand-badge">21</span><div><strong>SECTOR 21</strong><small>CONTAINMENT DIVISION</small></div></div>;
}

function Controls({ role }) {
  return <div className="controls"><span className="key-group">{(role === "robot" ? ["W", "A", "S", "D"] : ["↑", "←", "↓", "→"]).map(key => <kbd key={key}>{key}</kbd>)}</span><span>MOVE</span><kbd>{role === "robot" ? "E" : "ENTER"}</kbd><span>USE</span></div>;
}

function Lobby({ onStart, countdown }) {
  return <main className="screen lobby-screen">
    <div className="lobby">
      <header className="facility-header"><Brand /><span className="technical"><i className="signal" /> LOCAL SYSTEM / ONLINE</span></header>
      <section className="menu-hero">
        <div><p className="eyebrow warning"><span className="alarm-dot" /> SECURITY EVENT / LEVEL 03</p><h1>SECTOR <span>21</span></h1><p className="protocol">CONTAINMENT PROTOCOL</p><p className="menu-intro">An escaped subject. A relentless pursuer.<br />Sixty seconds to decide who leaves the lab.</p></div>
        <div className="containment-seal" aria-hidden="true"><Symbol kind="shield" /><span>RESTRICTED AREA</span><strong>21</strong><small>LIVE EXPERIMENT</small></div>
      </section>
      <section className="versus" aria-label="Player roles and keyboard controls">
        {["robot", "alien"].map((role, index) => <article className={`role-card ${role}`} key={role}>
          <div className="specimen"><Symbol kind={role} /><span>0{index + 1}</span></div>
          <div className="role-info"><p className="eyebrow">SUBJECT 0{index + 1} / {role === "robot" ? "PURSUER" : "FUGITIVE"}</p><h2>{role.toUpperCase()}</h2><p>{role === "robot" ? "Intercept the Alien. Restore containment." : "Evade the Robot. Survive the full 60 seconds."}</p><Controls role={role} /></div>
        </article>)}
      </section>
      <footer className="menu-footer"><div className="system-readout"><span className="technical">EXPERIMENT PARAMETERS</span><strong>02 SUBJECTS <b>/</b> 60 SECONDS <b>/</b> 01 ARENA</strong><span>Two players. One keyboard. Fully local.</span></div><button className="primary-button" onClick={onStart} disabled={countdown !== null} autoFocus>INITIATE EXPERIMENT <span aria-hidden="true">↗</span></button></footer>
      <details className="field-guide"><summary>HOW TO PLAY <span aria-hidden="true">+</span></summary><div className="guide-content"><p>The Robot wins when either player moves onto the other. The Alien wins when time reaches zero. Walls block movement; chemical spills immobilize you for 1 second.</p><p>The Robot recharges for 3 seconds at 45, 30, and 15 seconds remaining. During recharge, movement and power-up activation are locked.</p><p>Carry one sample at a time. Press E (Robot) or Enter (Alien) to activate it. Overcharge attempts a two-tile move, Cryo freezes your opponent for 2 seconds, and Mutagen allows entering one wall tile.</p></div></details>
      <div className="facility-footer technical"><span>LABORATORY 21 / EXPERIMENT CONTROL</span><span className="warning">CONTAINMENT IS NOT GUARANTEED</span></div>
    </div>
    {countdown !== null && <div className="countdown-overlay" role="status" aria-live="assertive"><p className="eyebrow">EXPERIMENT INITIALIZING</p><strong className="countdown-number">{countdown}</strong><p className="technical">CHAMBER SEALED / SUBJECTS DEPLOYING</p></div>}
  </main>;
}

function PlayerHUD({ role, frozen, recharging, overcharged, mutated, sample }) {
  const statuses = [recharging && "RECHARGING", frozen && "IMMOBILIZED", overcharged && "OVERCHARGE ARMED", mutated && "MUTAGEN ARMED"].filter(Boolean);
  return <article className={`player-hud ${role} ${frozen ? "hud-frozen" : ""} ${recharging ? "hud-recharging" : ""}`}>
    <div className="hud-identity"><span className="hud-portrait"><Symbol kind={role} /></span><div><span className="eyebrow">SUBJECT {role === "robot" ? "01" : "02"}</span><h2>{role.toUpperCase()}</h2></div><div className="hud-status" role="status">{statuses.length ? statuses.map(status => <span key={status}>{status}</span>) : <span className="ready">{role === "robot" ? "PURSUIT ACTIVE" : "EVASION ACTIVE"}</span>}</div></div>
    <div className="hud-bottom"><Controls role={role} /><div className={`inventory ${sample || "empty"}`}><span className="technical">SAMPLE</span>{sample ? <><Symbol kind={sample} /><strong>{samples[sample].name.toUpperCase()}</strong></> : <strong>EMPTY SLOT</strong>}</div></div>
  </article>;
}

export default function GameUI({ showLobby, countdown, onStart, onBack, rows, columns, robot, alien, robotDirection, alienDirection, isWall, isSticky, powerUps, robotPowerUp, alienPowerUp, robotFrozen, alienFrozen, robotFreezeSource, alienFreezeSource, robotRecharging, robotOvercharged, alienOvercharged, robotMutagen, alienMutagen, timeLeft, gameOver, winner }) {
  if (showLobby) return <Lobby onStart={onStart} countdown={countdown} />;
  const robotEffect = spriteEffect(robotFrozen, robotFreezeSource, robotRecharging, robotMutagen);
  const alienEffect = spriteEffect(alienFrozen, alienFreezeSource, false, alienMutagen);
  return <main className={`screen game ${timeLeft <= 15 ? "critical" : ""}`}>
    <header className="game-header"><Brand /><div className="timer-panel"><span className="technical">CONTAINMENT WINDOW</span><strong className="timer">{String(timeLeft).padStart(2, "0")}<small>SEC</small></strong></div><div className="session-state"><span className="eyebrow"><span className="alarm-dot" /> {gameOver ? "EXPERIMENT ENDED" : timeLeft <= 15 ? "CRITICAL WINDOW" : "EXPERIMENT IN PROGRESS"}</span><span className="technical">LOCAL SESSION / 02 SUBJECTS</span></div></header>
    <section className="arena-section" aria-label="Containment arena">
      <div className="arena-heading"><span className="technical"><i className="signal" /> LIVE FEED <b>/</b> TEST CHAMBER 21</span><span className="arena-legend technical"><span><i className="barrier-key" /> BARRIER</span><span><i className="spill-key" /> CHEMICAL</span></span></div>
      <div className="arena-frame"><div className="game-board" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
        {Array.from({ length: rows * columns }, (_, index) => {
          const row = Math.floor(index / columns);
          const col = index % columns;
          const hasRobot = robot.row === row && robot.col === col;
          const hasAlien = alien.row === row && alien.col === col;
          const sample = powerUps.find(item => item.row === row && item.col === col);
          const wall = isWall(row, col);
          const sticky = !wall && isSticky(row, col);
          const machinery = machineryTiles[index % machineryTiles.length];
          // Fixed coordinate buckets: about 75% plain, 20% light wear, 5% stronger wear.
          const wearRoll = ((Math.imul(row + 1, 73856093) ^ Math.imul(col + 1, 19349663)) >>> 0) % 20;
          const wear = wall || sticky || wearRoll < 15 ? "" : wearRoll < 19 ? "floor-wear-light" : "floor-wear-heavy";
          return <div className={`tile ${wall ? "wall" : sticky ? "sticky" : ""} ${wear}`} data-row={row} data-col={col} key={index}>
            <img className="environment-tile floor-tile" src="/tiles/floor/clean.png" alt="" width="32" height="32" draggable={false} />
            {wall && <img className="environment-tile machinery-tile" src={`/tiles/machinery/${machinery}.png`} alt="" width="32" height="32" draggable={false} />}
            {sticky && <img className="environment-tile goo-tile" src="/tiles/goo/large.png" alt="" width="32" height="32" draggable={false} />}
            {hasRobot && <span aria-label="Robot" data-sprite-effect={robotEffect} className={`unit robot ${robotFrozen ? "is-frozen" : ""} ${robotRecharging ? "is-recharging" : ""} ${robotOvercharged ? "is-overcharged" : ""} ${robotMutagen ? "is-mutated" : ""}`}><img className="character-sprite" src={`/sprites/robot/${robotDirection}.png`} alt="" width="32" height="32" draggable={false} /></span>}
            {hasAlien && <span aria-label="Alien" data-sprite-effect={alienEffect} className={`unit alien ${alienFrozen ? "is-frozen" : ""} ${alienOvercharged ? "is-overcharged" : ""} ${alienMutagen ? "is-mutated" : ""}`}><img className="character-sprite" src={`/sprites/alien/${alienDirection}.png`} alt="" width="32" height="32" draggable={false} /></span>}
            {sample && <span className={`power-up ${sample.type}`} aria-label={samples[sample.type].name} title={samples[sample.type].name}><Symbol kind={sample.type} /></span>}
          </div>;
        })}
      </div></div>
      <div className="arena-caption technical"><span>CHAMBER GRID / {columns} × {rows}</span><span>MONITORING ALL SUBJECT MOVEMENT</span></div>
    </section>
    <section className="hud" aria-label="Player status and inventory"><PlayerHUD role="robot" frozen={robotFrozen} recharging={robotRecharging} overcharged={robotOvercharged} mutated={robotMutagen} sample={robotPowerUp} /><PlayerHUD role="alien" frozen={alienFrozen} overcharged={alienOvercharged} mutated={alienMutagen} sample={alienPowerUp} /></section>
    <footer className="sample-key">{Object.entries(samples).map(([type, sample]) => <span className={type} key={type}><Symbol kind={type} /><strong>{sample.code}</strong><span>{sample.description}</span></span>)}</footer>
    {gameOver && <div className="result-overlay"><section className={`result-panel ${winner === "robot" ? "secured" : "breached"}`} role="dialog" aria-modal="true" aria-labelledby="result-title"><p className="eyebrow">EXPERIMENT REPORT / FINAL</p><span className="result-icon"><Symbol kind={winner === "robot" ? "shield" : "alert"} /></span><span className="result-status">{winner === "robot" ? "CONTAINMENT RESTORED" : "CONTAINMENT BREACH"}</span><h2 id="result-title">{winner === "robot" ? "ALIEN CAPTURED" : "ALIEN ESCAPED"}</h2><p className="result-copy">{winner === "robot" ? "Robot wins. The subject has been secured." : "Alien wins. The containment window has expired."}</p><div className="result-summary technical"><span>WINNING SUBJECT</span><strong>{winner === "robot" ? "01 / ROBOT" : "02 / ALIEN"}</strong><span>TIME REMAINING</span><strong>{timeLeft} SEC</strong></div><button className="primary-button" onClick={onBack} autoFocus>BACK TO LOBBY <span aria-hidden="true">↗</span></button><p className="result-note">Return to experiment control to start a new round.</p></section></div>}
  </main>;
}
