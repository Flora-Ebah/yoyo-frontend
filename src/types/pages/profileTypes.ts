import type { ChipProps } from '@mui/material/Chip'
import type { User } from '@/services/user.service'

export interface ProfileCommonType {
  icon: string
  property: string
  value: string
}

export interface ProfileTeamsType {
  property: string
  value: string
  icon: string
  color: string
}

export interface ProfileConnectionsType {
  isFriend: boolean
  connections: string
  name: string
  avatar: string
}

export interface ProfileTeamsTechType {
  id: string
  title: string
  avatar: string
  members: number
  chipText: string
  chipColor: ChipColor
}

export interface ProjectTableType {
  id: number
  title: string
  subtitle: string
  leader: string
  avatar: string
  avatarGroup: string[]
  status: number
  actions: string
}

export interface ProfileTabType {
  about: ProfileCommonType[]
  contacts: ProfileCommonType[]
  teams: ProfileTeamsType[]
  overview: ProfileCommonType[]
  connections?: ProfileConnectionsType[]
  teamsTech?: ProfileTeamsTechType[]
  projectTable?: ProjectTableType[]
}

export interface Data {
  user: User
  userProfile: ProfileTabType
}
type ChipColor = ChipProps['color']

export interface ProfileChipType {
  title: string
  color: ChipColor
}

export interface ProfileAvatarPersonType {
  name: string
  avatar: string
}

export interface ConnectionsTabType {
  avatar: string
  name: string
  designation: string
  chips: ProfileChipType[]
  projects: number | string
  tasks: number | string
  connections: number | string
  isConnected: boolean
}

export interface TeamsTabType {
  avatar: string
  title: string
  description: string
  avatarGroup: ProfileAvatarPersonType[]
  extraMembers?: number
  chips: ProfileChipType[]
}

export interface ProjectsTabType {
  avatar: string
  title: string
  client: string
  budgetSpent: string
  budget: string
  startDate: string
  deadline: string
  description: string
  hours: string
  daysLeft: number
  chipColor: ChipColor
  completedTask: number
  totalTask: number
  avatarGroup: ProfileAvatarPersonType[]
  members: string
  comments: number | string
}

export type ProjectTableRowType = ProjectTableType


