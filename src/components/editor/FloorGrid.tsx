import { Grid, Line } from '@react-three/drei'
import { FLOOR } from '../../lib/grid'

const HALF_W = FLOOR.width / 2
const HALF_D = FLOOR.depth / 2

export function FloorGrid() {
  return (
    <group>
      {/* Surrounding ground: keeps the measured floor sitting inside a scene
          rather than floating in the canvas background. */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.03}>
        <planeGeometry args={[FLOOR.width + 14, FLOOR.depth + 14]} />
        <meshStandardMaterial color="#0a0d14" roughness={1} metalness={0} />
      </mesh>

      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[FLOOR.width, FLOOR.depth]} />
        <meshStandardMaterial color="#11161f" roughness={0.96} metalness={0.02} />
      </mesh>

      <Grid
        args={[FLOOR.width, FLOOR.depth]}
        cellSize={FLOOR.cell}
        cellThickness={0.45}
        cellColor="#2a3240"
        sectionSize={2}
        sectionColor="#3b4658"
        sectionThickness={0.9}
        fadeDistance={70}
        fadeStrength={1.2}
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
        color="#4a5668"
        lineWidth={1.5}
        position-y={0.02}
      />
    </group>
  )
}
