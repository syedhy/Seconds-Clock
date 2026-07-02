import {
  Action,
  ActionPanel,
  Form,
  Toast,
  closeMainWindow,
  showHUD,
  showToast,
} from "@raycast/api";

import {
  createTimerActivity,
  durationPartsToMs,
  saveActiveActivity,
} from "../lib/activity";

type TimerFormValues = {
  name: string;
  hours: string;
  minutes: string;
  seconds: string;
};

export function TimerForm() {
  async function submitTimer(values: TimerFormValues) {
    const durationMs = durationPartsToMs(
      values.hours,
      values.minutes,
      values.seconds,
    );

    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Enter a valid timer duration",
        message: "Use whole numbers for hours, minutes, or seconds.",
      });
      return false;
    }

    await saveActiveActivity(createTimerActivity(durationMs, values.name));
    await showHUD("Timer Started");
    await closeMainWindow({ clearRootSearch: true });
  }

  return (
    <Form
      navigationTitle="Set Timer"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Start Timer" onSubmit={submitTimer} />
        </ActionPanel>
      }
    >
      <Form.TextField id="name" title="Name" placeholder="Optional, e.g. Tea" />
      <Form.TextField
        id="hours"
        title="Hours"
        placeholder="0"
        defaultValue="0"
      />
      <Form.TextField
        id="minutes"
        title="Minutes"
        placeholder="30"
        defaultValue="30"
      />
      <Form.TextField
        id="seconds"
        title="Seconds"
        placeholder="0"
        defaultValue="0"
      />
    </Form>
  );
}
