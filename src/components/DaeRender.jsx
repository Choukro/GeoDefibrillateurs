import React, { useEffect, useState } from 'react'
import { where } from 'firebase/firestore/lite'
import { Loader2 } from 'lucide-react'
import { useFetchData } from '../hooks/useFetchData'
import { getDocsCustom, getAllData } from '../utils/firebaseApi'
import MapContainApp from './appDAE/MapContainApp'
import { Icon } from 'leaflet'

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { divIcon, point } from 'leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import Map from './appDAE/Map'

import { useNavigate, useSearchParams } from 'react-router-dom'

//Mini component to display loader
const Loader = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-secondary">
      <h1 className="text-3xl font-bold">Chargement en cours ...</h1>
      <Loader2 size={'64px'} className="animate-spin" />
    </div>
  )
}

//Mini component to display error
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

//Mini component to display DAE_List
// const DAEList = ({ data }) => {
//   return (
//     <>
//       <p className="bg-secondary text-4xl items-center w-full">Liste des DAE</p>

//       <div className="grid grid-cols-2">
//         {data?.map((entry) => (
//           <div key={entry.gid} className="m-6">
//             <h3 className="text-2xl "> Name: {entry.c_nom}</h3>
//             <p>
//               Address: {entry.c_adr_num} {entry.c_adr_voie}, {entry.c_com_cp}{' '}
//               {entry.c_com_nom}
//             </p>
//             <p>Code postal: {entry.c_com_cp}</p>
//             <p>Lat : {entry.c_lat_coor1}</p> <p>Long : {entry.c_long_coor1}</p>
//             <p> Disponibilité : {entry.c_disp_j}</p>
//           </div>
//         ))}
//       </div>
//       {/* <MapContainApp markers={markers} icon={customsIcon} /> */}
//     </>
//   )
// }

const DAEPosition = ({ positions }) => {
  return (
    <>
      <p className="bg-secondary text-4xl items-center w-full">Liste des DAE</p>
      <div className="grid grid-cols-2">
        {positions?.map((entry) => (
          <div key={entry.gid} className="m-6">
            <p>Lat : {entry[0].geocode}</p>
            <p>Long : {entry[0].geocode}</p>
            <p> Popup : {entry[0].popUp}</p>
          </div>
        ))}
      </div>
    </>
  )
}
const DaeRender = () => {
  const { data, status, error, execute } = useFetchData()

  const [dae, setDae] = useState()

  const [positions, setPositions] = useState([])

  useEffect(() => {
    // Exemple de requetes

    /** Tout les DAE **/
    //execute(getDocsCustom('/entries'))

    /** Tout les DAE d'une Ville **/
    //execute(
    //  getDocsCustom('/entries', where('c_com_nom', '==', 'Condé-en-Normandie')),
    //)

    /** Un DAE avec une longitude et une latitude **/
    // getDocsCustom(
    //   '/entries',
    //   where('c_lat_coor1', '==', 48.8509),
    //   where('c_long_coor1', '==', -0.541597),
    // ),

    /** Tous les DAE **/
    execute(getAllData('/entries'))
  }, [execute])

  // useEffect(() => {
  //   setDae(
  //     data && data.docs
  //       ? data.docs.map((doc) => ({
  //           id: doc.gid,
  //           ...doc.data(),
  //         }))
  //       : [],
  //   )
  // }, [data])

  //Extraire les coordonnées DAE c_lat_coor1 et c_long_coor1
  // useEffect(() => {
  //   if (data && data.docs) {
  //     setPositions(
  //       data.docs.map((dae) => [
  //         {
  //           geocode: `${(dae.data().c_lat_coor1, dae.data().c_long_coor1)}`,
  //           popUp: `Hello, je suis le DAE : ${dae.data().c_nom}`,
  //         },
  //       ]),
  //       ...positions,
  //     )
  //   }
  // }, [data, positions])

  useEffect(() => {
    console.log(data)
    if (data && data.docs) {
      const newPositions = data.docs.map((dae1) => {
        const { c_lat_coor1, c_long_coor1, c_nom } = dae1.data()
        return [
          {
            // geocode: `[${c_lat_coor1}, ${c_long_coor1}]`,
            // geocode: { c_lat_coor1, c_long_coor1 },
            geocode: [c_lat_coor1, c_long_coor1],
            // geocode: [c_lat_coor1.value(), c_long_coor1.value()],
            popUp: `Hello, je suis le DAE : ${c_nom}`,
          },
        ]
      })

      setPositions((prevPositions) => [...newPositions, ...prevPositions])
    }
  }, [data])

  console.log(positions.length)
  console.log(typeof positions)
  // console.log(positions[0].length)

  const DaeListResult = () => {
    console.log(positions[0])

    switch (status) {
      case 'failure':
        return <ErrorMessage message={error} />
      case 'loading':
        return <Loader />
      case 'done':
        // return <DAEList data={dae} />
        // return (
        //   <MapContainApp
        //     markers={positions}
        //     icon={customsIcon}
        //     className="h-full w-full border-4 absolute"
        //   />
        // )
        return (
          <div className="mt-20 mb-20 h-full w-full border-4 absolute">
            <MapContainer
              center={{ lat: 46.7111, lng: 1.7191 }}
              zoom={6.5}
              scrollWheelZoom={false}
              style={{ height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MarkerClusterGroup>
                {positions.map((marker, index) => (
                  <Marker
                    position={marker[0].geocode}
                    icon={customsIcon}
                    key={index}
                  >
                    <Popup>{marker[0].popUp}</Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
            </MapContainer>
          </div>
        )

      default:
        return <>{status}</>
    }
  }

  return <>{DaeListResult()}</>
}

export default DaeRender
