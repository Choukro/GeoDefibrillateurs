import { useEffect, useState } from 'react'
import LocationMarker from '@/components/appDAE/LocationMarker'
import { ENDPOINT } from '@/utils/constants'
import { Icon } from 'leaflet'
import { Loader2 } from 'lucide-react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'
import { where } from 'firebase/firestore/lite'
import { useFirestoreData } from '@/hooks/useFirestoreData.js'

const Loader = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-secondary">
      <h1 className="text-3xl font-bold">Chargement en cours ...</h1>
      <Loader2 size={'64px'} className="animate-spin" />
    </div>
  )
}

const ErrorMessage = ({ message }) => {
  return (
    <div className="error">
      <span>❌{message}</span>
    </div>
  )
}

const customsIcon = new Icon({
  iconUrl: '/Logo.svg',
  iconSize: [38, 48],
})

const AppSearchDae = () => {
  const [positions, setPositions] = useState([])
  const condition = where('etatFonct', '==', 'En fonctionnement')

  const { data, isLoading, isError } = useFirestoreData(ENDPOINT, condition)

  useEffect(() => {
    console.log('Data', data)
    if (data) {
      const newPositions = data.docs.map((dae1) => {
        const { latCoor1, longCoor1, adrNum, adrVoie, comCp, dispJ } =
          dae1.data()
        return [
          {
            geocode: [latCoor1, longCoor1],
            popUp: `DAE situé au ${adrNum} ${adrVoie} ${comCp} - Disponibilité : ${dispJ}`,
          },
        ]
      })
      setPositions(newPositions)
    }
  }, [data])

  if (isLoading) {
    return <Loader />
  }

  // Logique de rendu en cas d'erreur lors de la récupération des données
  if (isError) {
    return <ErrorMessage message={isError.message} />
  }
  // Logique de rendu si les données sont chargées avec succès
  return (
    <div className="flex flex-col h-screen z-0 mt-20 m-2  overscroll-none  relative">
      <div className="block h-full w-full rounded-2xl absolute">
        <MapContainer
          center={{ lat: 43.4, lng: 1.433333 }}
          zoom={10}
          scrollWheelZoom={true}
          style={{ height: '90%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />

          <MarkerClusterGroup>
            {positions.map((marker, index) => (
              <Marker
                position={marker[0].geocode}
                icon={customsIcon}
                key={index}
              >
                <Popup className="border-2 rounded-2xl border-teal-500 p-4 bg-gradient-to-r from-green-600 to-pink-500">
                  {marker[0].popUp}
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  )
}

export default AppSearchDae
