import { Controller } from "@hotwired/stimulus"
import { createConsumer } from "@rails/actioncable"
import * as THREE from "three"

export default class extends Controller {
  static targets = ["canvas", "count", "locations", "status", "updated"]
  static values = { endpoint: String, cableUrl: String }

  connect() {
    this.visitors = new Map()
    this.rotation = { x: -0.14, y: 0.36 }
    this.velocity = { x: 0, y: 0.0013 }
    this.pointer = null
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    this.countryNames = new Intl.DisplayNames([document.documentElement.lang || "en"], { type: "region" })

    this.setupScene()
    this.bindInteraction()
    this.load()
    this.subscribe()
    this.poller = window.setInterval(() => this.load(), 15_000)
    this.animate()
  }

  disconnect() {
    window.clearInterval(this.poller)
    cancelAnimationFrame(this.frame)
    this.resizeObserver?.disconnect()
    this.subscription?.unsubscribe()
    this.consumer?.disconnect()
    this.canvasTarget.removeEventListener("pointerdown", this.onPointerDown)
    window.removeEventListener("pointermove", this.onPointerMove)
    window.removeEventListener("pointerup", this.onPointerUp)
    this.canvasTarget.removeEventListener("wheel", this.onWheel)
    this.renderer?.dispose()
    this.globeGeometry?.dispose()
    this.globeMaterial?.dispose()
  }

  setupScene() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
    this.camera.position.set(0, 0, 7)

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasTarget, alpha: true, antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace

    this.globe = new THREE.Group()
    this.scene.add(this.globe)

    const positions = []
    const pointCount = 5200
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    for (let index = 0; index < pointCount; index += 1) {
      const y = 1 - (index / (pointCount - 1)) * 2
      const radius = Math.sqrt(1 - y * y)
      const theta = goldenAngle * index
      positions.push(Math.cos(theta) * radius * 2.3, y * 2.3, Math.sin(theta) * radius * 2.3)
    }

