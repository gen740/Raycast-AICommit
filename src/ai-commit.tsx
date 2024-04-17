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
Please create the commit message using following commit diff.
  - Commit should be start with ([Add], [Update], [Fix], [Delete], [Format], or any other if doesn't match.

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
      { model: "gpt-4" },
    );
    stream.on("data", (data) => {
      setCommitMessage((x) => x + data);
    });
    await stream;
  }, []);

  return (
    <Detail
      isLoading={isLoading}
      markdown={`# Commit message\n\n\`\`\`text\n${commitMessage.trim()}\n\`\`\``}
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
