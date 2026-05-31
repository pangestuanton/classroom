export interface Course {
  id: string;
  name: string;
}

export interface GoogleUserProfile {
  name: string;
  email: string;
  picture?: string;
}

export interface GoogleClassroomConfig {
  clientId: string;
  apiKey: string;
  discoveryDoc: string;
  scopes: string;
}
