import { Group, Select } from "@mantine/core";
import {
  YearPickerInput,
  MonthPickerInput,
  DateInput,
  DatePickerInput,
} from "@mantine/dates";
import dayjs from "dayjs";

const MODES = [
  { value: "all", label: "All time" },
  { value: "year", label: "Year" },
  { value: "month", label: "Month" },
  { value: "date", label: "Specific date" },
  { value: "range", label: "Date range" },
];

const fmt = (v) => (v ? dayjs(v).format("YYYY-MM-DD") : undefined);

export function PeriodFilter({ period = { mode: "all" }, onChange }) {
  const yearValue = period.year ? `${period.year}-01-01` : null;
  const monthValue =
    period.year && period.month
      ? `${period.year}-${String(period.month).padStart(2, "0")}-01`
      : null;

  return (
    <Group gap="sm" align="flex-end" wrap="wrap">
      <Select
        label="Period"
        data={MODES}
        value={period.mode}
        onChange={(v) => v && onChange({ mode: v })} // switching mode clears other fields
        allowDeselect={false}
        w={150}
        comboboxProps={{ withinPortal: true, zIndex: 300 }}
      />

      {period.mode === "year" && (
        <YearPickerInput
          label="Year"
          placeholder="Pick year"
          value={yearValue}
          onChange={(v) => onChange({ mode: "year", year: v ? dayjs(v).year() : undefined })}
          w={140}
          clearable
          popoverProps={{ withinPortal: true, zIndex: 300 }}
        />
      )}

      {period.mode === "month" && (
        <MonthPickerInput
          label="Month"
          placeholder="Pick month"
          value={monthValue}
          onChange={(v) =>
            onChange({
              mode: "month",
              year: v ? dayjs(v).year() : undefined,
              month: v ? dayjs(v).month() + 1 : undefined,
            })
          }
          w={180}
          clearable
          popoverProps={{ withinPortal: true, zIndex: 300 }}
        />
      )}

      {period.mode === "date" && (
        <DateInput
          label="Date"
          placeholder="Pick date"
          value={period.date || null}
          onChange={(v) => onChange({ mode: "date", date: fmt(v) })}
          valueFormat="DD MMM YYYY"
          w={170}
          clearable
          popoverProps={{ withinPortal: true, zIndex: 300 }}
        />
      )}

      {period.mode === "range" && (
        <DatePickerInput
          type="range"
          label="Range"
          placeholder="Pick range"
          value={[period.from || null, period.to || null]}
          onChange={([from, to]) =>
            onChange({ mode: "range", from: fmt(from), to: fmt(to) })
          }
          valueFormat="DD MMM YYYY"
          w={260}
          clearable
          popoverProps={{ withinPortal: true, zIndex: 300 }}
        />
      )}
    </Group>
  );
}

export default PeriodFilter;
