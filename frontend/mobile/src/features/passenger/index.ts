export * from './search';

export interface PassengerFeatureState {
  currentSearch?: {
    origin: string;
    destination: string;
    date: string;
  };
}
