export type Application = {
  comment: string;
  character: string;
  user: string;
  session: string;
  expand?: {
    user?: {
      login: string;
      contact_info: string;
    };
  };
};

export type ApplicationPost = {
  session_id: number;
  character_id: number;
  comment: string;
};

export type ApplicationGet = {
  id: number;
  user_id: number;
  session_id: number;
  character_id: number;
  comment: string;
  status: string;
};

export interface ApplicationViaSession {
  character: string;
  comment: string;
  session: string;
  user: string;
}

export type ApplicationDataItem = {
  expand: {
    user: {
      login: string;
      contact_info: string;
    };
  };
  comment: string;
};

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
