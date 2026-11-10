import { useEffect } from "react";
import {
  Modal,
  Stack,
  Autocomplete,
  NumberInput,
  Textarea,
  Button,
  Group,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import dayjs from "dayjs";

function buildInitial(record) {
  return {
    source: record?.source ?? "",
    amount: record?.amount ?? "",
    note: record?.note ?? "",
    date: record?.date ? dayjs(record.date).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
  };
}

export function PaymentFormModal({ opened, onClose, record, sources = [], onSubmit, submitting }) {
  const isEdit = Boolean(record);

  const form = useForm({
    initialValues: buildInitial(record),
    validate: {
      source: (v) =>
        !v || !v.trim()
          ? "Source is required"
          : v.trim().length > 120
          ? "Max 120 characters"
          : null,
      amount: (v) =>
        v === "" || v === null || v === undefined
          ? "Amount is required"
          : Number(v) <= 0
          ? "Amount must be greater than 0"
          : null,
      note: (v) => (v && v.trim().length > 300 ? "Max 300 characters" : null),
      date: (v) => (!v ? "Date is required" : null),
    },
  });

  // Reset the form whenever the modal opens (for a new record or a different row).
  useEffect(() => {
    if (opened) form.setValues(buildInitial(record));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, record]);

  const handleSubmit = form.onSubmit((values) => {
    const payload = {
      source: values.source.trim(),
      amount: Number(values.amount),
      note: values.note?.trim() || "",
      date: dayjs(values.date).format("YYYY-MM-DD"),
    };
    onSubmit(payload);
  });

  return (
    <Modal opened={opened} onClose={onClose} title={isEdit ? "Edit payment" : "Add payment"} centered>
      <form onSubmit={handleSubmit}>
        <Stack>
          <Autocomplete
            label="Source"
            placeholder="e.g. Rent, Electricity, Fuel"
            withAsterisk
            data-autofocus
            data={sources}
            {...form.getInputProps("source")}
          />
          <NumberInput
            label="Amount"
            placeholder="0"
            withAsterisk
            min={0}
            decimalScale={2}
            prefix="₹ "
            thousandSeparator=","
            {...form.getInputProps("amount")}
          />
          <Textarea
            label="Note"
            placeholder="Optional — e.g. invoice no., who was paid"
            autosize
            minRows={2}
            maxRows={4}
            {...form.getInputProps("note")}
          />
          <DateInput
            label="Date"
            withAsterisk
            valueFormat="DD MMM YYYY"
            maxDate={dayjs().format("YYYY-MM-DD")}
            {...form.getInputProps("date")}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {isEdit ? "Save changes" : "Add payment"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default PaymentFormModal;
