export interface Actor {
  name?: string;
  description?: string;
  attributes?: {
    [attribute: string]: {
      name: string;
      die: number;
      mod: number;
    };
  };
  skills?: {
    [skillName: string]: {
      name: string;
      die: number;
      mod: number;
    };
  };
  derivedStats?: {
    pace: number;
    parry: number;
    toughness: {
      value: number;
      armor: number;
    };
  };
  hindrances?: {
    [hindranceName: string]: {
      name: string;
      major: boolean;
      note: string;
    };
  };
  edges?: string[];
  gear?: string[];
  special_abilities?: {
    [abilityName: string]: string;
  };
}
