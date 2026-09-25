import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';

interface PawPatternProps {
  /** Tint of the paw prints; keep low-contrast against the background. */
  color?: string;
}

// Fixed, hand-placed positions (as % of container) with varied size/rotation —
// a scattered ambient texture, like the paw-print motif on Catzy's onboarding
// screens. Deterministic (no Math.random) so it doesn't shift on re-render.
const PAWS = [
  { top: '6%', left: '10%', size: 24, rotate: '-15deg' },
  { top: '10%', left: '78%', size: 18, rotate: '20deg' },
  { top: '28%', left: '4%', size: 16, rotate: '10deg' },
  { top: '34%', left: '88%', size: 20, rotate: '-25deg' },
  { top: '52%', left: '14%', size: 18, rotate: '5deg' },
  { top: '58%', left: '82%', size: 22, rotate: '-10deg' },
  { top: '76%', left: '8%', size: 16, rotate: '18deg' },
  { top: '80%', left: '72%', size: 18, rotate: '-8deg' },
] as const;

function PawIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Ellipse cx="50" cy="66" rx="26" ry="22" fill={color} />
      <Ellipse cx="20" cy="38" rx="12" ry="15" fill={color} />
      <Ellipse cx="44" cy="20" rx="12" ry="15" fill={color} />
      <Ellipse cx="68" cy="22" rx="11" ry="14" fill={color} />
      <Ellipse cx="86" cy="42" rx="10" ry="13" fill={color} />
    </Svg>
  );
}

export default function PawPattern({ color = 'rgba(255,255,255,0.16)' }: PawPatternProps) {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {PAWS.map((p, i) => (
        <View
          key={i}
          style={[
            styles.paw,
            { top: p.top, left: p.left, transform: [{ rotate: p.rotate }] },
          ]}
        >
          <PawIcon size={p.size} color={color} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  paw: {
    position: 'absolute',
  },
});
