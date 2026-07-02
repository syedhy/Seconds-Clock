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
  addTimer,
  parseDurationInput,
  showActivityInMenuBar,
} from "../lib/activity";

type TimerFormValues = {
  preset: string;
  name: string;
  customDuration: string;
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
        ? parseDurationInput(values.customDuration)
        : Number(values.preset);

    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Enter a valid timer duration",
        message: "Try 30m, 30m 20s, 1h 5m, or 1:30:00.",
      });
      return false;
    }

    await addTimer(durationMs, values.name);
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
      <Form.Description text="Start a named timer. Multiple timers can run at the same time." />
      <Form.TextField
        id="name"
        title="Timer Name"
        placeholder="Optional, e.g. Tea, Laundry, Break"
      />
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
      <Form.TextField
        id="customDuration"
        title="Custom Duration"
        placeholder="30m 20s, 1h 5m, or 1:30:00"
        defaultValue="30m"
      />
      <Form.Description text="Custom Duration is used only when Duration is set to Custom." />
    </Form>
  );
}
