"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Rubik's cube: 6 faces × 9 individual tiles = 54 animated cubelets.
// Each tile has its own baked-in keyframe so it flies in from a unique
// direction and snaps into its grid position — one by one.
// ─────────────────────────────────────────────────────────────────────────────

const TILE   = 70;                                   // px — one small square
const GAP    = 5;                                    // px — gap between tiles
const PAD    = 9;                                    // px — face internal padding
const CELL   = TILE + GAP;                           // 75 — center-to-center
const FACE_S = PAD * 2 + TILE * 3 + GAP * 2;        // 232 — face panel side
const DEPTH  = FACE_S / 2;                          // 116 — translateZ to cube edge
const CYCLE  = 14;                                   // seconds per lifecycle
const SXY    = 180;                                  // px — XY scatter within face
const SZ     = 300;                                  // px — Z scatter (outward)

// Face orientations + their futuristic neon color
const FACES = [
  { orient: "rotateY(0deg)",    rgb: "99,102,241"  },  // indigo
  { orient: "rotateY(180deg)",  rgb: "139,92,246"  },  // violet
  { orient: "rotateY(90deg)",   rgb: "59,130,246"  },  // blue
  { orient: "rotateY(-90deg)",  rgb: "6,182,212"   },  // cyan
  { orient: "rotateX(-90deg)",  rgb: "226,232,240" },  // silver/white
  { orient: "rotateX(90deg)",   rgb: "168,85,247"  },  // purple
] as const;

// ── Build 54 tile descriptors ─────────────────────────────────────────────
interface TileData {
  fi: number;                   // face index
  ti: number;                   // tile index (0-8)
  row: number; col: number;     // grid position
  baseX: number; baseY: number; // CSS left/top within face
  sx: number; sy: number; sz: number; // scatter offsets
  delay: number;
  name: string;
}

const TILES: TileData[] = [];

FACES.forEach((_, fi) => {
  const faceDelay = fi * 0.095;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const ti   = row * 3 + col;
      const dr   = row - 1;   // -1, 0, +1
      const dc   = col - 1;
      const manhattan = Math.abs(dr) + Math.abs(dc);  // 0=center, 1=edge, 2=corner

      // Corners arrive first, center last (outside-in)
      const withinDelay = (2 - manhattan) * 0.042;

      TILES.push({
        fi, ti, row, col,
        baseX: PAD + col * CELL,
        baseY: PAD + row * CELL,
        sx: dc * SXY,
        sy: dr * SXY,
        sz: SZ + manhattan * 30,          // corners scatter a bit further in Z
        delay: faceDelay + withinDelay,
        name: `rk${fi}_${ti}`,
      });
    }
  }
});

// ── Baked-in @keyframes for every tile ────────────────────────────────────
const TILE_KF = TILES.map(({ name, sx, sy, sz }) => `
@keyframes ${name} {
  0%   { transform:translate(${sx}px,${sy}px) translateZ(${sz}px) scale(.45); opacity:0; animation-timing-function:cubic-bezier(.16,1,.3,1); }
  18%  { transform:translate(0px,0px) translateZ(0px) scale(1); opacity:1; animation-timing-function:linear; }
  72%  { transform:translate(0px,0px) translateZ(0px) scale(1); opacity:1; animation-timing-function:cubic-bezier(.55,0,1,.45); }
  84%  { transform:translate(${sx}px,${sy}px) translateZ(${sz}px) scale(.45); opacity:0; animation-timing-function:linear; }
  100% { transform:translate(${sx}px,${sy}px) translateZ(${sz}px) scale(.45); opacity:0; }
}`).join("\n");

// ── Shared animations ─────────────────────────────────────────────────────
const SHARED_KF = `
@keyframes ring-spin    { from { transform:rotateX(72deg) rotateZ(0deg);   } to { transform:rotateX(72deg) rotateZ(360deg);   } }
@keyframes ring-spin-r  { from { transform:rotateX(28deg) rotateY(0deg) rotateZ(0deg); } to { transform:rotateX(28deg) rotateY(0deg) rotateZ(-360deg); } }
@keyframes tile-center-pulse {
  0%,100% { box-shadow:0 0 14px rgba(255,255,255,.25), inset 0 0 10px rgba(255,255,255,.07); }
  50%     { box-shadow:0 0 28px rgba(255,255,255,.55), inset 0 0 18px rgba(255,255,255,.14); }
}
@keyframes orbit-a { from { transform:rotate(0deg) translateX(205px) rotate(0deg); } to { transform:rotate(360deg) translateX(205px) rotate(-360deg); } }
@keyframes orbit-b { from { transform:rotate(110deg) translateX(180px) rotate(-110deg); } to { transform:rotate(-250deg) translateX(180px) rotate(250deg); } }
@keyframes orbit-c { from { transform:rotate(220deg) translateX(160px) rotate(-220deg); } to { transform:rotate(-140deg) translateX(160px) rotate(140deg); } }
`;

