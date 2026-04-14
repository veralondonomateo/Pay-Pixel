"use client";

// ─────────────────────────────────────────────────────────────────────────────
// HeroCube — Holographic Rubik's Cube with HUD, orbital rings & scan line
// ─────────────────────────────────────────────────────────────────────────────

const TILE   = 88;
const GAP    = 6;
const PAD    = 10;
const CELL   = TILE + GAP;
const FACE_S = PAD * 2 + TILE * 3 + GAP * 2;   // 286px
const DEPTH  = FACE_S / 2;                       // 143px
const CYCLE  = 16;
const SXY    = 220;
const SZ     = 360;

const FACES = [
  { orient: "rotateY(0deg)",    rgb: "99,102,241"  },
  { orient: "rotateY(180deg)",  rgb: "139,92,246"  },
  { orient: "rotateY(90deg)",   rgb: "59,130,246"  },
  { orient: "rotateY(-90deg)",  rgb: "6,182,212"   },
  { orient: "rotateX(-90deg)",  rgb: "236,72,153"  },
  { orient: "rotateX(90deg)",   rgb: "168,85,247"  },
] as const;

interface TileData {
  fi: number; ti: number; row: number; col: number;
  baseX: number; baseY: number;
  sx: number; sy: number; sz: number;
  delay: number; name: string;
}

const TILES: TileData[] = [];
FACES.forEach((_, fi) => {
  const faceDelay = fi * 0.09;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const ti = row * 3 + col;
      const dr = row - 1; const dc = col - 1;
      const manhattan = Math.abs(dr) + Math.abs(dc);
      TILES.push({
        fi, ti, row, col,
        baseX: PAD + col * CELL,
        baseY: PAD + row * CELL,
        sx: dc * SXY, sy: dr * SXY,
        sz: SZ + manhattan * 40,
        delay: faceDelay + (2 - manhattan) * 0.04,
        name: `rk${fi}_${ti}`,
      });
    }
  }
});

const TILE_KF = TILES.map(({ name, sx, sy, sz }) => `
@keyframes ${name} {
  0%   { transform:translate(${sx}px,${sy}px) translateZ(${sz}px) scale(.4); opacity:0; animation-timing-function:cubic-bezier(.16,1,.3,1); }
  16%  { transform:translate(0px,0px) translateZ(0px) scale(1); opacity:1; animation-timing-function:linear; }
  70%  { transform:translate(0px,0px) translateZ(0px) scale(1); opacity:1; animation-timing-function:cubic-bezier(.55,0,1,.45); }
  83%  { transform:translate(${sx}px,${sy}px) translateZ(${sz}px) scale(.4); opacity:0; animation-timing-function:linear; }
  100% { transform:translate(${sx}px,${sy}px) translateZ(${sz}px) scale(.4); opacity:0; }
}`).join("\n");

const SHARED_KF = `
@keyframes cube-rotate   { from { transform:rotateX(-18deg) rotateY(0deg); } to { transform:rotateX(-18deg) rotateY(360deg); } }
@keyframes ring-a        { from { transform:rotateX(72deg) rotateZ(0deg); } to { transform:rotateX(72deg) rotateZ(360deg); } }
@keyframes ring-b        { from { transform:rotateX(28deg) rotateY(0deg) rotateZ(0deg); } to { transform:rotateX(28deg) rotateY(0deg) rotateZ(-360deg); } }
@keyframes ring-c        { from { transform:rotateX(55deg) rotateZ(0deg); } to { transform:rotateX(55deg) rotateZ(-360deg); } }
@keyframes tile-pulse    {
  0%,100% { box-shadow:0 0 16px rgba(255,255,255,.22), inset 0 0 12px rgba(255,255,255,.06); }
  50%     { box-shadow:0 0 32px rgba(255,255,255,.60), inset 0 0 20px rgba(255,255,255,.15); }
}
@keyframes orbit-a { from { transform:rotate(0deg) translateX(240px) rotate(0deg); } to { transform:rotate(360deg) translateX(240px) rotate(-360deg); } }
@keyframes orbit-b { from { transform:rotate(72deg) translateX(210px) rotate(-72deg); } to { transform:rotate(-288deg) translateX(210px) rotate(288deg); } }
@keyframes orbit-c { from { transform:rotate(144deg) translateX(185px) rotate(-144deg); } to { transform:rotate(-216deg) translateX(185px) rotate(216deg); } }
@keyframes orbit-d { from { transform:rotate(216deg) translateX(260px) rotate(-216deg); } to { transform:rotate(-144deg) translateX(260px) rotate(144deg); } }
@keyframes orbit-e { from { transform:rotate(288deg) translateX(170px) rotate(-288deg); } to { transform:rotate(-72deg) translateX(170px) rotate(72deg); } }
@keyframes scan    { 0%,100% { top:-10%; opacity:0; } 5% { opacity:.7; } 50% { top:110%; opacity:.5; } 55%,95% { opacity:0; } }
@keyframes hud-fade { 0%,100% { opacity:.25; } 50% { opacity:.65; } }
@keyframes corner-pulse { 0%,100% { opacity:.5; } 50% { opacity:1; } }
@keyframes glow-breathe {
  0%,100% { transform:scale(1); opacity:.7; }
  50%      { transform:scale(1.15); opacity:1; }
}
@keyframes float-data { 0%,100% { transform:translateY(0); opacity:.4; } 50% { transform:translateY(-8px); opacity:.75; } }
`;

