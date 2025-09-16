// Modell för projekt
export interface Project {
  id: number; // Projektets unika ID
  name: string; // Namn på projektet
  description: string; // Beskrivning av projektet
  creatorId: number; // ID för skaparen av projektet
  userIds: number[]; // Lista med användar-ID:n som är kopplade till projektet
}
