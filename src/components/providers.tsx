import { Toaster } from 'react-hot-toast'

export function Providers({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Toaster 
        position='bottom-right' 
        toastOptions={{
          className: 'bg-gray-800 text-white',
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      {children}
    </>
  )
}