// ── Single tile component ─────────────────────────────────────────────────
function Tile({ fi, ti, row, col, baseX, baseY, delay, name }: TileData) {
  const { rgb } = FACES[fi];
  const isCenter = row === 1 && col === 1;
  const isCorner = (row !== 1) && (col !== 1);

  const tileBg    = isCenter
    ? `linear-gradient(145deg, rgba(${rgb},.28) 0%, rgba(${rgb},.15) 100%)`
    : isCorner
    ? `linear-gradient(145deg, rgba(${rgb},.10) 0%, rgba(${rgb},.06) 100%)`
    : `linear-gradient(145deg, rgba(${rgb},.16) 0%, rgba(${rgb},.09) 100%)`;

  const tileGlow  = isCenter
    ? `0 0 20px rgba(${rgb},.55), inset 0 0 14px rgba(${rgb},.18)`
    : `0 0 10px rgba(${rgb},.32), inset 0 0 8px rgba(${rgb},.07)`;

  const tileBorder = `1px solid rgba(${rgb},.${isCenter ? 80 : isCorner ? 55 : 65})`;

  return (
    <div style={{
      position: "absolute",
      left: baseX, top: baseY,
      width: TILE, height: TILE,
      transformStyle: "preserve-3d",
    }}>
      <div style={{
        width: "100%", height: "100%",
        borderRadius: "4px",
        background: tileBg,
        border: tileBorder,
        boxSizing: "border-box",
        backfaceVisibility: "hidden",
        animation: isCenter
          ? `${name} ${CYCLE}s infinite both, tile-center-pulse 2.5s ease-in-out infinite`
          : `${name} ${CYCLE}s infinite both`,
        animationDelay: isCenter ? `${delay}s, 0s` : `${delay}s`,
        boxShadow: tileGlow,
      }}>
        {/* Gloss sheen on each tile */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "inherit",
          background: "linear-gradient(135deg, rgba(255,255,255,.06) 0%, transparent 55%)",
          pointerEvents: "none",
        }} />
        {/* Center dot on center tile */}
        {isCenter && (
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: "8px", height: "8px", borderRadius: "50%",
            background: `rgba(${rgb},1)`,
            boxShadow: `0 0 12px rgba(${rgb},1)`,
          }} />
        )}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────
export default function HeroCube() {
  return (
    <>
      <style>{TILE_KF + SHARED_KF}</style>

      <div className="relative w-full h-full flex items-center justify-center select-none pointer-events-none">

        {/* Ambient radial glow */}
        <div className="absolute animate-glow-pulse" style={{
          width: "520px", height: "520px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,.10) 0%, rgba(139,92,246,.04) 55%, transparent 70%)",
          filter: "blur(70px)",
        }} />

        {/* Orbiting particles */}
        {[
          { anim: "orbit-a 9s linear infinite",  size: 5, color: "99,102,241" },
          { anim: "orbit-b 13s linear infinite", size: 4, color: "139,92,246" },
          { anim: "orbit-c 17s linear infinite", size: 3, color: "6,182,212"  },
        ].map((p, i) => (
          <div key={i} className="absolute" style={{ width: 0, height: 0, top: "50%", left: "50%" }}>
            <div style={{ animation: p.anim }}>
              <div style={{
                width: p.size, height: p.size, borderRadius: "50%",
                background: `rgba(${p.color},0.9)`,
                boxShadow: `0 0 ${p.size * 2}px rgba(${p.color},1)`,
              }} />
            </div>
          </div>
        ))}

        {/* 3D scene */}
        <div style={{ perspective: "1000px", width: "640px", height: "640px", position: "relative" }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            width: 0, height: 0, transformStyle: "preserve-3d",
            animation: "cube-rotate 28s linear infinite",
          }}>

            {/* Orbital rings */}
            {[
              { size: FACE_S + 48, anim: "ring-spin 18s linear infinite",   color: "99,102,241",  w: "1px" },
              { size: FACE_S + 90, anim: "ring-spin-r 26s linear infinite", color: "139,92,246",  w: "1px" },
            ].map((r, i) => (
              <div key={i} style={{
                position: "absolute",
                width: r.size, height: r.size,
                left: -r.size / 2, top: -r.size / 2,
                borderRadius: "50%",
                border: `${r.w} solid rgba(${r.color},.18)`,
                boxShadow: `0 0 10px rgba(${r.color},.08)`,
                animation: r.anim,
                transformStyle: "preserve-3d",
              }}>
                <div style={{
                  position: "absolute", top: "-4px", left: "50%", transform: "translateX(-50%)",
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: `rgba(${r.color},.95)`,
                  boxShadow: `0 0 14px rgba(${r.color},1)`,
                }} />
              </div>
            ))}

            {/* 6 face orientation wrappers */}
            {FACES.map((face, fi) => (
              <div key={fi} style={{
                position: "absolute",
                width: FACE_S, height: FACE_S,
                left: -FACE_S / 2, top: -FACE_S / 2,
                transformStyle: "preserve-3d",
                transform: `${face.orient} translateZ(${DEPTH}px)`,
              }}>
                {/* 9 tiles per face */}
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
