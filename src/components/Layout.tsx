import { ReactNode } from 'react'
import Nav from './Nav'
import Footer from './Footer'
import { useAuth } from '../context/AuthContext'
import SidebarMenu from './SidebarMenu'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const { authenticated, role } = useAuth()

  return (
      <>
        <Nav />
        <SidebarMenu />
        <main className="p-4">
            {authenticated && <div className='custom-nav-spacer' />}
            {children}
            {!authenticated && <Footer />}
        </main>
      </>  
  )
}

export default Layout