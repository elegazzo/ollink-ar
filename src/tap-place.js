export const tapPlaceComponent = {
  schema: {
    min: {default: 1},
    max: {default: 2},
  },

  init() {
    const ground = document.getElementById('ground')
    const addModelBtn = document.getElementById('addModelBtn')
    const urlParams = new URLSearchParams(window.location.search)

    this.mode = urlParams.get('mode') || 'create'

    this.presetLat = 19.39752
    this.presetLng = -99.4667

    this.prompt = document.getElementById('promptText')
    this.canPlaceModel = true
    this.nodeCount =  1
    this.userLocation = null

    const THREE = AFRAME.THREE

    navigator.geolocation.getCurrentPosition((position) => {
      this.userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }
      console.log('Ubicación:', this.userLocation)
    })

    this.envMap = new THREE.CubeTextureLoader()
      .setPath('./assets/env/')
      .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'])

    addModelBtn.addEventListener('click', () => {
      this.canPlaceModel = true
    })

    if (!AFRAME.components['face-camera']) {
      AFRAME.registerComponent('face-camera', {
        tick() {
          const camera = document.getElementById('camera')
          if (!camera) return

          this.el.object3D.lookAt(camera.object3D.position)
        },
      })
    }    

    ground.addEventListener('click', (event) => {
      if (!this.canPlaceModel) return
      this.prompt.style.cssText =
        'font-size:16px !important; display:block !important; position:static !important; transform:none !important; margin-top:6px;'

      this.prompt.innerHTML =
        '👆👆 Doble tap sobre un nudo para abrir su memoria.'
            this.canPlaceModel = false
      let nodeId

      if (this.mode === 'preset') {
        nodeId = 1
      } else {
        this.nodeCount += 1
        nodeId = this.nodeCount
      }

      const touchPoint = event.detail.intersection.point

      
      const nodeLabel = this.userLocation
        ? `Lat: ${this.userLocation.lat.toFixed(5)}\nLng: ${this.userLocation.lng.toFixed(5)}`
        : 'Ubicación no disponible'

      const nodeEntity = document.createElement('a-entity')
      nodeEntity.setAttribute('position', `${touchPoint.x} ${touchPoint.y} ${touchPoint.z}`)

      const newElement = document.createElement('a-torus-knot')
      newElement.classList.add('cantap')

      let lastTapTime = 0

      const knotRadius = 5
      const knotTube = 0.8
      const knotHeight = 1.0
      const labelHeight = knotHeight + knotRadius + 3

      newElement.setAttribute('data-node-id', nodeId)
      newElement.setAttribute('data-node-label', nodeLabel)


      newElement.setAttribute('position', `0 ${knotHeight} 0`)
      newElement.setAttribute('radius', knotRadius)
      newElement.setAttribute('radius-tubular', knotTube)

      newElement.setAttribute('p', '1')
      newElement.setAttribute('q', '3')
      newElement.setAttribute('animation','property: rotation; to: 0 360 0; loop: true; dur: 6000')
      newElement.setAttribute('material','color: #ffffff; metalness: 1; roughness: 0.02')



      const label = document.createElement('a-text')
      label.setAttribute('value', nodeLabel)
      label.setAttribute('align', 'center')
      label.setAttribute('position', `0 ${labelHeight} 0`)
      label.setAttribute('scale', '3 3 3')
      label.setAttribute('width', '10')
      label.setAttribute('color', '#ffffff')
      label.setAttribute('visible', 'true')
      label.setAttribute('face-camera', '')

      newElement.addEventListener('loaded', () => {
        const mesh = newElement.getObject3D('mesh')
        if (!mesh) return

        mesh.material.envMap = this.envMap
        mesh.material.metalness = 1
        mesh.material.roughness = 0.02
        mesh.material.needsUpdate = true
      })

      newElement.addEventListener('click', (event) => {
        event.stopPropagation()

        const currentTime = Date.now()

        if (currentTime - lastTapTime < 350) {
        const finalLat =
          this.mode === 'preset'
            ? this.presetLat
            : this.userLocation
              ? this.userLocation.lat
              : ''

        const finalLng =
          this.mode === 'preset'
            ? this.presetLng
            : this.userLocation
              ? this.userLocation.lng
              : ''

        window.location.href = `./texto.html?node=${nodeId}&lat=${finalLat}&lng=${finalLng}`
        } else {
          label.setAttribute('visible', 'true')
        }

        lastTapTime = currentTime
      })

      nodeEntity.appendChild(newElement)
      nodeEntity.appendChild(label)
      this.el.sceneEl.appendChild(nodeEntity)
    })
  },
}