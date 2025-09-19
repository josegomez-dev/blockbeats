import { ReactNode } from 'react'
import Nav from './Nav'
import Footer from './Footer'
import { useAuth } from '../../context/AuthContext'
import SidebarMenu from './SidebarMenu'
import SidebarChatPanel from './SidebarChatPanel'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const { authenticated, loading } = useAuth()

  // check if location is different from /collections
  const isCollectionsPage = typeof window !== 'undefined' && window.location.pathname.includes('/collections')

  // Define paths where SidebarMenu should be hidden
  const hiddenSidebarPaths = ['/studio', '/dashboard', '/marketplace', '/collections', '/auth/login', '/auth/signup']
  const shouldHideSidebar = typeof window !== 'undefined' && 
    hiddenSidebarPaths.some(path => window.location.pathname.startsWith(path))

  const hiddenNavPaths = ['/auth/login', '/auth/signup'];

  return (
      <>
        {/* Hide navbar during loading/preloader */}
        {!loading && authenticated && !hiddenNavPaths.some(path => window.location.pathname.startsWith(path)) && <Nav />}
        {authenticated && !loading && (
          <>
            {!shouldHideSidebar && (
              <SidebarMenu />
            )}
            {/* <SidebarChatPanel /> */}
          </>
        )}
        <main className="p-4">
            {authenticated && !loading && <div className='custom-nav-spacer' />}
            {children}
            {/* {authenticated && !isCollectionsPage && <Footer />} */}
        </main>
      </>  
  )
}

export default Layout