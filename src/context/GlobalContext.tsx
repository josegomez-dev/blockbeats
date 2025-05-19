import { User } from '@/types/userTypes'
import { createContext, ReactNode, useContext, useState } from 'react'

// Define the shape of your context data
interface GlobalContextProps {
  state: string
  setState: React.Dispatch<React.SetStateAction<string>>
}

// Create the context with default values
const GlobalContext = createContext<GlobalContextProps | undefined>(undefined)

// Provider component to wrap your application or part of it
export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<string>('default value')

  return (
    <GlobalContext.Provider value={{
      state,
      setState,
    }}>
      {children}
    </GlobalContext.Provider>
  )
}

// Custom hook to use the GlobalContext
export const useGlobalContext = () => {
  const context = useContext(GlobalContext)
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider')
  }
  return context
}
