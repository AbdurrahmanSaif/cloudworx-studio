import type { ThreeEvent } from '@react-three/fiber'
import { BoxGeometry, CylinderGeometry, MathUtils } from 'three'
import type { BufferGeometry } from 'three'
import { EQUIPMENT } from '../../lib/catalog'
import type { ItemType, LayoutItem } from '../../types'
import { editorStore } from '../../store/editorStore'

function createGeometry(type: ItemType): BufferGeometry {
  const { footprint, height } = EQUIPMENT[type]
  return type === 'motor'
    ? new CylinderGeometry(footprint.width / 2, footprint.width / 2, height, 24)
    : new BoxGeometry(footprint.width, height, footprint.depth)
}

/** Shared geometries: one per equipment type, reused by every placed item. */
const GEOMETRIES: Record<ItemType, BufferGeometry> = {
  cabinet: createGeometry('cabinet'),
  motor: createGeometry('motor'),
  conveyor: createGeometry('conveyor'),
}

interface EquipmentItemProps {
  item: LayoutItem
  selected: boolean
}

export function EquipmentItem({ item, selected }: EquipmentItemProps) {
  const def = EQUIPMENT[item.type]
  const ringRadius =
    Math.max(def.footprint.width, def.footprint.depth) / 2 + 0.2

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    const s = editorStore.getState()
    if (s.transformId !== null) {
      e.stopPropagation()
      return
    }
    if (s.placingType !== null) {
      // Placement click: fall through so the floor plane handles it.
      return
    }
    e.stopPropagation()
    s.select(item.id)
    s.beginTransform(item.id)
  }

  return (
    <group position={[item.position.x, 0, item.position.z]}>
      <mesh
        geometry={GEOMETRIES[item.type]}
        position={[0, def.height / 2, 0]}
        rotation={[0, MathUtils.degToRad(item.rotation), 0]}
        onPointerDown={handlePointerDown}
      >
        <meshStandardMaterial
          color={selected ? '#fbbf24' : def.color}
          emissive={selected ? '#f59e0b' : '#000000'}
          emissiveIntensity={selected ? 0.5 : 0}
          roughness={0.6}
          metalness={0.15}
        />
      </mesh>
      {selected && (
        <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
          <ringGeometry args={[ringRadius - 0.08, ringRadius, 48]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      )}
    </group>
  )
}
