export interface ApplicationRecord {
  id: string;
  character: string;
  comment: string;
  created: string;
  session: string;
  user: string;
  expand?: {
    session?: ExpandedRecord;
    character?: ExpandedRecord;
    user?: ExpandedRecord;
  };
}

export interface ExpandedRecord {
  id: string;
  name?: string;
  title?: string;
  [key: string]: any;
}
