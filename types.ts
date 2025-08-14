export enum Sender {
  USER = 'user',
  BOT = 'bot',
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  sources?: GroundingSource[];
}