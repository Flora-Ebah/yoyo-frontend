export interface ProfileHeaderType {
  fullName: string
  coverImg: string
  profileImg: string
  designation: string
  designationIcon?: string
  location: string
  joiningDate: string
}

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

export interface ProfileTabType {
  about: ProfileCommonType[]
  contacts: ProfileCommonType[]
  teams: ProfileTeamsType[]
  overview: ProfileCommonType[]
}

export interface Data {
  profileHeader: ProfileHeaderType
  userProfile: ProfileTabType
}
