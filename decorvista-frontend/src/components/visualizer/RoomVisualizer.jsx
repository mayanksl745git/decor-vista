import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'

const furnitureDefinitions = {
  Sofa: { size: [2.4, 0.9, 0.9], color: 0xb77959 },
  Armchair: { size: [1, 0.9, 0.9], color: 0xaa6f73 },
  Chair: { size: [0.6, 0.9, 0.6], color: 0x8b6f47 },
  'Single Bed': { size: [1.2, 0.7, 2], color: 0xd1c4b2 },
  'Double Bed': { size: [1.8, 0.7, 2.1], color: 0xc9b79c },
  Wardrobe: { size: [1.4, 2.2, 0.6], color: 0x6b4f3a },
  Bookshelf: { size: [1.2, 2, 0.45], color: 0x795548 },
  Cabinet: { size: [1.2, 1, 0.5], color: 0x99795d },
  'Dining Table': { size: [1.8, 0.78, 1], color: 0x8d6748 },
  'Coffee Table': { size: [1.1, 0.45, 0.6], color: 0x916b4a },
  'Study Table': { size: [1.4, 0.78, 0.7], color: 0x7a593f },
  'Side Table': { size: [0.5, 0.6, 0.5], color: 0xa17d5d },
  'Indoor Plant': { size: [0.5, 1.2, 0.5], color: 0x4f8a5b },
  'Floor Lamp': { size: [0.35, 1.8, 0.35], color: 0xd9c58c },
  'TV Unit': { size: [1.8, 0.75, 0.45], color: 0x58453b },
}

const floorMaterials = {
  Wood: 0xe0c5a1,
  Marble: 0xe7e5e4,
  Tiles: 0xd6dbdf,
  Carpet: 0xcab0d8,
}

const wallDepth = 0.18
const wallHeight = 3.2