function Tile({ fi, ti, row, col, baseX, baseY, delay, name }: TileData) {
  const { rgb } = FACES[fi];
  const isCenter = row === 1 && col === 1;
  const isCorner = row !== 1 && col !== 1;

  const tileBg = isCenter
    ? `linear-gradient(145deg, rgba(${rgb},.32) 0%, rgba(${rgb},.18) 100%)`
    : isCorner
    ? `linear-gradient(145deg, rgba(${rgb},.12) 0%, rgba(${rgb},.07) 100%)`
    : `linear-gradient(145deg, rgba(${rgb},.20) 0%, rgba(${rgb},.11) 100%)`;

  const tileGlow = isCenter
    ? `0 0 24px rgba(${rgb},.65), inset 0 0 16px rgba(${rgb},.22)`
    : `0 0 12px rgba(${rgb},.38), inset 0 0 10px rgba(${rgb},.08)`;

  return (
    <div style={{ position:"absolute", left:baseX, top:baseY, width:TILE, height:TILE, transformStyle:"preserve-3d" }}>
      <div style={{
        width:"100%", height:"100%", borderRadius:"6px",
        background: tileBg,
        border: `1px solid rgba(${rgb},.${isCenter ? 85 : isCorner ? 50 : 65})`,
        boxSizing:"border-box", backfaceVisibility:"hidden",
        animation: isCenter
          ? `${name} ${CYCLE}s infinite both, tile-pulse 2.8s ease-in-out infinite`
          : `${name} ${CYCLE}s infinite both`,
        animationDelay: isCenter ? `${delay}s, 0s` : `${delay}s`,
        boxShadow: tileGlow,
      }}>
        {/* Gloss sheen */}
        <div style={{
          position:"absolute", inset:0, borderRadius:"inherit",
          background:"linear-gradient(135deg, rgba(255,255,255,.08) 0%, transparent 55%)",
          pointerEvents:"none",
        }} />
        {/* Scan line texture */}
        <div style={{
          position:"absolute", inset:0, borderRadius:"inherit",
          backgroundImage:`repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(${rgb},.04) 6px, rgba(${rgb},.04) 7px)`,
          pointerEvents:"none",
        }} />
        {isCenter && (
          <>
            {/* Center dot */}
            <div style={{
              position:"absolute", top:"50%", left:"50%",
              transform:"translate(-50%,-50%)",
              width:"10px", height:"10px", borderRadius:"50%",
              background:`rgba(${rgb},1)`,
              boxShadow:`0 0 16px rgba(${rgb},1), 0 0 32px rgba(${rgb},.5)`,
            }} />
            {/* Corner brackets on center tile */}
            {[["0","0"],["0","auto"],["auto","0"],["auto","auto"]].map(([t,r],i) => (
              <div key={i} style={{
                position:"absolute", top:t==="0"?"6px":"auto", bottom:t==="auto"?"6px":"auto",
                left:r==="0"?"6px":"auto", right:r==="auto"?"6px":"auto",
                width:"10px", height:"10px",
                borderTop: t==="0" ? `1.5px solid rgba(${rgb},.9)` : "none",
                borderBottom: t==="auto" ? `1.5px solid rgba(${rgb},.9)` : "none",
                borderLeft: r==="0" ? `1.5px solid rgba(${rgb},.9)` : "none",
                borderRight: r==="auto" ? `1.5px solid rgba(${rgb},.9)` : "none",
              }} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// HUD corner bracket
function Corner({ pos }: { pos: "tl"|"tr"|"bl"|"br" }) {
  const size = 22;
  const s: React.CSSProperties = {
    position:"absolute", width:size, height:size,
    top:    pos.includes("t") ? 0 : "auto",
    bottom: pos.includes("b") ? 0 : "auto",
    left:   pos.includes("l") ? 0 : "auto",
    right:  pos.includes("r") ? 0 : "auto",
    borderTop:    pos.includes("t") ? "1.5px solid rgba(99,102,241,.7)" : "none",
    borderBottom: pos.includes("b") ? "1.5px solid rgba(99,102,241,.7)" : "none",
    borderLeft:   pos.includes("l") ? "1.5px solid rgba(99,102,241,.7)" : "none",
    borderRight:  pos.includes("r") ? "1.5px solid rgba(99,102,241,.7)" : "none",
    animation: "corner-pulse 2.5s ease-in-out infinite",
  };
  return <div style={s} />;
}

export default function HeroCube() {
  const particles = [
    { anim:"orbit-a 10s linear infinite",  size:6, color:"99,102,241"  },
    { anim:"orbit-b 15s linear infinite",  size:4, color:"139,92,246"  },
    { anim:"orbit-c 20s linear infinite",  size:3, color:"6,182,212"   },
    { anim:"orbit-d 12s linear infinite",  size:5, color:"236,72,153"  },
    { anim:"orbit-e 18s linear infinite",  size:3, color:"168,85,247"  },
  ];

  const rings = [
    { size: FACE_S + 60,  anim:"ring-a 20s linear infinite",  color:"99,102,241",  w:"1px" },
    { size: FACE_S + 110, anim:"ring-b 30s linear infinite",  color:"139,92,246",  w:"1px" },
    { size: FACE_S + 165, anim:"ring-c 24s linear infinite",  color:"6,182,212",   w:"1px" },
  ];

  const dataPoints = [
    { top:"8%",  left:"5%",  text:"0xA3F2",  delay:"0s"    },
    { top:"22%", right:"4%", text:"99.7%",   delay:"0.8s"  },
    { top:"55%", left:"3%",  text:"3D-SYNC", delay:"1.6s"  },
    { top:"75%", right:"5%", text:"LIVE",    delay:"2.4s"  },
  ];

  return (
    <>
      <style>{TILE_KF + SHARED_KF}</style>

      <div className="relative w-full h-full flex items-center justify-center select-none pointer-events-none">

        {/* Ambient glows */}
        <div style={{
          position:"absolute", width:"680px", height:"680px", borderRadius:"50%",
          background:"radial-gradient(circle, rgba(99,102,241,.12) 0%, rgba(139,92,246,.06) 45%, transparent 70%)",
          filter:"blur(80px)", animation:"glow-breathe 4s ease-in-out infinite",
        }} />
        <div style={{
          position:"absolute", width:"400px", height:"400px", borderRadius:"50%",
          background:"radial-gradient(circle, rgba(6,182,212,.07) 0%, transparent 70%)",
          filter:"blur(60px)", animation:"glow-breathe 6s ease-in-out infinite",
          animationDelay:"2s",
        }} />

        {/* Floating HUD data points */}
        {dataPoints.map((d, i) => (
          <div key={i} style={{
            position:"absolute",
            top: d.top, left: (d as any).left, right: (d as any).right,
            fontFamily:"monospace", fontSize:"10px", letterSpacing:"0.1em",
            color:"rgba(99,102,241,.6)",
            animation:`float-data 3s ease-in-out infinite`,
            animationDelay: d.delay,
          }}>
            {d.text}
          </div>
        ))}

        {/* Orbiting particles */}
        {particles.map((p, i) => (
          <div key={i} style={{ position:"absolute", width:0, height:0, top:"50%", left:"50%" }}>
            <div style={{ animation: p.anim }}>
              <div style={{
                width:p.size, height:p.size, borderRadius:"50%",
                background:`rgba(${p.color},1)`,
                boxShadow:`0 0 ${p.size*3}px rgba(${p.color},1), 0 0 ${p.size*6}px rgba(${p.color},.4)`,
              }} />
            </div>
          </div>
        ))}

        {/* 3D scene */}
        <div style={{ perspective:"1100px", width:"700px", height:"700px", position:"relative" }}>

          {/* HUD overlay (2D — sits outside the 3D scene) */}
          <div style={{
            position:"absolute",
            top:"50%", left:"50%",
            width: FACE_S + 60, height: FACE_S + 60,
            transform:"translate(-50%,-50%)",
            pointerEvents:"none",
          }}>
            <Corner pos="tl" /> <Corner pos="tr" />
            <Corner pos="bl" /> <Corner pos="br" />
            {/* Scan line */}
            <div style={{
              position:"absolute", left:0, right:0, height:"2px",
              background:"linear-gradient(90deg, transparent 0%, rgba(99,102,241,.7) 20%, rgba(139,92,246,.9) 50%, rgba(99,102,241,.7) 80%, transparent 100%)",
              boxShadow:"0 0 12px rgba(99,102,241,.8)",
              animation:"scan 5s ease-in-out infinite",
              animationDelay:"2s",
            }} />
            {/* HUD tick marks */}
            {[25, 50, 75].map((pct) => (
              <div key={pct} style={{
                position:"absolute", left:0, top:`${pct}%`,
                width:"6px", height:"1px",
                background:"rgba(99,102,241,.5)",
                animation:"hud-fade 3s ease-in-out infinite",
              }} />
            ))}
            {[25, 50, 75].map((pct) => (
              <div key={pct} style={{
                position:"absolute", right:0, top:`${pct}%`,
                width:"6px", height:"1px",
                background:"rgba(99,102,241,.5)",
                animation:"hud-fade 3s ease-in-out infinite",
                animationDelay:"0.5s",
              }} />
            ))}
          </div>

          {/* 3D cube + rings */}
          <div style={{
            position:"absolute", top:"50%", left:"50%",
            width:0, height:0, transformStyle:"preserve-3d",
            animation:"cube-rotate 32s linear infinite",
          }}>
            {/* Orbital rings */}
            {rings.map((r, i) => (
              <div key={i} style={{
                position:"absolute",
                width:r.size, height:r.size,
                left:-r.size/2, top:-r.size/2,
                borderRadius:"50%",
                border:`${r.w} solid rgba(${r.color},.20)`,
                boxShadow:`0 0 12px rgba(${r.color},.08), inset 0 0 12px rgba(${r.color},.04)`,
                animation:r.anim,
                transformStyle:"preserve-3d",
              }}>
                {/* Ring dot */}
                <div style={{
                  position:"absolute", top:"-5px", left:"50%", transform:"translateX(-50%)",
                  width:"10px", height:"10px", borderRadius:"50%",
                  background:`rgba(${r.color},.95)`,
                  boxShadow:`0 0 16px rgba(${r.color},1), 0 0 30px rgba(${r.color},.5)`,
                }} />
                {/* Opposite dot */}
                <div style={{
                  position:"absolute", bottom:"-5px", left:"50%", transform:"translateX(-50%)",
                  width:"6px", height:"6px", borderRadius:"50%",
                  background:`rgba(${r.color},.5)`,
                  boxShadow:`0 0 10px rgba(${r.color},.8)`,
                }} />
              </div>
            ))}

            {/* 6 faces */}
            {FACES.map((face, fi) => (
              <div key={fi} style={{
                position:"absolute",
                width:FACE_S, height:FACE_S,
                left:-FACE_S/2, top:-FACE_S/2,
                transformStyle:"preserve-3d",
                transform:`${face.orient} translateZ(${DEPTH}px)`,
              }}>
                {TILES.filter(t => t.fi === fi).map((tile, i) => (
                  <Tile key={i} {...tile} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
