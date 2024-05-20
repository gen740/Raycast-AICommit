import {
  Clipboard,
  Detail,
  AI,
  environment,
  ActionPanel,
  Action,
} from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useState } from "react";

const PREFIX_PROMPT = `
Write commit message for the change with commitizen convention.
  Make sure the title has maximum 50 characters and message is wrapped at 72 characters.
  Do not wrap the whole message in code block.
--- Diff start here ---
`;

const POSTFIX_PROMPT = `
--- Diff end here ---
`;

const AIChat = () => {
  const [commitMessage, setCommitMessage] = useState("");
  const { isLoading } = usePromise(async () => {
    const stream = AI.ask(
      `${PREFIX_PROMPT}\n${(await Clipboard.read()).text}\n${POSTFIX_PROMPT}`,
      { model: "openai-gpt-4o" },
    );
    stream.on("data", (data) => {
      setCommitMessage((x) => x + data);
    });
    await stream;
  }, []);

  return (
    <Detail
      isLoading={isLoading}
      markdown={`# Commit message\n\n\`\`\`gitcommit\n${commitMessage.trim()}\n\`\`\``}
      actions={
        <ActionPanel>
          {isLoading ? (
            <></>
          ) : (
            <Action.CopyToClipboard
              title="Copy to clipboard"
              content={commitMessage.trim()}
            />
          )}
        </ActionPanel>
      }
    />
  );
};

export default function Command() {
  if (!environment.canAccess(AI)) {
    return <Detail markdown="Please enabled AI feature" />;
  }
  return <AIChat />;
}
