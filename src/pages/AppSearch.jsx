import { useEffect, useState } from 'react'
import LocationMarker from '@/components/appDAE/LocationMarker'
import { ENDPOINT, hauteGaronne } from '@/utils/constants'
import { Icon } from 'leaflet'
import { Loader2 } from 'lucide-react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'
import { where } from 'firebase/firestore/lite'
import { useFirestoreData } from '@/hooks/useFirestoreData.js'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { useNavigate } from 'react-router-dom'
import { Polyline } from 'react-leaflet'
import { Context } from '@/context/AuthContext'
import { useContext } from 'react'

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
  const { user } = useContext(Context)
  let label, description
  if (!user) {
    label = 'Créer un compte'
    description =
      'Créer un compte pour voir la liste des DAE disponibles en Haute-Garonne.'
  } else {
    label = 'Voir liste DAE | FR-31'
    description = 'Faites une recherche dans la liste des DAE disponibles.'
  }
  const blackOptions = { color: 'black' }
  const navigate = useNavigate()
  const [positions, setPositions] = useState([])
  const condition = where('etatFonct', '==', 'En fonctionnement')

  const { data, isLoading, isError } = useFirestoreData(ENDPOINT, condition)

  useEffect(() => {
    if (!isLoading && data) {
      const newPositions = data.map((dae) => {
        const {
          latCoor1,
          longCoor1,
          adrNum,
          adrVoie,
          comCp,
          comNom,
          dispJ,
          distance,
        } = dae
        return [
          {
            geocode: [latCoor1, longCoor1],
            popUp: `DAE situé au ${adrNum} ${adrVoie} ${comCp} ${comNom} | Disponibilité : ${dispJ} | Distance : ${Math.round(
              distance * 1000,
            )} m`,
          },
        ]
      })
      setPositions(newPositions)
    }
  }, [data, isLoading])

  useEffect(() => {
    const timerId = setTimeout(() => {
      toast(
        'Pas de DAE sur la carte ? (Zone de recherche autour de vous : 5 km)',
        {
          description: description,
          closeButton: true,
          duration: Infinity,
          classNames: {
            actionButton: '!bg-primary hover:!bg-primary/80',
            closeButton: 'hover:!bg-primary/30',
          },
          action: {
            label: label,
            onClick: () => navigate('/listeDAE'),
          },
        },
      )
    }, 3000)
    return () => clearTimeout(timerId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isLoading && data?.length === 0) {
      toast('Êtes-vous situé(e) en Haute-Garonne (FR31) ?', {
        description:
          'Si la réponse est NON, cliquez sur le bouton pour trouver le DAE le plus proche de vous dans votre département.',
        closeButton: true,
        duration: Infinity,
        classNames: {
          actionButton: '!bg-primary hover:!bg-primary/80',
          closeButton: 'hover:!bg-primary/30',
        },
        action: {
          label: 'Cliquez ici',
          onClick: () =>
            window.open('https://www.defibrillateurs.info/', '_blank'),
        },
      })
    }
  }, [data, isLoading])

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
          zoom={9}
          scrollWheelZoom={true}
          style={{ height: '90%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polyline pathOptions={blackOptions} positions={hauteGaronne} />
          <LocationMarker />

          <MarkerClusterGroup>
            {positions.map((marker, index) => (
              <Marker
                position={marker[0].geocode}
                icon={customsIcon}
                key={index}
              >
                <Popup className="border-1 rounded-2xl p-2">
                  {marker[0].popUp}
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
      <Toaster />
    </div>
  )
}

export default AppSearchDae
