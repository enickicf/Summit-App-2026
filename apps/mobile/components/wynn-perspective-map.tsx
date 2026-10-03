import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Polygon, RadialGradient, Stop, Text as SvgText } from "react-native-svg";

// The Wynn meeting wing seen from where attendees arrive: the casino entrance by Registration Desk 4,
// looking up the Sunset Promenade. Room footprints come from Wynn's published "Ballrooms and Meeting
// Rooms Map" (plan coordinates, same source as the website venue info); the view is a perspective
// projection of that plan, so rooms keep their real positions and proportions.

type Pt = { x: number; y: number };
type Room = { name: string; x: number; y: number; w: number; h: number; kind?: "ballroom" | "dining"; size?: number };

const VIEW_W = 400;
const VIEW_H = 590;
const CAMERA_X = 760;
const FOCAL = 404;
const DEPTH = (y: number) => 1330 - y;
const WALL = 26;

function project(p: Pt, lift = 0): Pt {
  const z = DEPTH(p.y);
  return { x: VIEW_W / 2 + (FOCAL * (p.x - CAMERA_X)) / z, y: (420100 - FOCAL * lift) / z - 443 };
}
const scaleAt = (y: number) => 425 / DEPTH(y);
const pts = (list: Pt[]) => list.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
const rect = (x: number, y: number, w: number, h: number, lift = 0) =>
  [project({ x, y }, lift), project({ x: x + w, y }, lift), project({ x: x + w, y: y + h }, lift), project({ x, y: y + h }, lift)];

const rooms: Room[] = [
  { name: "Convention Lounge", x: 812, y: 476, w: 20, h: 50, size: 6 },
  { name: "Margaux", x: 652, y: 530, w: 86, h: 68, size: 12 },
  { name: "Lafleur", x: 742, y: 540, w: 44, h: 58, size: 9 },
  { name: "Lafite Ballroom", x: 812, y: 545, w: 132, h: 168, kind: "ballroom", size: 13 },
  { name: "Mouton", x: 572, y: 622, w: 56, h: 48, size: 10 },
  { name: "Montrachet", x: 634, y: 626, w: 28, h: 36, size: 6.5 },
  { name: "La Tache", x: 700, y: 626, w: 40, h: 36, size: 8 },
  { name: "Latour Ballroom", x: 812, y: 735, w: 124, h: 106, kind: "ballroom", size: 13 },
  { name: "Delilah", x: 578, y: 780, w: 60, h: 64, kind: "dining", size: 10 },
  { name: "Alsace", x: 646, y: 810, w: 54, h: 38, size: 10 },
  { name: "Chambertin", x: 732, y: 810, w: 52, h: 38, size: 9 }
];

// Walkable hallways (Wynn's promenades and corridors).
const halls: Array<[number, number, number, number]> = [
  [560, 602, 250, 18],  // main meeting corridor (Registration Desks 1-2)
  [790, 470, 20, 400],  // Sunset Promenade
  [596, 852, 214, 18],  // casino arrival corridor (Registration Desks 3-4)
  [596, 852, 20, 58],   // entrance from the casino
  [810, 716, 134, 16]   // Lafite / Latour Promenade
];

