/* eslint-disable no-undef */
import * as turf from '@turf/turf'
import axios from 'axios'
// import geoblaze from 'geoblaze'
import proj4 from 'proj4'

import 'leaflet/dist/leaflet'

export class ComparePolygonPoint {
  constructor(biome, yearMonth, listLayers) {
    this.biome = biome
    this.yearMonth = yearMonth
    this.listLayers = listLayers
    this.sum = 0
  }

  async compare() {
    const biomeUrl =
      this.biome === 'Kelps'
        ? 'https://pub-d25b385271574fbeb5c6af580799fafe.r2.dev/kelps_sm.geojson'
        : 'https://pub-d25b385271574fbeb5c6af580799fafe.r2.dev/seagrass_sm.geojson'
    const suitabilityLayer = this.listLayers.Suitability.layerNames[this.biome]
    const url = suitabilityLayer.url.replace('actualDate', this.yearMonth)

    const geoJsonData = await axios
      .get(biomeUrl)
      .then((response) => {
        return response.data
        // Use geoJsonData here
      })
      .catch((error) => {
        console.error('Error fetching data: ', error)
      })
    // JSON.parse(fs.readFileSync(biomeUrl, 'utf8'))

    const arrayBuffer = await fetch(url).then(async (response) => {
      return await response.arrayBuffer()
    })
    const georaster = await parseGeoraster(arrayBuffer).then(
      async (georaster) => {
        return georaster
      },
    )
    await Promise.all(
      await geoJsonData.features.map(async (feature) => {
        // Check if the feature is a polygon
        if (
          feature.geometry.type === 'Polygon' ||
          feature.geometry.type === 'MultiPolygon'
        ) {
          // Create a turf polygon from the feature
          const polygon = turf.multiPolygon(feature.geometry.coordinates)
          await georaster.values[0].forEach(async (heightValue, i) => {
            heightValue.forEach(async (value, j) => {
              if (Number(value) > -3.5) {
                const pixelCoordinates = {
                  lng:
                    georaster.xmin +
                    (georaster.xmax - georaster.xmin) * (i / georaster.width),
                  lat:
                    georaster.ymin +
                    (georaster.ymax - georaster.ymin) * (j / georaster.height),
                }
                const latlng = proj4('EPSG:3857', 'EPSG:4326').forward([
                  pixelCoordinates.lng,
                  pixelCoordinates.lat,
                ])
                // console.log(latlng)
                // console.log(polygon)
                // Check if pixel is inside the polygon
                const isInside = turf.booleanPointInPolygon(
                  [latlng[0], latlng[1]],
                  polygon,
                )
                // console.log(isInside)

                if (isInside) {
                  // Do something with the pixel inside the polygon and with value > 10
                  this.sum += 1
                }
              }
            })
          })
          // const values = await geoblaze.stats(georaster, polygon)
          // const hasValueHigher = values.some((value) => value > -1)
          // console.log(hasValueHigher)
        }
        return null // Return a value to satisfy the map() function
      }),
    )
  }
}
