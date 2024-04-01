import useSWR from 'swr'
import { getDocsCustom } from '@/utils/firebaseApi'
import { getLocation } from '@/utils/helpers'
import { calculateDistance } from '@/utils/helpers'
import { DISTANCE } from '@/utils/constants'
import { useEffect, useState } from 'react'

function useFirestoreData(endpoint, condition) {
  // Utiliser la condition sérialisée pour créer la clé SWR
  const swrKey = JSON.stringify(condition)
  const [enrichedData, setEnrichedData] = useState(null) // État pour stocker les données enrichies

  // Définir un fetcher qui utilise getDocsCustom avec la condition
  const fetcher = () => getDocsCustom(endpoint, condition)

  const { data, error, isValidating, mutate } = useSWR(swrKey, fetcher)

  useEffect(() => {
    if (data) {
      ;(async () => {
        try {
          const docs = []
          const userLocation = await getLocation()
          data.docs.forEach((doc) => {
            const item = doc.data()
            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              item.latCoor1,
              item.longCoor1,
            )
            if (distance <= DISTANCE) {
              docs.push({
                ...item, // Étendre item avec toutes ses propriétés
                distance, // Ajouter la distance calculée
              })
            }
            // console.log('docs :', docs)
          })
          setEnrichedData(docs) // Mettre à jour l'état avec les données enrichies
        } catch (error) {
          console.error(
            "Erreur lors de l'obtention de la localisation de l'utilisateur",
            error,
          )
        }
      })()
    }
  }, [data]) // Exécuter l'effet lorsque `data` change

  return {
    data: enrichedData,
    oldData: data,
    isLoading: !error && !data,
    isError: error,
    isValidating,
    mutate,
  }
}
export { useFirestoreData }

// import * as React from 'react'

// const reducer = (state, action) => {
//   switch (action.type) {
//     case 'loading':
//       return { ...state, status: 'loading', error: null }
//     case 'done':
//       return { ...state, status: 'done', data: action.payload, error: null }
//     case 'fail':
//       return { ...state, status: 'failure', data: null, error: action.error }
//     default:
//       throw new Error('Action non supportée')
//   }
// }

// const initialState = {
//   data: null,
//   error: null,
//   status: 'idle',
// }

// function useFetchData() {
//   const [state, dispatch] = React.useReducer(reducer, initialState)
//   const { data, error, status } = state

//   const execute = React.useCallback((promise) => {
//     if (!promise || typeof promise.then !== 'function') {
//       console.error('Le paramètre fourni doit être une promesse.')
//       return
//     }

//     const abortController = new AbortController()
//     const signal = abortController.signal

//     dispatch({ type: 'loading' })
//     promise
//       .then((data) => {
//         if (!signal.aborted) {
//           dispatch({ type: 'done', payload: data })
//         }
//       })
//       .catch((error) => {
//         if (!signal.aborted) {
//           dispatch({ type: 'fail', error })
//         }
//       })

//     // Fonction de nettoyage pour annuler la requête si le composant est démonté
//     return () => abortController.abort()
//   }, [])

//   return { data, error, status, execute }
// }

// export { useFetchData }

// import * as React from 'react'

// const reducer = (state, action) => {
//   switch (action.type) {
//     case 'loading':
//       return { status: 'loading', data: null, error: null }
//     case 'done':
//       return { status: 'done', data: action.payload, error: null }
//     case 'fail':
//       return { status: 'failure', data: null, error: action.error }
//     default:
//       throw new Error('Action non supporté')
//   }
// }
// const initialState = {
//   data: null,
//   error: null,
//   status: 'idle',
// }
// function useFetchData() {
//   const [state, dispatch] = React.useReducer(reducer, initialState)
//   const { data, error, status } = state

//   const execute = React.useCallback((promise) => {
//     dispatch({ type: 'loading' })
//     promise
//       .then((data) => dispatch({ type: 'done', payload: data }))
//       .catch((error) => dispatch({ type: 'fail', error }))
//   }, [])

//   // const setData = React.useCallback(
//   //   (data) => dispatch({ type: 'done', payload: data }),
//   //   [dispatch],
//   // )

//   // return { data, error, status, execute, setData }
//   return { data, error, status, execute }
// }

// export { useFetchData }
