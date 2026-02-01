// components/AdContainer.tsx
// Contenedor estilizado para anuncios

export default function AdContainer({ 
  children,
  position = 'center' 
}: { 
  children: React.ReactNode
  position?: 'center' | 'top' | 'bottom' | 'side'
}) {
  const positionStyles = {
    center: 'flex justify-center my-8',
    top: 'flex justify-center mb-8',
    bottom: 'flex justify-center mt-8',
    side: 'sticky top-4'
  }

  return (
    <div className={positionStyles[position]}>
      <div className="bg-neutral-900/40 backdrop-blur-xl rounded-2xl border border-neutral-800/50 p-4 overflow-hidden">
        {children}
      </div>
    </div>
  )
}