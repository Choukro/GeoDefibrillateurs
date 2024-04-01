import { useState } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import { useEffect } from 'react'

const LocationMarker = () => {
  const [position, setPosition] = useState(null)
  const map = useMap()

  useEffect(() => {
    const timerId = setTimeout(() => {
      map.locate().on('locationfound', (e) => {
        setPosition(e.latlng)
        map.flyTo(e.latlng, 16) // Ajustez ici le niveau de zoom si nécessaire
      })
    }, 2000) // Attend 4 secondes avant de lancer la géolocalisation

    return () => clearTimeout(timerId) // Nettoyage en cas de démontage du composant
  }, [map]) // Exécute l'effet une fois au montage du composant

  // const map = useMapEvents({
  //   click() {
  //     map.locate()
  //   },
  //   locationfound(e) {
  //     setPosition(e.latlng)
  //     map.flyTo(e.latlng, 16)
  //   },
  // })

  return position === null ? null : (
    <>
      <Marker position={position}>
        <Popup>Votre position actuelle</Popup>
      </Marker>
    </>
  )
}

export default LocationMarker
