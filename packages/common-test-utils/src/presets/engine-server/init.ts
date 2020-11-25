import {
  ENGINE_ERROR_CODES,
  NotePropsV2,
  NoteUtilsV2,
} from "@dendronhq/common-all";
import { FileTestUtils } from "../../fileUtils";
import { TestPresetEntryV4 } from "../../utilsv2";
import { NOTE_PRESETS_V4 } from "../notes";
import fs from "fs-extra";
import { vault2Path } from "@dendronhq/common-server";
import path from "path";

const NOTES = {
  DOMAIN_STUB: new TestPresetEntryV4(
    async ({ wsRoot, vaults, engine }) => {
      const noteRoot = NoteUtilsV2.getNoteByFnameV4({
        fname: "root",
        notes: engine.notes,
        vault: vaults[0],
      }) as NotePropsV2;

      const noteChild = NoteUtilsV2.getNoteByFnameV4({
        fname: "foo",
        notes: engine.notes,
        vault: vaults[0],
      }) as NotePropsV2;
      const checkVault = await FileTestUtils.assertInVault({
        wsRoot,
        vault: vaults[0],
        match: ["foo.ch1.md"],
        nomatch: ["foo.md"],
      });
      return [
        {
          actual: noteRoot.children,
          expected: [noteChild.id],
        },
        {
          actual: checkVault,
          expected: true,
        },
      ];
    },
    {
      preSetupHook: async ({ vaults, wsRoot }) => {
        await NOTE_PRESETS_V4.NOTE_SIMPLE_CHILD.create({
          wsRoot,
          vault: vaults[0],
        });
      },
    }
  ),
  NOTE_WITH_CUSTOM_ATT: new TestPresetEntryV4(
    async ({ vaults, engine }) => {
      const noteRoot = NoteUtilsV2.getNoteByFnameV4({
        fname: "foo",
        notes: engine.notes,
        vault: vaults[0],
      }) as NotePropsV2;

      return [
        {
          actual: noteRoot.fname,
          expected: "foo",
        },
        {
          actual: noteRoot.custom,
          expected: { bond: 42 },
        },
      ];
    },
    {
      preSetupHook: async ({ vaults, wsRoot }) => {
        await NOTE_PRESETS_V4.NOTE_WITH_CUSTOM_ATT.create({
          wsRoot,
          vault: vaults[0],
        });
      },
    }
  ),
  BAD_PARSE: new TestPresetEntryV4(
    async ({ initResp }) => {
      return [
        {
          actual: initResp.error?.status,
          expected: ENGINE_ERROR_CODES.BAD_PARSE_FOR_NOTE,
        },
      ];
    },
    {
      preSetupHook: async ({ vaults, wsRoot }) => {
        const vault = vaults[0];
        const vpath = vault2Path({ vault, wsRoot });
        fs.writeFileSync(path.join(vpath, "foo.md"), "---\nbar:\n--\nfoo");
      },
    }
  ),
};
export const ENGINE_INIT_PRESETS = {
  NOTES,
};
