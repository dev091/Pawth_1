import React, { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Circle,
  Ellipse,
  Path,
  G,
} from 'react-native-svg';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

interface Palette {
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  orb: string;
  orbGlow: string;
  farRidge: string;
  snow: string;
  midHill: string;
  nearHill: string;
  ground: string;
  groundShade: string;
  canopy: string;
  canopyDark: string;
  trunk: string;
  cloud: string;
  cloudOpacity: number;
  bloom: string;
}

const palettes: Record<TimeOfDay, Palette> = {
  morning: {
    skyTop: '#FFE2B8',
    skyMid: '#FFD9D0',
    skyBottom: '#C9E7F7',
    orb: '#FFD06B',
    orbGlow: '#FFE7A6',
    farRidge: '#AEC6DC',
    snow: '#F3F7FB',
    midHill: '#93C68C',
    nearHill: '#7FBA74',
    ground: '#8ECC7C',
    groundShade: '#7CBE6B',
    canopy: '#579A62',
    canopyDark: '#417C4D',
    trunk: '#8A6B4F',
    cloud: '#FFFFFF',
    cloudOpacity: 0.9,
    bloom: '#FFF3B0',
  },
  afternoon: {
    skyTop: '#6FC3EE',
    skyMid: '#9FD9F4',
    skyBottom: '#D4EEFB',
    orb: '#FFDC57',
    orbGlow: '#FFF2AC',
    farRidge: '#9CC2DC',
    snow: '#FFFFFF',
    midHill: '#86C67E',
    nearHill: '#6FB663',
    ground: '#86CD74',
    groundShade: '#74C162',
    canopy: '#4C9459',
    canopyDark: '#387644',
    trunk: '#8A6B4F',
    cloud: '#FFFFFF',
    cloudOpacity: 0.95,
    bloom: '#FFF6C2',
  },
  evening: {
    skyTop: '#F58E72',
    skyMid: '#FFB68C',
    skyBottom: '#FFDCB4',
    orb: '#FF9350',
    orbGlow: '#FFC48C',
    farRidge: '#A88CB8',
    snow: '#F0DCE4',
    midHill: '#8C9E77',
    nearHill: '#778E66',
    ground: '#7E9A6A',
    groundShade: '#6C8859',
    canopy: '#486B4E',
    canopyDark: '#37553D',
    trunk: '#6E5540',
    cloud: '#FFC9AC',
    cloudOpacity: 0.75,
    bloom: '#FFD9A0',
  },
  night: {
    skyTop: '#16224C',
    skyMid: '#25326A',
    skyBottom: '#3B4C8C',
    orb: '#F4F1DC',
    orbGlow: '#9FB0E4',
    farRidge: '#2B3866',
    snow: '#C8D2F0',
    midHill: '#2C4656',
    nearHill: '#264050',
    ground: '#2B4A44',
    groundShade: '#23403B',
    canopy: '#1F3A33',
    canopyDark: '#152A25',
    trunk: '#3A2E26',
    cloud: '#44528E',
    cloudOpacity: 0.5,
    bloom: '#7E8ECB',
  },
};

// Stars only show at night; fixed positions so the sky doesn't shimmer
// between renders.
const STARS = [
  { x: 42, y: 36, r: 1.6 },
  { x: 88, y: 60, r: 1.1 },
  { x: 132, y: 28, r: 1.4 },
  { x: 186, y: 52, r: 1 },
  { x: 214, y: 22, r: 1.5 },
  { x: 268, y: 46, r: 1.2 },
  { x: 300, y: 96, r: 1 },
  { x: 356, y: 34, r: 1.3 },
  { x: 62, y: 96, r: 1 },
  { x: 156, y: 88, r: 1.2 },
];

function Cloud({ x, y, s, fill, opacity }: { x: number; y: number; s: number; fill: string; opacity: number }) {
  return (
    <G opacity={opacity}>
      <Ellipse cx={x} cy={y} rx={24 * s} ry={13 * s} fill={fill} />
      <Ellipse cx={x - 19 * s} cy={y + 5 * s} rx={15 * s} ry={9 * s} fill={fill} />
      <Ellipse cx={x + 20 * s} cy={y + 5 * s} rx={16 * s} ry={10 * s} fill={fill} />
      <Rect x={x - 33 * s} y={y + 4 * s} width={66 * s} height={11 * s} rx={5.5 * s} fill={fill} />
    </G>
  );
}

/** A soft, rounded canopy tree — reads friendlier than a sharp pine. */
function BlobTree({ x, y, s, p }: { x: number; y: number; s: number; p: Palette }) {
  return (
    <G>
      <Rect x={x - 2.4 * s} y={y - 13 * s} width={4.8 * s} height={14 * s} rx={2.2 * s} fill={p.trunk} />
      <Circle cx={x} cy={y - 24 * s} r={12 * s} fill={p.canopy} />
      <Circle cx={x - 9 * s} cy={y - 17 * s} r={9 * s} fill={p.canopy} />
      <Circle cx={x + 9 * s} cy={y - 17 * s} r={9.5 * s} fill={p.canopyDark} />
      <Circle cx={x + 2 * s} cy={y - 13 * s} r={8 * s} fill={p.canopy} />
    </G>
  );
}

/** A stacked-triangle pine, for variety in the tree line. */
function Pine({ x, y, s, p }: { x: number; y: number; s: number; p: Palette }) {
  return (
    <G>
      <Rect x={x - 2 * s} y={y - 10 * s} width={4 * s} height={11 * s} rx={1.8 * s} fill={p.trunk} />
      <Path d={`M ${x} ${y - 42 * s} L ${x + 12 * s} ${y - 22 * s} L ${x - 12 * s} ${y - 22 * s} Z`} fill={p.canopy} />
      <Path d={`M ${x} ${y - 32 * s} L ${x + 15 * s} ${y - 9 * s} L ${x - 15 * s} ${y - 9 * s} Z`} fill={p.canopyDark} />
    </G>
  );
}

