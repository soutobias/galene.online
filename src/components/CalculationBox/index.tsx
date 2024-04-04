import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { InfoButtonBoxContainer, InfoButtonBoxContent } from './styles'
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import 'katex/dist/katex.min.css'
import Draggable from 'react-draggable'
import { useEffect, useRef, useState } from 'react'
import { yearMonths } from '../../data/yearMonths'
import { ComparePolygonPoint } from './comparePolygonPoint'

interface CalculationBoxProps {
  calculationBox: any
  setCalculationBox: any
  actualDate: any
  listLayers: any
}

export function CalculationBox({
  calculationBox,
  setCalculationBox,
  actualDate,
  listLayers,
}: CalculationBoxProps) {
  const [data, setData] = useState<any>(null)

  function handleClose() {
    setCalculationBox(null)
  }
  const nodeRef = useRef(null)

  useEffect(() => {
    async function fetchData() {
      const verifyPointPolygon = new ComparePolygonPoint(
        calculationBox,
        yearMonths[actualDate],
        listLayers,
      )
      await verifyPointPolygon.compare()
      setData(verifyPointPolygon.sum)
    }
    fetchData()
  }, [actualDate])
  return (
    <Draggable nodeRef={nodeRef}>
      <InfoButtonBoxContainer
        id="info-subsection"
        ref={nodeRef}
        className="w-80"
      >
        <div>
          <FontAwesomeIcon icon={faCircleXmark} onClick={handleClose} />
        </div>
        <div className="font-bold text-center pb-3 text-xl">
          {calculationBox}
        </div>
        <InfoButtonBoxContent className="content-center pb-2">
          {calculationBox === 'kelps' ? (
            <>
              <p>
                Ecosystem services refer to the essential benefits that humans
                derive from functioning ecosystems. In the context of kelp
                ecosystems, these marine environments offer a multitude of
                valuable services crucial for both ecological balance and human
                well-being. Key ecosystem services provided by kelp include:
              </p>
              <p>{`FOOD SECURITY: for the area of interest for ${yearMonths[actualDate]}, according to environmental suitability, it is valued at:`}</p>
              <p className="text-red-500">{`- ${
                data * 16 * 100 * 296
              } kg/Ha/year OR $ ${(data * 16 * 100 * 33.382).toFixed(
                2,
              )} Ha/year`}</p>
              <p>{`CARBON SEQUESTRATION:  or the area of interest for ${yearMonths[actualDate]}, according to environmental suitability, it is valued at:`}</p>
              <p className="text-red-500">{`- ${
                data * 16 * 1000000 * 109
              } g/m2/year OR `}</p>
              <p className="text-red-500">{`- $ ${(
                data *
                16 *
                100 *
                163
              ).toFixed(2)} Ha/year`}</p>
            </>
          ) : (
            <>
              <p>
                Ecosystem services associated with seagrass habitats are
                integral to maintaining the health of coastal ecosystems and
                promoting human well-being. Seagrasses offer a range of valuable
                services, including:
              </p>
              <p>{`FISHERIES SUPPORT: for the area of interest for ${yearMonths[actualDate]}, according to environmental suitability, it is valued at:`}</p>
              <p className="text-red-500">{`- $ ${(
                data *
                16 *
                100 *
                950
              ).toFixed(2)} Ha/year`}</p>
              <p>{`CARBON SEQUESTRATION:  or the area of interest for ${yearMonths[actualDate]}, according to environmental suitability, it is valued at:`}</p>
              <p className="text-red-500">{`- ${
                data * 16 * 1000000 * 250
              } g/m2/year OR`}</p>
              <p className="text-red-500">{`- $ ${(
                data *
                16 *
                100 *
                1000
              ).toFixed(2)} Ha/year`}</p>
            </>
          )}
        </InfoButtonBoxContent>
      </InfoButtonBoxContainer>
    </Draggable>
  )
}
