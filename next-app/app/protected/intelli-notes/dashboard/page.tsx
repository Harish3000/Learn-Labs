import React from 'react'
import 

const Page: React.FC = () => {
  const fileList = useQuery(api.storage.GetUserFiles);
  return (
    <div>
      <h2 className='font-bold text-3xl'>Workspace</h2>
    </div>
  )
}

export default Page
