// MUI Imports
import Grid from '@mui/material/Grid'

// Type Imports
import type { ProfileTabType } from '../types'

// Component Imports
import AboutOverview from './AboutOverview'

const ProfileTab = ({ data }: { data?: ProfileTabType }) => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <AboutOverview data={data} />
      </Grid>
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Grid container spacing={6}>
          {/* <Grid size={{ xs: 12 }}>
            <ActivityTimeline />
          </Grid>
          <ConnectionsTeams connections={data?.connections} teamsTech={data?.teamsTech} />
          <Grid size={{ xs: 12 }}>
            <ProjectsTable projectTable={data?.projectTable} />
          </Grid> */}
          <Grid size={{ xs: 12 }}>
              <div className='flex justify-center items-center p-10 text-muted-foreground'>
                  Fonctionnalités à venir...
              </div>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default ProfileTab
