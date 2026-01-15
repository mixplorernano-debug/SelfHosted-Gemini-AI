
export interface Command {
  command: string;
  description: string;
}

export interface CommandSection {
  title: string;
  commands: Command[];
}