    this.globeGeometry = new THREE.BufferGeometry()
    this.globeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    this.globeMaterial = new THREE.PointsMaterial({ color: 0x77736d, size: 0.018, transparent: true, opacity: 0.58, sizeAttenuation: true })
    this.globe.add(new THREE.Points(this.globeGeometry, this.globeMaterial))

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(2.31, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0xe85945, transparent: true, opacity: 0.025, side: THREE.BackSide })
    )
    this.globe.add(halo)

    this.markerLayer = new THREE.Group()
    this.globe.add(this.markerLayer)
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(this.canvasTarget.parentElement)
    this.resize()
  }

  bindInteraction() {
    this.onPointerDown = (event) => {
      this.pointer = { x: event.clientX, y: event.clientY }
      this.canvasTarget.setPointerCapture?.(event.pointerId)
      this.canvasTarget.classList.add("is-grabbing")
    }
    this.onPointerMove = (event) => {
      if (!this.pointer) return
      const dx = event.clientX - this.pointer.x
      const dy = event.clientY - this.pointer.y
      this.rotation.y += dx * 0.006
      this.rotation.x = THREE.MathUtils.clamp(this.rotation.x + dy * 0.004, -1.15, 1.15)
      this.velocity = { x: dy * 0.00018, y: dx * 0.00024 }
      this.pointer = { x: event.clientX, y: event.clientY }
      if (this.reducedMotion) this.render()
    }
    this.onPointerUp = () => {
      this.pointer = null
      this.canvasTarget.classList.remove("is-grabbing")
    }
    this.onWheel = (event) => {
      event.preventDefault()
      this.camera.position.z = THREE.MathUtils.clamp(this.camera.position.z + event.deltaY * 0.004, 5.2, 9)
      if (this.reducedMotion) this.render()
    }

    this.canvasTarget.addEventListener("pointerdown", this.onPointerDown)
    window.addEventListener("pointermove", this.onPointerMove)
    window.addEventListener("pointerup", this.onPointerUp)
    this.canvasTarget.addEventListener("wheel", this.onWheel, { passive: false })
  }

  async load() {
    try {
      const response = await fetch(this.endpointValue, { headers: { Accept: "application/json" } })
      if (!response.ok) throw new Error(`Presence request returned ${response.status}`)
      const payload = await response.json()
      this.applyPayload(payload.visitors || [], payload.active_count || 0, payload.generated_at)
      this.statusTarget.textContent = "Live"
      this.statusTarget.dataset.state = "live"
    } catch (_error) {
      this.statusTarget.textContent = "Reconnecting"
      this.statusTarget.dataset.state = "waiting"
    }
  }

  subscribe() {
    this.consumer = createConsumer(this.cableUrlValue || "/cable")
    this.subscription = this.consumer.subscriptions.create(
      { channel: "Spree::Admin::LiveVisitorsChannel" },
      { received: (message) => this.receive(message) }
    )
  }

  receive(message) {
    if (message.type !== "presence" || !message.visitor) return
    this.visitors.set(message.visitor.id, message.visitor)
    this.renderVisitors(message.active_count)
  }

  applyPayload(visitors, count, generatedAt) {
    this.visitors = new Map(visitors.map((visitor) => [visitor.id, visitor]))
    this.renderVisitors(count)
    if (generatedAt) this.updatedTarget.textContent = new Date(generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  renderVisitors(count) {
    this.countTarget.textContent = String(count)
    this.markerLayer.children.forEach((child) => {
      child.geometry?.dispose()
      child.material?.dispose()
    })
    this.markerLayer.clear()

    const visitors = [...this.visitors.values()]
    const located = visitors.filter((visitor) => Number.isFinite(visitor.latitude) && Number.isFinite(visitor.longitude))
    located.slice(0, 120).forEach((visitor, index) => this.addMarker(visitor, index))
    this.renderLocations(visitors)
    if (this.reducedMotion) this.render()
  }

  addMarker(visitor, index) {
    const position = this.latLngToVector(visitor.latitude, visitor.longitude, 2.34)
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xe21b24 })
    )
    marker.position.copy(position)
    marker.userData.phase = index * 0.55
    this.markerLayer.add(marker)

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.05, 0.065, 24),
      new THREE.MeshBasicMaterial({ color: 0xe21b24, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false })
    )
    ring.position.copy(position)
    ring.lookAt(position.clone().multiplyScalar(2))
    ring.userData.phase = index * 0.55
    ring.userData.pulse = true
    this.markerLayer.add(ring)
  }

  renderLocations(visitors) {
    const grouped = new Map()
    visitors.forEach((visitor) => {
      const key = `${visitor.city}|${visitor.country}`
      const entry = grouped.get(key) || { city: visitor.city, country: visitor.country, count: 0, path: visitor.path }
      entry.count += 1
      grouped.set(key, entry)
    })

    const rows = [...grouped.values()].sort((a, b) => b.count - a.count).slice(0, 6)
    this.locationsTarget.replaceChildren(...rows.map((row) => {
      const item = document.createElement("li")
      const country = row.country === "UN" ? "Unknown region" : this.countryNames.of(row.country)
      item.innerHTML = `<span><i></i><strong>${this.escape(row.city)}</strong><small>${this.escape(country || row.country)} · ${this.escape(row.path || "/")}</small></span><b>${row.count}</b>`
      return item
    }))

    if (rows.length === 0) {
      const empty = document.createElement("li")
      empty.className = "is-empty"
      empty.textContent = "Waiting for active storefront sessions"
      this.locationsTarget.append(empty)
    }
  }

  latLngToVector(latitude, longitude, radius) {
    const phi = (90 - latitude) * (Math.PI / 180)
    const theta = (longitude + 180) * (Math.PI / 180)
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    )
  }

  resize() {
    const parent = this.canvasTarget.parentElement
    const width = Math.max(parent.clientWidth, 300)
    const height = Math.max(parent.clientHeight, 360)
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.render()
  }

  animate = (time = 0) => {
    if (!this.pointer && !this.reducedMotion) {
      this.rotation.x += this.velocity.x
      this.rotation.y += this.velocity.y
      this.velocity.x *= 0.965
      this.velocity.y = this.velocity.y * 0.965 + 0.0011 * 0.035
    }
    this.globe.rotation.set(this.rotation.x, this.rotation.y, 0)
    if (!this.reducedMotion) {
      this.markerLayer.children.forEach((child) => {
        if (!child.userData.pulse) return
        const pulse = ((time * 0.001 + child.userData.phase) % 1.8) / 1.8
        child.scale.setScalar(1 + pulse * 2.8)
        child.material.opacity = 0.55 * (1 - pulse)
      })
    }
    this.render()
    if (!this.reducedMotion) this.frame = requestAnimationFrame(this.animate)
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }

  escape(value) {
    const node = document.createElement("span")
    node.textContent = String(value)
    return node.innerHTML
  }
}
