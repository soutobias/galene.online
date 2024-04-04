import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { LayerLegendContainer } from './styles'
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import { ColorBar } from '../ColorBar'
import { useRef } from 'react'
import Draggable from 'react-draggable'
import chroma from 'chroma-js'

interface LayerLegendProps {
  layerLegend: any
  setLayerLegend: any
  mapScale?: any
  setMapScale?: any
  setActualLayer?: any
}

export function DataExplorationLegend({
  layerLegend,
  setLayerLegend,
  mapScale,
  setMapScale,
  setActualLayer,
}: LayerLegendProps) {
  function handleClose() {
    setLayerLegend('')
  }
  function linspace(start, stop, num, endpoint = true) {
    const div = endpoint ? num - 1 : num
    const step = (stop - start) / div
    return Array.from({ length: num }, (_, i) => start + step * i)
  }
  function handleChangeScale(biome) {
    setActualLayer([layerLegend.actualLayer])
    let colorScale
    setLayerLegend((oldLayerLegend) => {
      const values = layerLegend.subLayer[`scale_${biome}`]
      const times = 100
      const scale = []
      const newValues = linspace(values[0], values[values.length - 1], times)
      colorScale = chroma
        .scale(layerLegend.subLayer[`colors_${biome}`])
        .domain(values)
      for (let i = 0; i < times; i++) {
        scale.push(colorScale(newValues[i]).hex())
      }
      oldLayerLegend.legend = [scale, values]
      return oldLayerLegend
    })
    setMapScale(biome)
  }
  const nodeRef = useRef(null)
  console.log(layerLegend)
  return (
    <Draggable nodeRef={nodeRef}>
      <LayerLegendContainer ref={nodeRef} id="legend-box">
        <div className="flex justify-end pb-1">
          <FontAwesomeIcon
            contentStyleType={'regular'}
            icon={faCircleXmark}
            onClick={handleClose}
          />
        </div>
        <div>
          <h1>{layerLegend.layerName}</h1>
          <div>
            {layerLegend.url ? (
              <img src={layerLegend.url} />
            ) : layerLegend.dataType ? (
              <ColorBar layerLegend={layerLegend} />
            ) : (
              layerLegend.legend[0].map((color: any, idx: any) => {
                return (
                  <div key={color} className="flex p-1">
                    <div
                      style={{ backgroundColor: color }}
                      className="rounded w-4"
                    ></div>
                    <p>{layerLegend.legend[1][idx]}</p>
                  </div>
                )
              })
            )}
          </div>
        </div>
        {layerLegend.actualLayer ? (
          layerLegend.actualLayer.split('_')[0] === 'Environmental Data' ? (
            <div className="flex justify-around pt-2">
              <div
                className="cursor-pointer p-2 hover:opacity-100 opacity-80 underline"
                onClick={() => handleChangeScale('kelps')}
              >
                Kelps
              </div>
              <div
                className="cursor-pointer p-2 hover:opacity-100 opacity-80 underline"
                onClick={() => handleChangeScale('seagrass')}
              >
                Seagrass
              </div>
            </div>
          ) : (
            <></>
          )
        ) : (
          <></>
        )}
      </LayerLegendContainer>
    </Draggable>
  )
}
