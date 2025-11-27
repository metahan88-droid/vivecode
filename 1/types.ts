export interface ProcessedImage {
  original: string; // Base64
  generated: string; // Base64
  prompt: string;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}