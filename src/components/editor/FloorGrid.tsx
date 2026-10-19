import { Grid, Line } from '@react-three/drei'
import { FLOOR } from '../../lib/grid'

const HALF_W = FLOOR.width / 2
const HALF_D = FLOOR.depth / 2

export function FloorGrid() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[FLOOR.width, FLOOR.depth]} />
        <meshStandardMaterial color="#18181b" roughness={1} />
      </mesh>
      <Grid
        args={[FLOOR.width, FLOOR.depth]}
        cellSize={FLOOR.cell}
        cellThickness={0.6}
        cellColor="#3f3f46"
        sectionSize={2}
        sectionColor="#52525b"
        sectionThickness={1}
        fadeDistance={90}
        fadeStrength={1.5}
        infiniteGrid={false}
        position-y={0.01}
      />
      <Line
        points={[
          [-HALF_W, 0, -HALF_D],
          [HALF_W, 0, -HALF_D],
          [HALF_W, 0, HALF_D],
          [-HALF_W, 0, HALF_D],
          [-HALF_W, 0, -HALF_D],
        ]}
        color="#71717a"
        lineWidth={2}
        position-y={0.02}
      />
    </group>
  )
}
