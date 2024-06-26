import {
  ScreenSpaceEventHandler,
  Viewer,
  ImageryLayer,
  CameraFlyTo,
  ScreenSpaceEvent,
  CesiumComponentRef,
} from 'resium'
import chroma, { limits } from 'chroma-js'
import * as turf from '@turf/turf'

import {
  Ion,
  Rectangle,
  ScreenSpaceEventType,
  WebMapServiceImageryProvider,
  Viewer as CesiumViewer,
  createWorldTerrainAsync,
} from 'cesium'
import './styles.css'
import { ResiumContainer } from './styles'
import React, { useEffect, useRef, useMemo, useState } from 'react'
import { InfoBox } from '../InfoBox'
import * as Cesium from 'cesium'
import { GetGeoblazeValue3D } from '../MapHome/getGeoblazeValue'
import { Loading } from '../Loading'
import { GetPhotoMarker } from '../MapHome/addPhotoMarker'
import { GetTifLayer2, GetTileLayer } from '../MapHome/addGeoraster'
import { yearMonths } from '../../data/yearMonths'

Ion.defaultAccessToken = process.env.VITE_CESIUM_TOKEN

interface DisplayPositionProps {
  position: any
  depth: any
}

function DisplayPosition({ position, depth }: DisplayPositionProps) {
  return <InfoBox position={position} depth={depth} />
}
interface keyable {
  [key: string]: any
}

