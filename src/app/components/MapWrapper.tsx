'use client'

import dynamic from 'next/dynamic'

//* Dynamically load MapClient with SSR disabled
const MapClient = dynamic(() => import('./MapClient'), { ssr: false })

export default function MapWrapper() {
  return <MapClient />
}
