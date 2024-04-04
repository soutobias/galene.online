import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { InfoButtonBoxContainer } from '../InfoButtonBox/styles'
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useRef, useState } from 'react'
import { GetTitilerData } from './getTitilerData'
import { Loading } from '../Loading'
import Plot from 'react-plotly.js'
import Draggable from 'react-draggable'
import { GetGeoblazeValuePoint } from '../MapHome/getGeoblazeValue'
import { yearMonths } from '../../data/yearMonths'

interface GraphBoxProps {
  graphData: any
  setGraphData: any
  actualLayer: any
  setGetPolyline: any
  setClickPoint: any
  selectedLayers: any
}

export function GraphBox({
  graphData,
  setGraphData,
  actualLayer,
  setGetPolyline,
  setClickPoint,
  selectedLayers,
}: GraphBoxProps) {
  const [data, setData] = useState<any>(null)

  function handleClose() {
    setGetPolyline(false)
    setClickPoint(false)
    setGraphData(null)
  }

  useEffect(() => {
    async function fetchData() {
      if (graphData.length === 1) {
        const getGeoblazeValue = new GetGeoblazeValuePoint(
          graphData,
          actualLayer[0],
          yearMonths,
        )
        await getGeoblazeValue.getGeoblaze()
        setData(getGeoblazeValue.dataGraph)
        // getGeoblazeValue.getGeoblaze().then(async function () {
        //   setData(getGeoblazeValue.dataGraph)
        // })
      } else {
        const getTitilerData = new GetTitilerData(graphData, actualLayer[0])
        await getTitilerData.fetchData()
        setData(getTitilerData.dataGraph)
        // getTitilerData.fetchData().then(async function () {
        //    setData(getTitilerData.dataGraph)
        // })
      }
    }
    fetchData()
  }, [])
  const nodeRef = useRef(null)

  const [yearStart, monthStart] = yearMonths[0].split('-')
  const [yearEnd, monthEnd] = yearMonths[yearMonths.length - 1].split('-')

  return (
    <Draggable nodeRef={nodeRef}>
      <InfoButtonBoxContainer
        ref={nodeRef}
        id="graph-box"
        className="min-h-[20rem] min-w-[15rem]"
      >
        <div>
          <FontAwesomeIcon icon={faCircleXmark} onClick={handleClose} />
        </div>
        <div className="font-bold text-center pb-3">Graph</div>
        {!data ? (
          <div>
            <p>Generating graph...</p>
            <Loading />
          </div>
        ) : (
          <Plot
            data={[
              {
                x: data.distance ? data.distance : data.time,
                y: data.value,
                mode: 'lines',
                marker: { color: 'red' },
                // hovertemplate: '<i>X</i>: %{x:.0f}' + '<br><b>Y</b>: %{y:.3f}<br>',
                hoverinfo: 'x+y',
              },
            ]}
            layout={{
              width: 300,
              height: 400,
              hovermode: 'closest',
              showlegend: false,
              plot_bgcolor: 'rgba(0,0,0,0)',
              paper_bgcolor: 'rgba(0,0,0,0)',
              // title: ,
              margin: { l: 50, r: 20, t: 20, b: 50 },
              xaxis: {
                hoverformat: '.0f',
                title: {
                  text: data.distance ? 'Distance (km)' : 'Time (months)',
                  font: {
                    color: 'white', // Set the x-axis title color to white
                  },
                },
                tickfont: {
                  color: 'white', // Set the x-axis tick labels color to white
                },
                range: data.distance
                  ? [Math.min(...data.distance), Math.max(...data.distance)]
                  : [
                      new Date(parseInt(yearStart), parseInt(monthStart), 1),
                      new Date(parseInt(yearEnd), parseInt(monthEnd), 1),
                    ],
                gridcolor: 'white', // Set the x-axis grid line color to white
              },
              yaxis: {
                autorange: true,
                fixedrange: false,
                hoverformat: '.0f',
                title: {
                  text: '',
                  font: {
                    color: 'white', // Set the y-axis title color to white
                  },
                },
                tickfont: {
                  color: 'white', // Set the y-axis tick labels color to white
                },
                gridcolor: 'white', // Set the y-axis grid line color to white
              },
            }}
            config={{ responsive: true, displayModeBar: false }}
          />
        )}
      </InfoButtonBoxContainer>
    </Draggable>
  )
}
