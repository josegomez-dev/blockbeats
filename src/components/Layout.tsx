import { ReactNode } from 'react'
import Nav from './Nav'
import Footer from './Footer'
import { useAuth } from '../context/AuthContext'
import SidebarMenu from './SidebarMenu'
import SidebarChatPanel from './SidebarChatPanel'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const { authenticated, role } = useAuth()

  // check if location is different from /collections
  const isCollectionsPage = typeof window !== 'undefined' && window.location.pathname.includes('/collections')

  return (
      <>
        <Nav />
        {authenticated && (
          <>
            {location.pathname !== '/studio' && (
              <SidebarMenu />
            )}
            {/* <SidebarChatPanel /> */}
          </>
        )}
        <main className="p-4">
            {authenticated && <div className='custom-nav-spacer' />}
            {children}
            {!isCollectionsPage && <Footer />}
        </main>
      </>  
  )
}

export default Layout