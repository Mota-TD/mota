import { useRoutes } from 'react-router-dom'
import routes from '@/router'
import ErrorBoundary from '@/components/ErrorBoundary'

/**
 * 应用根组件
 */
function App() {
  const element = useRoutes(routes)
  
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // 可以在这里添加错误上报逻辑
        console.error('App Error:', error)
        console.error('Error Info:', errorInfo)
      }}
    >
      {element}
    </ErrorBoundary>
  )
}

export default App