function Bush({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
  return (
    <G>
      <Ellipse cx={x} cy={y} rx={13 * s} ry={9 * s} fill={fill} />
      <Ellipse cx={x - 9 * s} cy={y + 2 * s} rx={8 * s} ry={6 * s} fill={fill} />
      <Ellipse cx={x + 9 * s} cy={y + 2 * s} rx={8.5 * s} ry={6.5 * s} fill={fill} />
    </G>
  );
}

function Bloom({ x, y, fill }: { x: number; y: number; fill: string }) {
  return (
    <G>
      <Circle cx={x} cy={y} r={2.6} fill={fill} />
      <Circle cx={x - 3.4} cy={y + 1.6} r={2} fill={fill} />
      <Circle cx={x + 3.4} cy={y + 1.6} r={2} fill={fill} />
    </G>
  );
}

interface SceneBackdropProps {
  timeOfDay: TimeOfDay;
}

/**
 * A layered outdoor scene drawn as vectors: sky, sun/moon, clouds, a distant
 * snow-capped ridge, rolling hills, a tree line and a grassy foreground the
 * pet can stand on. Replaces the earlier flat-gradient-plus-emoji backdrop.
 */
export default function SceneBackdrop({ timeOfDay }: SceneBackdropProps) {
  const p = palettes[timeOfDay];
  const isNight = timeOfDay === 'night';
  // Gradient ids live in the document on web, so two scenes on screen at
  // once would otherwise share (and fight over) the same definitions.
  const uid = useId().replace(/:/g, '');
  const skyId = `sky-${uid}`;
  const glowId = `glow-${uid}`;

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <LinearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={p.skyTop} />
          <Stop offset="0.55" stopColor={p.skyMid} />
          <Stop offset="1" stopColor={p.skyBottom} />
        </LinearGradient>
        <RadialGradient id={glowId} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor={p.orbGlow} stopOpacity="0.85" />
          <Stop offset="1" stopColor={p.orbGlow} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Sky */}
      <Rect x="0" y="0" width="400" height="300" fill={`url(#${skyId})`} />

      {/* Stars */}
      {isNight &&
        STARS.map((s, i) => (
          <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" opacity={0.85} />
        ))}

      {/* Sun / moon with a soft halo */}
      <Circle cx="322" cy="64" r="52" fill={`url(#${glowId})`} />
      <Circle cx="322" cy="64" r="23" fill={p.orb} />
      {isNight && <Circle cx="331" cy="57" r="19" fill={p.skyTop} opacity={0.92} />}

      {/* Clouds */}
      <Cloud x={86} y={52} s={1} fill={p.cloud} opacity={p.cloudOpacity} />
      <Cloud x={248} y={34} s={0.68} fill={p.cloud} opacity={p.cloudOpacity * 0.85} />
      <Cloud x={172} y={92} s={0.5} fill={p.cloud} opacity={p.cloudOpacity * 0.6} />

      {/* Distant ridge */}
      <Path
        d="M -10 190 L 48 126 L 86 158 L 140 108 L 196 168 L 244 130 L 296 176 L 352 138 L 410 182 L 410 230 L -10 230 Z"
        fill={p.farRidge}
      />
      {/* Snow caps */}
      <Path d="M 140 108 L 156 126 L 148 124 L 140 130 L 132 124 L 124 126 Z" fill={p.snow} />
      <Path d="M 48 126 L 60 140 L 54 138 L 48 143 L 42 138 L 36 140 Z" fill={p.snow} />
      <Path d="M 352 138 L 364 152 L 358 150 L 352 155 L 346 150 L 340 152 Z" fill={p.snow} />

      {/* Rolling hills */}
      <Path
        d="M -10 196 C 54 172, 116 200, 178 184 C 238 168, 300 196, 410 176 L 410 300 L -10 300 Z"
        fill={p.midHill}
      />

      {/* Tree line along the hill */}
      <G>
        <Pine x={34} y={196} s={0.82} p={p} />
        <BlobTree x={70} y={200} s={0.9} p={p} />
        <Pine x={104} y={198} s={0.62} p={p} />
        <BlobTree x={210} y={190} s={0.72} p={p} />
        <Pine x={244} y={186} s={0.78} p={p} />
        <BlobTree x={286} y={192} s={0.86} p={p} />
        <Pine x={330} y={188} s={0.6} p={p} />
        <BlobTree x={372} y={184} s={0.7} p={p} />
      </G>

      {/* Near hill band */}
      <Path
        d="M -10 222 C 70 206, 150 228, 226 216 C 296 205, 356 222, 410 210 L 410 300 L -10 300 Z"
        fill={p.nearHill}
      />

      {/* Grassy foreground the pet stands on */}
      <Path
        d="M -10 250 C 86 238, 168 256, 250 246 C 314 238, 362 250, 410 242 L 410 300 L -10 300 Z"
        fill={p.ground}
      />
      <Path
        d="M -10 274 C 92 266, 190 280, 286 272 C 340 267, 380 274, 410 270 L 410 300 L -10 300 Z"
        fill={p.groundShade}
      />

      {/* Foreground details */}
      <Bush x={36} y={262} s={1} fill={p.canopyDark} />
      <Bush x={368} y={256} s={0.85} fill={p.canopyDark} />
      <Bloom x={96} y={264} fill={p.bloom} />
      <Bloom x={128} y={276} fill={p.bloom} />
      <Bloom x={300} y={266} fill={p.bloom} />
      <Bloom x={338} y={280} fill={p.bloom} />
    </Svg>
  );
}
