import { api } from './client';

export interface SOSPayload {
  trip_id?: string;
  latitude: number;
  longitude: number;
  message?: string;
}

export interface IncidentReportPayload {
  trip_id?: string;
  incident_type: string;
  description: string;
  latitude?: number;
  longitude?: number;
}

export const safetyApi = {
  // Trigger SOS Emergency Alert
  triggerSOS: async (data: SOSPayload) => {
    const response = await api.post('/safety/sos', data);
    return response.data;
  },

  // Submit safety incident report
  submitReport: async (data: IncidentReportPayload) => {
    const response = await api.post('/safety/report', data);
    return response.data;
  },

  // List safety incidents
  listIncidents: async () => {
    const response = await api.get('/safety/incidents');
    return response.data;
  },
};