export function WynnPerspectiveMap({ highlighted, width }: { highlighted: Set<string>; width: number }) {
  const height = (width * VIEW_H) / VIEW_W;
  const ordered = [...rooms].sort((a, b) => a.y + a.h - (b.y + b.h));
  const entrance = project({ x: 606, y: 900 });
  const promenadeA = project({ x: 800, y: 840 });
  const promenadeB = project({ x: 800, y: 660 });
  const promenadeAngle = (Math.atan2(promenadeB.y - promenadeA.y, promenadeB.x - promenadeA.x) * 180) / Math.PI;
  const promenadeMid = project({ x: 800, y: 760 });
  const arrivalMid = project({ x: 700, y: 861 });
  const pool = rect(668, 682, 90, 90);

  return (
    <Svg accessibilityLabel="Map of the Wynn meeting wing, seen from the casino entrance" height={height} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={width}>
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#e9e5f0" />
          <Stop offset="1" stopColor="#f7f5f9" />
        </LinearGradient>
        <LinearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ebe6ee" />
          <Stop offset="1" stopColor="#f4f1f5" />
        </LinearGradient>
        <LinearGradient id="hall" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#efe6d6" />
          <Stop offset="1" stopColor="#f8f2e7" />
        </LinearGradient>
        <LinearGradient id="roof" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#fbfafc" />
          <Stop offset="1" stopColor="#e9e3ef" />
        </LinearGradient>
        <LinearGradient id="roofBallroom" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#f6f3f9" />
          <Stop offset="1" stopColor="#ddd4e7" />
        </LinearGradient>
        <LinearGradient id="roofDining" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#f7f1e7" />
          <Stop offset="1" stopColor="#e7dac6" />
        </LinearGradient>
        <LinearGradient id="roofLit" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#8a77b8" />
          <Stop offset="1" stopColor="#4c376f" />
        </LinearGradient>
        <LinearGradient id="front" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#d9d1e2" />
          <Stop offset="1" stopColor="#c7bdd3" />
        </LinearGradient>
        <LinearGradient id="frontLit" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#3f2d5e" />
          <Stop offset="1" stopColor="#33244d" />
        </LinearGradient>
        <RadialGradient id="water" cx="0.45" cy="0.4" r="0.75">
          <Stop offset="0" stopColor="#e6f2f3" />
          <Stop offset="1" stopColor="#b9d5d9" />
        </RadialGradient>
        <RadialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#f0c477" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#f0c477" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Polygon fill="url(#sky)" points={`0,0 ${VIEW_W},0 ${VIEW_W},${VIEW_H} 0,${VIEW_H}`} />
      {/* Floor of the wing */}
      <Polygon fill="url(#floor)" points={pts(rect(560, 466, 390, 444))} stroke="#dcd5e3" strokeWidth={0.6} />

      {/* Sunset pool court */}
      <Polygon fill="#ece5da" points={pts(rect(656, 670, 116, 114))} />
      <Polygon fill="url(#water)" points={pts(pool)} stroke="#a9c8cd" strokeWidth={0.6} />
      <SvgText fill="#6b9398" fontFamily="Poppins_600SemiBold" fontSize={6 * scaleAt(727)} letterSpacing={1} textAnchor="middle" x={project({ x: 713, y: 727 }).x} y={project({ x: 713, y: 727 }).y + 2}>SUNSET POOL</SvgText>

      {/* Hallways */}
      {halls.map(([x, y, w, h], index) => <Polygon fill="url(#hall)" key={index} points={pts(rect(x, y, w, h))} stroke="#e3d5bd" strokeWidth={0.5} />)}
      <SvgText fill="#a38c68" fontFamily="Poppins_600SemiBold" fontSize={7.5} letterSpacing={1.6} textAnchor="middle" transform={`rotate(${promenadeAngle} ${promenadeMid.x} ${promenadeMid.y})`} x={promenadeMid.x} y={promenadeMid.y + 2.5}>SUNSET PROMENADE</SvgText>
      <SvgText fill="#a38c68" fontFamily="Poppins_600SemiBold" fontSize={7} letterSpacing={1.4} textAnchor="middle" x={arrivalMid.x} y={arrivalMid.y + 2.5}>REGISTRATION</SvgText>

      {/* Rooms, far to near, extruded for depth */}
      {ordered.map(room => {
        const lit = highlighted.has(room.name.toLowerCase());
        const base = rect(room.x, room.y, room.w, room.h);
        const top = rect(room.x, room.y, room.w, room.h, WALL);
        const front = [base[3]!, base[2]!, top[2]!, top[3]!];
        const leftOfCamera = room.x + room.w / 2 < CAMERA_X;
        const side = leftOfCamera ? [base[1]!, base[2]!, top[2]!, top[1]!] : [base[0]!, base[3]!, top[3]!, top[0]!];
        const roof = lit ? "url(#roofLit)" : room.kind === "ballroom" ? "url(#roofBallroom)" : room.kind === "dining" ? "url(#roofDining)" : "url(#roof)";
        const center = project({ x: room.x + room.w / 2, y: room.y + room.h / 2 }, WALL);
        const preferred = (room.size ?? 9) * scaleAt(room.y + room.h / 2);
        // Label on one line if it fits the roof, otherwise one word per line; skip only if neither fits.
        const roofWidth = Math.abs(top[2]!.x - top[3]!.x);
        const words = room.name.toUpperCase().split(" ");
        const lines = roofWidth > room.name.length * preferred * 0.58 + 4 ? [words.join(" ")] : words;
        // Shrink the label to the roof when needed; drop it only when it would be unreadably small.
        const size = Math.min(preferred, (roofWidth - 4) / (Math.max(...lines.map(line => line.length)) * 0.62));
        const fits = size >= 4.2;
        return (
          <G key={room.name}>
            <Polygon fill="rgba(59, 47, 82, 0.10)" points={pts(rect(room.x + 3, room.y + 4, room.w, room.h))} />
            <Polygon fill={lit ? "#2c1f44" : "#bdb2ca"} points={pts(side)} />
            <Polygon fill={lit ? "url(#frontLit)" : "url(#front)"} points={pts(front)} />
            <Polygon fill={roof} points={pts(top)} stroke={lit ? "#d9b56a" : "#cfc5da"} strokeWidth={lit ? 1.2 : 0.5} />
            {fits ? lines.map((line, index) => (
              <SvgText fill={lit ? "#ffffff" : "#5d526b"} fontFamily="Poppins_600SemiBold" fontSize={size} key={line} letterSpacing={0.6} textAnchor="middle" x={center.x} y={center.y + size * 0.35 + (index - (lines.length - 1) / 2) * size * 1.15}>{line}</SvgText>
            )) : null}
            {lit ? <SvgText fill="#f0c477" fontFamily="Poppins_500Medium" fontSize={size * 0.5} letterSpacing={1.2} textAnchor="middle" x={center.x} y={center.y + size * 1.3}>SUMMIT ROOM</SvgText> : null}
          </G>
        );
      })}

      {/* You are here */}
      <Ellipse cx={entrance.x} cy={entrance.y} fill="url(#glow)" rx={34} ry={18} />
      <Path d={`M${entrance.x},${entrance.y - 6} l0,-26 m-5,6 l5,-6 l5,6`} fill="none" stroke="#4c376f" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} />
      <Circle cx={entrance.x} cy={entrance.y} fill="#ffffff" r={6.5} stroke="#d9b56a" strokeWidth={2} />
      <Circle cx={entrance.x} cy={entrance.y} fill="#4c376f" r={2.8} />
      <SvgText fill="#4c376f" fontFamily="Poppins_600SemiBold" fontSize={8} letterSpacing={0.8} textAnchor="start" x={entrance.x + 12} y={entrance.y - 1}>YOU ENTER HERE</SvgText>
      <SvgText fill="#8a7f9b" fontFamily="Poppins_500Medium" fontSize={6.5} letterSpacing={0.6} textAnchor="start" x={entrance.x + 12} y={entrance.y + 8}>from the Wynn casino</SvgText>
    </Svg>
  );
}
