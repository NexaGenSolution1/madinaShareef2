import DatePicker from "react-datepicker";
import { formatDateInput, parseMaskedDate } from "../../utils/dateInput";

export default function MaskedDatePicker({ value, onChange }) {
  return (
    <DatePicker
      selected={value}
      dateFormat="dd/MM/yyyy"
      placeholderText="DD/MM/YYYY"
      onChange={onChange}
      onChangeRaw={(e) => {
        const formatted = formatDateInput(e.target.value);
        e.target.value = formatted;

        const parsed = parseMaskedDate(formatted);
        if (parsed) onChange(parsed);
      }}
      onKeyDown={(e) => {
        const allowed = [
          "Backspace",
          "Tab",
          "ArrowLeft",
          "ArrowRight",
          "Delete",
        ];
        if (!allowed.includes(e.key) && !/\d/.test(e.key)) {
          e.preventDefault();
        }
      }}
      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
    />
  );
}
