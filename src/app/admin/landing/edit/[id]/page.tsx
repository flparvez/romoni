import LandingPageEditor from '@/components/landing/EditLandigPage'
import { IdParams } from '@/types/index'
import React from 'react'

const EditLanding =async ({params}:IdParams) => {
  const {id} = await params;
  return (
    <div>
      <LandingPageEditor id={id} />
    </div>
  )
}

export default EditLanding
