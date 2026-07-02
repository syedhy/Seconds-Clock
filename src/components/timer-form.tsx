import {
  Action,
  ActionPanel,
  Form,
  Icon,
  Toast,
  closeMainWindow,
  showHUD,
  showToast,
} from "@raycast/api";

import {
  createTimerActivity,
  durationPartsToMs,
  saveActiveActivity,
  showActivityInMenuBar,
} from "../lib/activity";

type TimerFormValues = {
  preset: string;
  name: string;
  hours: string;
  minutes: string;
  seconds: string;
};

const CUSTOM_PRESET = "custom";

const PRESETS = [
  { title: "5 minutes", value: "300000" },
  { title: "10 minutes", value: "600000" },
  { title: "15 minutes", value: "900000" },
  { title: "30 minutes", value: "1800000" },
  { title: "45 minutes", value: "2700000" },
  { title: "1 hour", value: "3600000" },
];

export function TimerForm() {
  async function submitTimer(values: TimerFormValues) {
    const durationMs =
      values.preset === CUSTOM_PRESET
        ? durationPartsToMs(values.hours, values.minutes, values.seconds)
        : Number(values.preset);

    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Enter a valid timer duration",
        message: "Use whole numbers for hours, minutes, or seconds.",
      });
      return false;
    }

    await saveActiveActivity(createTimerActivity(durationMs, values.name));
    await showActivityInMenuBar();
    await showHUD("Timer Started");
    await closeMainWindow({ clearRootSearch: true });
  }

  return (
    <Form
      navigationTitle="Set Timer"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Start Timer"
            icon={Icon.Play}
            onSubmit={submitTimer}
          />
        </ActionPanel>
      }
    >
      <Form.Description text="Start one focused timer and show it in the menu bar." />
      <Form.TextField id="name" title="Name" placeholder="Optional, e.g. Tea" />
      <Form.Dropdown id="preset" title="Duration" defaultValue="1800000">
        {PRESETS.map((preset) => (
          <Form.Dropdown.Item
            key={preset.value}
            title={preset.title}
            value={preset.value}
            icon={Icon.Clock}
          />
        ))}
        <Form.Dropdown.Item
          title="Custom"
          value={CUSTOM_PRESET}
          icon={Icon.Gear}
        />
      </Form.Dropdown>
      <Form.Separator />
      <Form.Description text="Custom duration is used only when Duration is set to Custom." />
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
