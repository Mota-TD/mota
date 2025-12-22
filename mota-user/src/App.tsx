import { useRoutes } from 'react-router-dom'
import routes from '@/router'

/**
 * 应用根组件
 */
function App() {
  const element = useRoutes(routes)
  return element
}

export default App