const RoomVisualizer = forwardRef(function RoomVisualizer(
  { roomWidth, roomLength, wallColor, floorType, viewMode },
  ref,
) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const frameRef = useRef(null)
  const floorRef = useRef(null)
  const wallRefs = useRef([])
  const furnitureRef = useRef([])
  const furnitureMetaRef = useRef([])

  useEffect(() => {
    const mountElement = mountRef.current

    if (!mountElement) {
      return undefined
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf4f4f5)

    const camera = new THREE.PerspectiveCamera(
      60,
      mountElement.clientWidth / Math.max(mountElement.clientHeight, 1),
      0.1,
      1000,
    )

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(mountElement.clientWidth, mountElement.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mountElement.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(8, 16, 10)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 1024
    directionalLight.shadow.mapSize.height = 1024

    const fillLight = new THREE.PointLight(0xfff4dc, 0.6)
    fillLight.position.set(-8, 6, -6)

    scene.add(ambientLight, directionalLight, fillLight)

    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer

    const animate = () => {
      frameRef.current = window.requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }

    const handleResize = () => {
      const width = mountElement.clientWidth
      const height = Math.max(mountElement.clientHeight, 1)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.cancelAnimationFrame(frameRef.current)
      furnitureRef.current.forEach((mesh) => {
        mesh.geometry.dispose()
        mesh.material.dispose()
      })
      wallRefs.current.forEach((wall) => {
        wall.geometry.dispose()
        wall.material.dispose()
      })
      if (floorRef.current) {
        floorRef.current.geometry.dispose()
        floorRef.current.material.dispose()
      }
      renderer.dispose()
      if (mountElement.contains(renderer.domElement)) {
        mountElement.removeChild(renderer.domElement)
      }
    }
  }, [])

  useEffect(() => {
    if (!sceneRef.current) {
      return
    }

    if (floorRef.current) {
      sceneRef.current.remove(floorRef.current)
      floorRef.current.geometry.dispose()
      floorRef.current.material.dispose()
    }

    wallRefs.current.forEach((wall) => {
      sceneRef.current.remove(wall)
      wall.geometry.dispose()
      wall.material.dispose()
    })

    const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomLength)
    const floorMaterial = new THREE.MeshLambertMaterial({ color: floorMaterials[floorType] ?? floorMaterials.Wood })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true

    const wallMaterial = new THREE.MeshLambertMaterial({ color: wallColor })
    const northWall = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, wallHeight, wallDepth), wallMaterial.clone())
    const southWall = new THREE.Mesh(new THREE.BoxGeometry(roomWidth, wallHeight, wallDepth), wallMaterial.clone())
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(wallDepth, wallHeight, roomLength), wallMaterial.clone())
    const westWall = new THREE.Mesh(new THREE.BoxGeometry(wallDepth, wallHeight, roomLength), wallMaterial.clone())

    northWall.position.set(0, wallHeight / 2, -roomLength / 2)
    southWall.position.set(0, wallHeight / 2, roomLength / 2)
    eastWall.position.set(roomWidth / 2, wallHeight / 2, 0)
    westWall.position.set(-roomWidth / 2, wallHeight / 2, 0)

    floorRef.current = floor
    wallRefs.current = [northWall, southWall, eastWall, westWall]

    sceneRef.current.add(floor, northWall, southWall, eastWall, westWall)

    furnitureRef.current.forEach((mesh, index) => {
      const meta = furnitureMetaRef.current[index]
      mesh.position.x = Math.min(Math.max(mesh.position.x, -roomWidth / 2 + 0.8), roomWidth / 2 - 0.8)
      mesh.position.z = Math.min(Math.max(mesh.position.z, -roomLength / 2 + 0.8), roomLength / 2 - 0.8)
      furnitureMetaRef.current[index] = { ...meta, position: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z } }
    })
  }, [floorType, roomLength, roomWidth, wallColor])

  useEffect(() => {
    if (!cameraRef.current) {
      return
    }

    if (viewMode === 'top') {
      cameraRef.current.position.set(0, Math.max(roomWidth, roomLength) + 2, 0.01)
      cameraRef.current.lookAt(0, 0, 0)
      return
    }

    cameraRef.current.position.set(roomWidth * 0.55, Math.max(roomWidth, roomLength) * 0.8, roomLength * 0.8)
    cameraRef.current.lookAt(0, 0, 0)
  }, [roomLength, roomWidth, viewMode])

  useImperativeHandle(
    ref,
    () => ({
      addFurniture: (type) => {
        if (!sceneRef.current) {
          return
        }

        const definition = furnitureDefinitions[type] ?? { size: [1, 1, 1], color: 0x8b4513 }
        const geometry = new THREE.BoxGeometry(...definition.size)
        const material = new THREE.MeshLambertMaterial({ color: definition.color })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.castShadow = true
        mesh.receiveShadow = true
        mesh.position.set(
          Math.random() * (roomWidth - 2) - (roomWidth - 2) / 2,
          definition.size[1] / 2,
          Math.random() * (roomLength - 2) - (roomLength - 2) / 2,
        )
        sceneRef.current.add(mesh)
        furnitureRef.current.push(mesh)
        furnitureMetaRef.current.push({
          id: mesh.uuid,
          type,
          position: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
          size: definition.size,
        })
      },
      resetScene: () => {
        furnitureRef.current.forEach((mesh) => {
          sceneRef.current?.remove(mesh)
          mesh.geometry.dispose()
          mesh.material.dispose()
        })
        furnitureRef.current = []
        furnitureMetaRef.current = []
      },
      getLayoutData: () =>
        furnitureMetaRef.current.map((item, index) => ({
          ...item,
          position: {
            x: furnitureRef.current[index]?.position.x ?? item.position.x,
            y: furnitureRef.current[index]?.position.y ?? item.position.y,
            z: furnitureRef.current[index]?.position.z ?? item.position.z,
          },
        })),
      takeScreenshot: () => rendererRef.current?.domElement.toDataURL('image/png') ?? '',
    }),
    [roomLength, roomWidth],
  )

  return <div ref={mountRef} className="h-full w-full" />
})

export default RoomVisualizer