interface ThreeDMapProps {
  selectedLayers: keyable
  actualLayer: string[]
  layerAction: String
  setLayerAction: any
  listLayers: any
  threeD: any
  actualDate: any
}
function ThreeDMap1({
  selectedLayers,
  actualLayer,
  layerAction,
  setLayerAction,
  listLayers,
  threeD,
  actualDate,
}: ThreeDMapProps) {
  const colorScale = chroma
    .scale(['#f00', '#0f0', '#00f', 'gray'])
    .mode('hsl')
    .colors(30)

  const JOSBaseUrl = process.env.VITE_JASMIN_OBJECT_STORE_URL
  const rout = window.location.pathname

  const [position, setPosition] = useState(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [depth, setDepth] = useState({})
  const ref = useRef<CesiumComponentRef<CesiumViewer>>(null)

  const defaultWMSBounds = [
    [34.5, -14],
    [42.5, -6],
  ]

  const defaultOpacity = 0.7

  const batOrder = ['Shipborne', 'Emodnet', 'Gebco']

  const [cogLayer, setCogLayer] = useState('')

  const url = `${JOSBaseUrl}haig-fras/frontend/images/bathymetry.tif`

  const batLayer = useMemo(() => getGeorasterLayer(), [url])

  const startCoordinates = Rectangle.fromDegrees(
    defaultWMSBounds[0][1],
    defaultWMSBounds[0][0],
    defaultWMSBounds[1][1],
    defaultWMSBounds[1][0],
  )

  Cesium.Camera.DEFAULT_VIEW_RECTANGLE = startCoordinates

  const jnccMCZ = new WebMapServiceImageryProvider({
    url: 'https://webgeo2.hidrografico.pt/geoserver/ows?',
    parameters: {
      service: 'wms',
      request: 'GetMap',
      version: '1.1.1',
      format: 'image/png',
      transparent: 'true',
      width: 256,
      height: 256,
    },
    layers: 'isobat:isobatimetria_8_16_30',
  })
  const terrainProvider = createWorldTerrainAsync()

  function getGeorasterLayer() {
    const getGeoblazeValue = new GetGeoblazeValue3D(url)
    getGeoblazeValue.parseGeoraster()
    return getGeoblazeValue
  }

  function reorderPhotos(photos: any) {
    const shuffled = photos.sort(() => 0.5 - Math.random())
    const n = shuffled.length > 700 ? 700 : shuffled.length
    const newList: any = []
    let count: number = 0
    let count2: number = 0
    // if (activePhoto) {
    //   count++
    //   newList.push(activePhoto)
    // }
    shuffled.every((el: any) => {
      if (count >= n) {
        return false // "break"
      }
      // if (el.filename !== activePhoto.filename) {
      if (el.show) {
        count2++
        newList.push(el.filename)
        count++
      }
      // }
      return true
    })
    if (count2 === 0) {
      return []
    }
    return newList
  }
  async function handleHoverUpdateInfoBox(e: any) {
    if (ref.current?.cesiumElement) {
      const ellipsoid = ref.current.cesiumElement.scene.globe.ellipsoid
      const cartesian = ref.current.cesiumElement.camera.pickEllipsoid(
        new Cesium.Cartesian3(e.endPosition.x, e.endPosition.y),
        ellipsoid,
      )
      const cartographic = ellipsoid.cartesianToCartographic(cartesian)
      const latitudeDegrees = Cesium.Math.toDegrees(cartographic.latitude)
      const longitudeDegrees = Cesium.Math.toDegrees(cartographic.longitude)

      setPosition((position: any) => {
        const newPosition = { ...position }
        newPosition.lat = latitudeDegrees
        newPosition.lng = longitudeDegrees
        return newPosition
      })
      await batLayer
        .getGeoblaze({
          lat: latitudeDegrees,
          lng: longitudeDegrees,
        })
        .then(async function () {
          const dep = batLayer.dep
          if (dep) {
            setDepth((depth: any) => {
              const copy = { ...depth }
              copy.Depth = dep.toFixed(2)
              return {
                ...copy,
              }
            })
          } else {
            setDepth((depth: any) => {
              const copy = { ...depth }
              copy.Depth = null
              return {
                ...copy,
              }
            })
          }
        })
    }
  }

  function getWMSLayer(layerName: any, actual: any) {
    const params: keyable = {
      service: 'wms',
      request: 'GetMap',
      version: '1.3.0',
      format: 'image/png',
      transparent: true,
      width: 128,
      height: 128,
      layers: layerName.params.layers,
      attribution: actual,
    }
    if (layerName.params.style) {
      params.style = layerName.params.style
    }
    const provider = new WebMapServiceImageryProvider({
      url: layerName.url,
      parameters: params,
      layers: params.layers,
    })
    const layer = new Cesium.ImageryLayer(provider, {})
    return layer
  }

  async function generateAddGJsonLayer(
    layer,
    layers,
    layerName,
    actual,
    alpha,
  ) {
    const color1 = createColor(colorScale, true, 0.3)
    const myStyle = {
      stroke: color1,
      fill: color1,
      strokeWidth: 3,
    }
    layer = await Cesium.GeoJsonDataSource.load(layerName.url, myStyle)
    layer.attribution = actual
    layer.originalColor = color1
    layer.alpha = alpha
    layers.add(layer)
    correctBaseWMSOrder(layers)
  }

  async function changeMapDateLayers(layers) {
    layers = ref.current.cesiumElement.scene.imageryLayers
    layers?._layers.forEach(function (layer: any) {
      if (layer.date_range) {
        const layerName = selectedLayers[layer.attribution]
        layers.remove(layer)
        generateAddTIFLayer(
          null,
          layers,
          layerName,
          layer.attribution,
          defaultOpacity,
        )
      }
      // }
    })

    // map.eachLayer(async (mapLayer: any) => {
    //   if (mapLayer.options.date_range) {
    //     const layerName = selectedLayers[mapLayer.options.attribution]
    //     const getTifLayer = new GetTifLayer2(
    //       layerName,
    //       mapLayer.options.attribution,
    //       yearMonths[actualDate],
    //       null,
    //       limits,
    //       null,
    //     )
    //     await getTifLayer.getTile().then(function () {
    //       layer = getTifLayer.layer
    //       layer.options.attribution = mapLayer.options.attribution
    //       map.addLayer(layer, true)
    //       map.removeLayer(mapLayer)
    //       map.eachLayer((newMapLayer: any) => {
    //         if (
    //           newMapLayer.options.attribution === mapLayer.options.attribution
    //         ) {
    //           newMapLayer.bringToFront()
    //         }
    //       })
    //     })
    //   }
  }
  //   setLoading(false)
  // }

  useEffect(() => {
    if (ref.current?.cesiumElement) {
      setLoading(true)
      let layers
      changeMapDateLayers(layers)
    }
  }, [actualDate])

  async function generateAddTIFLayer(layer, layers, layerName, actual, alpha) {
    const getTifLayer = new GetTifLayer2(
      layerName,
      actual,
      yearMonths[actualDate],
      null,
      limits,
      null,
    )
    await getTifLayer.getTile(rout).then(function () {
      layer = getTifLayer.layer
      layer.alpha = alpha
      layers.add(layer)
      correctBaseWMSOrder(layers)
    })
    if (actual.split('_')[0] === 'Bathymetry') {
      if (cogLayer) {
        if (
          batOrder.indexOf(actual.split('_')[1]) < batOrder.indexOf(cogLayer)
        ) {
          setCogLayer(actual.split('_')[1])
        }
      } else {
        setCogLayer(actual.split('_')[1])
      }
    }
  }

  async function generateAddCOGLayer(layer, layers, layerName, actual, alpha) {
    const getCOGLayer = new GetTileLayer(
      layerName,
      actual,
      true,
      yearMonths[actualDate],
    )
    await getCOGLayer.getTile(rout).then(function () {
      layer = getCOGLayer.layer
      layer.alpha = alpha
      layers.add(layer)
      correctBaseWMSOrder(layers)
    })
    if (actual.split('_')[0] === 'Bathymetry') {
      if (cogLayer) {
        if (
          batOrder.indexOf(actual.split('_')[1]) < batOrder.indexOf(cogLayer)
        ) {
          setCogLayer(actual.split('_')[1])
        }
      } else {
        setCogLayer(actual.split('_')[1])
      }
    }
  }
  // if (ref.current?.cesiumElement) {
  //   // const layers = ref.current.cesiumElement.scene.imageryLayers
  //   const layers = ref.current.cesiumElement.dataSources
  // }

  function createColor(colorScale: any, rgb: any, alpha: any = 1) {
    let color: any
    if (rgb) {
      if (!alpha) {
        alpha = 1
      }
      const colorRgb = chroma(colorScale[Math.floor(Math.random() * 30)]).rgb()
      color = new Cesium.Color(
        colorRgb[0] / 255,
        colorRgb[1] / 255,
        colorRgb[2] / 255,
        alpha,
      )
    } else {
      color = colorScale[Math.floor(Math.random() * 30)]
    }
    return color
  }

  async function correctBaseWMSOrder(layers: any) {
    layers?._layers.forEach(function (imageryLayers: any) {
      if (
        imageryLayers._imageryProvider._layers ===
        'isobat:isobatimetria_8_16_30'
      ) {
        layers.remove(imageryLayers)
        const layer = new Cesium.ImageryLayer(jnccMCZ, {})
        layers.add(layer)
      }
    })
  }

  async function generateSelectedLayer() {
    actualLayer.forEach(async (actual) => {
      const layerName = selectedLayers[actual]
      let layer: any
      let layers: any
      let dataSource
      if (layerName.data_type === 'wms') {
        layers = ref.current.cesiumElement.scene.imageryLayers
        layer = getWMSLayer(layerName, actual)
        layer.attribution = actual
        layer.alpha = defaultOpacity
        layers.add(layer)
        correctBaseWMSOrder(layers)
      } else if (layerName.data_type === 'COG') {
        layers = ref.current.cesiumElement.scene.imageryLayers
        await generateAddCOGLayer(
          layer,
          layers,
          layerName,
          actual,
          defaultOpacity,
        )
      } else if (layerName.data_type === '3D') {
        const terrainUrl = await Cesium.CesiumTerrainProvider.fromIonAssetId(
          parseInt(layerName.url),
        )
        ref.current.cesiumElement.terrainProvider = terrainUrl
      } else if (layerName.data_type === 'GTIFF') {
        layers = ref.current.cesiumElement.scene.imageryLayers
        generateAddTIFLayer(layer, layers, layerName, actual, defaultOpacity)
      } else if (layerName.data_type === 'GEOJSON') {
        layers = ref.current.cesiumElement.dataSources
        generateAddGJsonLayer(layer, layers, layerName, actual, defaultOpacity)
      } else if (layerName.data_type === 'Photo') {
        ref.current.cesiumElement.infoBox.frame.removeAttribute('sandbox')
        ref.current.cesiumElement.infoBox.frame.src = 'about:blank'
        dataSource = new Cesium.CustomDataSource(actual)
        layers = ref.current.cesiumElement.dataSources
        const markers: any = []
        const color = createColor(colorScale, true)

        const shuffledPhotos = reorderPhotos(layerName.photos)

        await layerName.photos.map(async (photo: any) => {
          markers.push(
            turf.point([
              photo.coordinates[0] + 0.003,
              photo.coordinates[1] + 0.003,
            ]),
          )
          markers.push(
            turf.point([
              photo.coordinates[0] - 0.003,
              photo.coordinates[1] - 0.003,
            ]),
          )
          if (shuffledPhotos.includes(photo.filename)) {
            const getPhotoMarker = new GetPhotoMarker(photo, actual, color)
            await getPhotoMarker.getMarker3D().then(async function () {
              dataSource.entities.add(getPhotoMarker.layer)
            })
          }
        })
        dataSource.attribution = actual
        layers.add(dataSource)
        const turfConvex = turf.convex(turf.featureCollection(markers))
        if (layerName.plotLimits) {
          const color1 = createColor(colorScale, true, 0.3)
          const myStyle = {
            stroke: color1,
            fill: color1,
            strokeWidth: 3,
          }
          let turfLayer: any
          if (turfConvex) {
            turfLayer = await Cesium.GeoJsonDataSource.load(turfConvex, myStyle)
            turfLayer.attribution = actual
            turfLayer.originalColor = color1
            turfLayer.name = 'limits'
            layers.add(turfLayer)
          }
        }
      }
    })
    setLoading(false)
  }

  function removeLayerFromMap() {
    actualLayer.forEach(async (actual) => {
      const splitActual = actual.split('_')
      const layerName = listLayers[splitActual[0]].layerNames[splitActual[1]]
      let layers: any
      if (layerName.data_type === 'wms' || layerName.data_type === 'COG') {
        layers = ref.current.cesiumElement.scene.imageryLayers
        layers?._layers.forEach(function (layer: any) {
          if ([actual].includes(layer.attribution)) {
            layers.remove(layer)
            setLayerAction('')
          }
        })
        if (splitActual[0] === cogLayer) {
          let newCogLayer = ''
          Object.keys(selectedLayers).forEach((layer) => {
            if (layer.split('_')[0] === 'Bathymetry') {
              if (newCogLayer) {
                if (
                  batOrder.indexOf(newCogLayer) <
                  batOrder.indexOf(layer.split('_')[1])
                ) {
                  newCogLayer = layer.split('_')[1]
                }
              } else {
                newCogLayer = layer.split('_')[1]
              }
            }
          })
          if (newCogLayer) {
            setCogLayer(newCogLayer)
          }
        }
      } else if (layerName.data_type === '3D') {
        layers = ref.current.cesiumElement
        layers.terrainProvider = await terrainProvider
      } else if (layerName.data_type === 'Photo') {
        layers = ref.current.cesiumElement.dataSources
        layers._dataSources.forEach(function (layer: any) {
          if (actualLayer.includes(layer.attribution)) {
            layers.remove(layer)
          }
        })
        setLayerAction('')
        layers._dataSources.forEach(function (layer: any) {
          if (actualLayer.includes(layer.attribution)) {
            layers.remove(layer)
          }
        })
      } else if (layerName.data_type === 'GEOJSON') {
        layers = ref.current.cesiumElement.dataSources
        let numberDataSources = 1

        while (numberDataSources > 0) {
          numberDataSources = 0
          for (let i = 0; i < layers._dataSources.length; i++) {
            const layer = layers._dataSources[i]
            if (actualLayer.includes(layer.attribution)) {
              layers.remove(layer)
              numberDataSources = 1
              break // exit the loop as soon as we remove a layer
            }
          }
        }
        setLayerAction('')
      }
    })
    setLoading(false)
  }

  async function addLayerIntoMap() {
    await generateSelectedLayer()
    setLayerAction('')
  }

  async function handleTerrainLayer() {
    if (threeD) {
      const terrainUrl = await Cesium.CesiumTerrainProvider.fromIonAssetId(
        parseInt(threeD.dataInfo.assetId),
      )

      const threeDCoordinates = Rectangle.fromDegrees(-10.1, 38.6, -10, 38.7)

      ref.current.cesiumElement.terrainProvider = terrainUrl
      ref.current.cesiumElement.camera.flyTo({
        destination: threeDCoordinates,
        orientation: {
          pitch: Cesium.Math.toRadians(-10.0),
          roll: Cesium.Math.toRadians(0.0),
        },
      })
    } else {
      ref.current.cesiumElement.terrainProvider = await terrainProvider
    }
  }

  useEffect(() => {
    if (ref.current?.cesiumElement) {
      handleTerrainLayer()
    }
  }, [threeD])

  function changeMapOpacity() {
    let layers: any
    actualLayer.forEach(async (actual) => {
      const splitActual = actual.split('_')
      const layerName = listLayers[splitActual[0]].layerNames[splitActual[1]]
      if (layerName.data_type === 'wms' || layerName.data_type === 'COG') {
        layers = ref.current.cesiumElement.scene.imageryLayers
        layers?._layers.forEach(function (layer: any) {
          if ([actual].includes(layer.attribution)) {
            layers.remove(layer)
            if (layerName.data_type === 'wms') {
              layer = getWMSLayer(layerName, actual)
              layer.attribution = actual
              layer.alpha = selectedLayers[layer.attribution].opacity
              layers.add(layer)
              correctBaseWMSOrder(layers)
            } else {
              generateAddCOGLayer(
                layer,
                layers,
                layerName,
                actual,
                selectedLayers[layer.attribution].opacity,
              )
            }
          }
        })
      } else if (layerName.data_type === 'Photo') {
        layers = ref.current.cesiumElement.dataSources
        layers._dataSources.forEach(function (layer: any) {
          if (actualLayer.includes(layer.attribution)) {
            if (layer._name === 'limits') {
              const color = layer.originalColor
              color.alpha = selectedLayers[layer.attribution].opacity
              if (color.alpha > 0.99) {
                color.alpha = 0.99
              }
              layer.entities._entities._array[0]._polygon.material = color
            }
          }
        })
      }

      setLayerAction('')
    })
  }

  async function changeMapZoom() {
    let layers: any
    actualLayer.forEach(async (actual) => {
      const splitActual = actual.split('_')[1]
      const layerName = listLayers[splitActual[0]].layerNames[splitActual[1]]
      if (layerName.data_type === 'wms' || layerName.data_type === 'COG') {
        layers = ref.current.cesiumElement.scene.imageryLayers
        layers?._layers.forEach(function (layer: any) {
          if ([actual].includes(layer.attribution)) {
            layers.remove(layer)
            if (layerName.data_type === 'wms') {
              const layerNew = getWMSLayer(layerName, actualLayer[0])
              layerNew.alpha = layer.alpha
              layers.add(layerNew)
              correctBaseWMSOrder(layers)
            } else if (layerName.data_type === 'COG') {
              generateAddCOGLayer(
                layer,
                layers,
                layerName,
                actual,
                selectedLayers[layer.attribution].opacity,
              )
            } else if (layerName.data_type === 'GTIFF') {
              generateAddTIFLayer(
                layer,
                layers,
                layerName,
                actual,
                selectedLayers[layer.attribution].opacity,
              )
            } else if (layerName.data_type === 'GEOJSON') {
              generateAddGJsonLayer(
                layer,
                layers,
                layerName,
                actual,
                selectedLayers[layer.attribution].opacity,
              )
            }
            ref.current.cesiumElement.camera.flyTo({
              destination: startCoordinates,
            })
            setLayerAction('')
          }
        })
      }
    })
  }

  useEffect(() => {
    if (layerAction === 'remove') {
      setLoading(true)
      removeLayerFromMap()
      setLayerAction('')
    } else if (layerAction === 'add') {
      setLoading(true)
      addLayerIntoMap()
      setLayerAction('')
    } else if (layerAction === 'zoom') {
      changeMapZoom()
      setLayerAction('')
    } else if (layerAction === 'opacity') {
      changeMapOpacity()
      setLayerAction('')
    }
  }, [selectedLayers])

  const displayMap = useMemo(
    () => (
      <Viewer
        full
        animation={false}
        timeline={false}
        ref={ref}
        infoBox={true}
        terrainProvider={terrainProvider}
        navigationHelpButton={false}
        scene3DOnly={true}
      >
        {/* <CesiumZoomControl /> */}
        {/* <Cesium3DTileset
          url={CesiumTerrainProvider.fromIonAssetId(2182075)}
          onReady={handleReady}
        /> */}
        <ImageryLayer imageryProvider={jnccMCZ} />
        <CameraFlyTo destination={startCoordinates} duration={3} />
        <ScreenSpaceEventHandler>
          <ScreenSpaceEvent
            action={(e) => handleHoverUpdateInfoBox(e)}
            type={ScreenSpaceEventType.MOUSE_MOVE}
          />
        </ScreenSpaceEventHandler>
      </Viewer>
    ),
    [],
  )

  return (
    <ResiumContainer>
      {displayMap}
      {position ? <DisplayPosition position={position} depth={depth} /> : null}
      {loading ? <Loading /> : null}
    </ResiumContainer>
  )
}

function mapPropsAreEqual(prevMap: any, nextMap: any) {
  return (
    prevMap.selectedLayers === nextMap.selectedLayers &&
    prevMap.threeD === nextMap.threeD &&
    prevMap.cogLayer === nextMap.cogLayer &&
    prevMap.actualLayer === nextMap.actualLayer &&
    prevMap.actualDate === nextMap.actualDate
  )
}

export const ThreeDMap = React.memo(ThreeDMap1, mapPropsAreEqual)
