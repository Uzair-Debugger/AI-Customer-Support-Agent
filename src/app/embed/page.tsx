import EmbedClient from '@/components/EmbedClient'
import { getSession } from '@/lib/getSession'
import React from 'react'

const page = async () => {
    const response = await getSession();
    const session = await response.json()
  return (
    <EmbedClient ownerId={session?.user?.id}/>
  )
}

export default page