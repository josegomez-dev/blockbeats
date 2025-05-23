import { ReactNode } from 'react'
import Nav from './Nav'
import Footer from './Footer'
import { useAuth } from '../context/AuthContext'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const { authenticated, role } = useAuth()

  return (
      <>
        <Nav />
        <main className="p-4">
            {authenticated && <div className='custom-nav-spacer' />}
            {children}
            {!authenticated && <Footer />}
        </main>
      </>  
  )
}

export default Layout