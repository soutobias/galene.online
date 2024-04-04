import { ColorBarContainer, ColorBarItem } from './styles'

interface ColorBarProps {
  layerLegend: any
}

export function ColorBar({ layerLegend }: ColorBarProps) {
  // Not Suitable - Optimal
  console.log(layerLegend)
  return (
    <ColorBarContainer>
      <div className="flex justify-center font-extrabold gap-3">
        {layerLegend.dataDescription[1] === 'Not Suitable - Optimal' ? (
          <p className="text-lg"></p>
        ) : (
          <>
            <p className="text-lg">{layerLegend.dataDescription[0]}</p>
            <p className="text-lg">{layerLegend.dataDescription[1]}</p>
          </>
        )}
      </div>
      <div className="flex justify-between font-extrabold">
        <p className="text-lg">
          {layerLegend.dataDescription[1] === 'Not Suitable - Optimal'
            ? 'Not Suitable'
            : Math.min(...layerLegend.legend[1]).toFixed(1)}
        </p>
        <p className="text-lg">
          {layerLegend.dataDescription[1] === 'Not Suitable - Optimal'
            ? 'Optimal'
            : Math.max(...layerLegend.legend[1]).toFixed(1)}
        </p>
      </div>
      <div className="flex">
        {layerLegend.legend[0].map((value: string, index: number) => (
          <ColorBarItem
            key={`${value}_${index}`}
            style={{ backgroundColor: value }}
          >
            <p>=</p>
          </ColorBarItem>
        ))}
      </div>
    </ColorBarContainer>
  )
}
