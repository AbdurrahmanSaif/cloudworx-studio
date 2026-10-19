import { OrbitControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import { Plane, Raycaster, Vector2, Vector3 } from 'three'
import { FLOOR } from '../../lib/grid'
import { collectViolationIds, findProximityViolations } from '../../lib/rules'
import {
  editorStore,
  selectItems,
  selectSelectedId,
  useEditorStore,
} from '../../store/editorStore'
import { EquipmentItem } from './EquipmentItem'
import { FloorGrid } from './FloorGrid'

/** Invisible floor-sized plane: placement clicks and deselection. */
function InteractionPlane() {
  return (
    <mesh
      rotation-x={-Math.PI / 2}
      position-y={-0.01}
      onPointerDown={(e) => {
        e.stopPropagation()
        const s = editorStore.getState()
        if (s.transformId !== null) return
        if (s.placingType !== null) {
          s.addItem(s.placingType, { x: e.point.x, z: e.point.z })
          return
        }
        s.select(null)
      }}
    >
      <planeGeometry args={[FLOOR.width, FLOOR.depth]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

function ItemsLayer() {
  const items = useEditorStore(selectItems)
  const selectedId = useEditorStore(selectSelectedId)
  const violatedIds = useMemo(
    () => collectViolationIds(findProximityViolations(items)),
    [items],
  )
  return (
    <>
      {items.map((item) => (
        <EquipmentItem
          key={item.id}
          item={item}
          selected={item.id === selectedId}
          violated={violatedIds.has(item.id)}
        />
      ))}
    </>
  )
}

/**
 * Window-level drag controller: while a transform runs, pointer moves are
 * ray-cast onto the y=0 plane (independently of R3F hit targets) and the
 * store receives snapped previews; pointerup ends the transform anywhere.
 * Movement freezes when the pointer leaves the viewport.
 */
function DragController() {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    const groundPlane = new Plane(new Vector3(0, 1, 0), 0)
    const raycaster = new Raycaster()
    const ndc = new Vector2()
    const point = new Vector3()

    const handleMove = (e: PointerEvent) => {
      const s = editorStore.getState()
      if (s.transformId === null) return
      const rect = gl.domElement.getBoundingClientRect()
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      if (!inside) return
      ndc.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(ndc, camera)
      if (raycaster.ray.intersectPlane(groundPlane, point)) {
        s.previewItemPosition(s.transformId, { x: point.x, z: point.z })
      }
    }

    const handleUp = () => {
      editorStore.getState().endTransform()
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [camera, gl])

  return null
}

export function Scene() {
  const transformId = useEditorStore((s) => s.transformId)

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [15, 13, 17], fov: 45, near: 0.1, far: 300 }}
      onPointerMissed={() => {
        const s = editorStore.getState()
        if (s.placingType === null) s.select(null)
      }}
    >
      <color attach="background" args={['#09090b']} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[15, 25, 10]} intensity={1.2} />
      <FloorGrid />
      <InteractionPlane />
      <ItemsLayer />
      <DragController />
      <OrbitControls
        makeDefault
        enabled={transformId === null}
        enableDamping={false}
        target={[0, 0, 0]}
        minDistance={4}
        maxDistance={80}
        maxPolarAngle={Math.PI / 2 - 0.02}
      />
    </Canvas>
  )
}
