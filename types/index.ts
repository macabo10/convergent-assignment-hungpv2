export interface Persona {
  id: string;
  name: string;
  role: string;
  tone: string;
  o_score: number;
  c_score: number;
  e_score: number;
  a_score: number;
  n_score: number;
}

export interface Scenario {
  id: string;
  service: string;
  subject: string;
  notes: string;
  initial_message: string;
}

export interface Message {
  id: string;
  simulation_id: string;
  sender_type: 'user' | 'persona' | 'hint';
  content: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
}