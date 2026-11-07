import { useEffect } from "react";
import {
  Modal,
  Stack,
  TextInput,
  NumberInput,
  Select,
  Button,
  Group,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import dayjs from "dayjs";

function buildInitial(record) {
  return {
    customerName: record?.customerName ?? "",
    amount: record?.amount ?? "",
    serviceType: record?.serviceType ?? "",
    date: record?.date ? dayjs(record.date).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
  };
}

export function IncomeFormModal({ opened, onClose, record, serviceTypes = [], onSubmit, submitting }) {
  const isEdit = Boolean(record);

  const form = useForm({
    initialValues: buildInitial(record),
    validate: {
      customerName: (v) =>
        !v || !v.trim()
          ? "Customer name is required"
          : v.trim().length > 120
          ? "Max 120 characters"
          : null,
      amount: (v) =>
        v === "" || v === null || v === undefined
          ? "Amount is required"
          : Number(v) <= 0
          ? "Amount must be greater than 0"
          : null,
      serviceType: (v) => (!v ? "Select a service type" : null),
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
      customerName: values.customerName.trim(),
      amount: Number(values.amount),
      serviceType: values.serviceType,
      date: dayjs(values.date).format("YYYY-MM-DD"),
    };
    onSubmit(payload);
  });

  return (
    <Modal opened={opened} onClose={onClose} title={isEdit ? "Edit income" : "Add income"} centered>
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Customer name"
            placeholder="e.g. Asha Rao"
            withAsterisk
            data-autofocus
            {...form.getInputProps("customerName")}
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
          <Select
            label="Service type"
            placeholder="Select a service"
            withAsterisk
            searchable
            data={serviceTypes}
            {...form.getInputProps("serviceType")}
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
              {isEdit ? "Save changes" : "Add income"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default IncomeFormModal;
