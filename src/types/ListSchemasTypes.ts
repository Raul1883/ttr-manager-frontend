import type { ListSchema } from "../pages/characters/types/CharacterSheet";

export interface ListSchemaPreview {
  id: string;
  name: string;
}

export interface ListSchemaRead {
  id: string;
  name: string;
  schema: ListSchema;
}
