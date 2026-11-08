import { pb } from "./PocketBase";

interface ToolsConst {
  name: string;
  string_value: string;
  number_value: number;
  /** JSON-значение константы; формат зависит от `name`. */
  json_value?: unknown;
}

export default async (urlName: string[]) => {
  const [url, name] = urlName;
  const res = await pb.collection<ToolsConst>(url).getFullList({
    filter: `name = "${name}"`,
  });

  return res[0];
};
