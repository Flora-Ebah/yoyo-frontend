// Component Imports
import NotFound from '@views/NotFound'

// Util Imports
import { getServerMode } from '@core/utils/serverHelpers'

const NotFoundPage = async () => {
  // Vars
  const mode = await getServerMode()

  return <NotFound mode={mode} />
}

export default NotFoundPage

