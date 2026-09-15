import { useEffect, useRef, useState } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { json } from "@codemirror/lang-json";
import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import { getById } from "../../../API/Fetcher";
import type { ListSchemaRead } from "../../../types/ListSchemasTypes";
import { linter, type Diagnostic } from "@codemirror/lint";

import Ajv, { type ErrorObject } from "ajv";
import { parse, type Pointer } from "json-source-map";

import schema from "../../characters/schemas/system-schema.json";
import Help from "./Help";
import type {
  ArrayField,
  ListSchema,
  Field,
  Section,
} from "../../characters/types/CharacterSheet";
import { useUnsavedChangesWarning } from "../../../hooks/useUnsavedChangesWarning";
import { pb } from "../../../API/PocketBase";
import { message, Modal } from "antd";

const ajv = new Ajv({
  allErrors: true,
});

const validate = ajv.compile(schema);

export default () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorView | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  useUnsavedChangesWarning();

  const {
    data: rawData,
    isLoading,
    error,
    mutate,
  } = useSWR<ListSchemaRead>(["list_schemas", id], ([path, id]) => {
    return getById(path, id as string);
  });

  const data = {
    id: rawData?.id,
    name: rawData?.name,
    schema: rawData?.schema,
  };

  const jsonSchemaLinter = linter((view): any[] => {
    const text = view.state.doc.toString();

    try {
      const { data, pointers } = parse(text);

      const valid = validate(data);

      const duplicateDiagnostics = getDublicateKeys(data, pointers);

      if (valid && duplicateDiagnostics.length === 0) return [];

      const schemaDiagnostics = valid
        ? []
        : (validate.errors || []).map((err) => {
            const path = getErrorPath(err);

            const pointer =
              pointers[path] || pointers[err.instancePath] || pointers[""];

            const from = pointer?.value?.pos ?? 0;
            const to = pointer?.valueEnd?.pos ?? text.length;

            return {
              from,
              to,
              severity: "error",
              message: `${err.instancePath || "/"} ${err.message}`,
            };
          });

      return [...schemaDiagnostics, ...duplicateDiagnostics];
    } catch (e) {
      return [
        {
          from: 0,
          to: text.length,
          severity: "error",
          message: "Invalid JSON",
        },
      ];
    }
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: JSON.stringify(data ?? {}, null, 2),
      extensions: [basicSetup, json(), jsonSchemaLinter],
    });

    if (editorRef.current) {
      editorRef.current.destroy();
    }

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    editorRef.current = view;

    return () => {
      view.destroy();
    };
  }, [data]);

  if (isLoading) return "Загрузка";
  if (error) return "Ошибка";

  const handleSave = async () => {
    if (!editorRef.current) return;

    const text = editorRef.current.state.doc.toString();

    try {
      const parsed = JSON.parse(text);

      if (!id) {
        return;
      }
      await pb.collection("list_schemas").update(id, parsed);

      mutate();
      message.info("Сохранено");
    } catch (err) {
      console.error("Invalid JSON");
    }
  };

  const hadleExit = () => {
    const confirmExit = window.confirm(
      "Вы уверены, что хотите выйти? Все несохраненные изменения будут потеряны.",
    );
    if (confirmExit) {
      navigate(-1);
    }
  };

  return (
    <div>
      <div className="h-12 fixed top-0 left-0 right-0 bg-white shadow-md z-10">
        <div className="text-xl px-4 py-2 flex justify-between">
          <button onClick={hadleExit} className="px-2 ">
            Редактор схем
          </button>
          <button onClick={() => setModalOpen(true)}>Помощь</button>
          <button onClick={handleSave}>Сохранить</button>
          <button onClick={hadleExit} className="px-2 ">
            Выйти
          </button>
        </div>
      </div>

      <div ref={containerRef} className="pt-12">
        {" "}
      </div>
      <Modal open={modalOpen} onCancel={() => setModalOpen(false)}>
        <Help />
      </Modal>
    </div>
  );
};

function getErrorPath(err: ErrorObject): string {
  if (
    err.keyword === "required" &&
    typeof err.params === "object" &&
    "missingProperty" in err.params
  ) {
    return `${err.instancePath}/${err.params.missingProperty}`;
  }

  return err.instancePath || "";
}

type DuplicateEntry = {
  key: string;
  path: string;
};

const getDublicateKeys = (
  schemaRead: ListSchema,
  pointers: Record<string, Pointer>,
): Diagnostic[] => {
  if (!schemaRead) return [];

  const schema = schemaRead.schema;

  const diagnostics: Diagnostic[] = [];

  // Глобальные ключи обычных полей
  const globalFields = new Map<string, DuplicateEntry[]>();

  // Заголовки секций
  const sectionTitles = new Map<string, DuplicateEntry[]>();

  schema.sections.forEach((section: Section, sectionIndex: number) => {
    // section titles

    const sectionEntry = {
      key: section.title,
      path: `/schema/sections/${sectionIndex}/title`,
    };

    const existingSection = sectionTitles.get(section.title) || [];

    existingSection.push(sectionEntry);

    sectionTitles.set(section.title, existingSection);

    // global fields

    section.fields.forEach((field: Field, fieldIndex: number) => {
      const fieldEntry = {
        key: field.label,
        path: `/schema/sections/${sectionIndex}/fields/${fieldIndex}/key`,
      };

      const existing = globalFields.get(field.label) || [];

      existing.push(fieldEntry);

      globalFields.set(field.label, existing);

      // array scoped fields

      if (field.type === "array") {
        const arrayScoped = new Map<string, DuplicateEntry[]>();

        (field as ArrayField).itemSchema.forEach(
          (arrField: Field, arrFieldIndex: number) => {
            const arrEntry = {
              key: arrField.label,
              path: `/schema/sections/${sectionIndex}/fields/${fieldIndex}/itemSchema/${arrFieldIndex}/key`,
            };

            const existingArr = arrayScoped.get(arrField.label) || [];

            existingArr.push(arrEntry);

            arrayScoped.set(arrField.label, existingArr);
          },
        );

        for (const [key, entries] of arrayScoped) {
          if (entries.length > 1) {
            entries.forEach((entry) => {
              const pointer = pointers[entry.path];

              diagnostics.push({
                from: pointer?.value?.pos ?? 0,
                to: pointer?.valueEnd?.pos ?? 0,
                severity: "error",
                message: `Duplicate array field key: ${key}`,
              });
            });
          }
        }
      }
    });
  });

  // global duplicates

  for (const [key, entries] of globalFields) {
    if (entries.length > 1) {
      entries.forEach((entry) => {
        const pointer = pointers[entry.path];

        diagnostics.push({
          from: pointer?.value?.pos ?? 0,
          to: pointer?.valueEnd?.pos ?? 0,
          severity: "error",
          message: `Duplicate field key: ${key}`,
        });
      });
    }
  }

  // duplicate section titles

  for (const [key, entries] of sectionTitles) {
    if (entries.length > 1) {
      entries.forEach((entry) => {
        const pointer = pointers[entry.path];

        diagnostics.push({
          from: pointer?.value?.pos ?? 0,
          to: pointer?.valueEnd?.pos ?? 0,
          severity: "error",
          message: `Duplicate section title: ${key}`,
        });
      });
    }
  }

  return diagnostics;
};
