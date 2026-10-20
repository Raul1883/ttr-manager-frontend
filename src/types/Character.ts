import type { Layout } from "react-grid-layout";
import type { Section } from "../pages/characters/types/CharacterSheet";

export type CharacterGet = {
  id: string;
  user_id: string;

  name: string;
  data_fields: Record<string, any>;
};

export interface Character {
  id: string;
  name: string;
  owner: string;
  list_schema: string;
  data_fiels: Record<string, any>;
}

export interface CharacterWithSchema {
  id: string;
  name: string;
  owner: string;
  list_schema: string;
  data_fiels: Record<string, any>;
  expand: {
    list_schema: {
      name: string;
      schema: {
        layout: Layout;
        sections: Section[];
      };
    };
  };
}
