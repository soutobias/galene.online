import {
  faBook,
  faCircleXmark,
  faHouse,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FullPagePopupContainer } from './styles'

interface FullPagePopupProps {
  setShowPopup: any
}

export function FullPagePopup({ setShowPopup }: FullPagePopupProps) {
  function handleClose() {
    setShowPopup(false)
  }

  return (
    <FullPagePopupContainer onClick={handleClose}>
      <div className="w-[40rem] align-middle text-center">
        <FontAwesomeIcon icon={faCircleXmark} onClick={handleClose} />
        <div>
          <img src="favicon_galene.png" className="h-40" />
        </div>
        <h2 className="text-center font-bold pb-3 capitalize text-5xl">
          GALENE
        </h2>
        <div className="p-4">
          <p className="text-center font-bold text-3xl">
            An AI-powered model to guide nature-based solutions to climate
            change
          </p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-1">
            <a
              href="https://pub-d25b385271574fbeb5c6af580799fafe.r2.dev/portugal_coastal_marine_ecosystems_evaluation.pdf"
              target="_blank"
              className="p-4 cursor-pointer"
            >
              <FontAwesomeIcon icon={faBook} />
              <p className="text-center text-sm font-bold">Documentation</p>
            </a>
            <a
              href="https://sites.google.com/galenepathways.io/software/"
              target="_blank"
              className="p-4 cursor-pointer"
            >
              <FontAwesomeIcon icon={faHouse} />
              {/* <FontAwesomeIcon icon={faGitHub} /> */}
              <p className="text-center text-sm font-bold">Galene</p>
            </a>
          </div>
        </div>
      </div>
    </FullPagePopupContainer>
  )
}
