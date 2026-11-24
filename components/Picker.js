export default function Picker({ label, options, value, onChange }) {
  return (
    <fieldset className="picker">
      <legend>{label}</legend>
      <div>
        {options.map((o) => (
          <button type="button" key={o.id ?? o} className={`chip ${value === (o.id ?? o) ? "on" : ""}`} onClick={() => onChange(o.id ?? o)} aria-pressed={value === (o.id ?? o)}>
            {o.name ?? o}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function MultiPicker({ label, options, values, onToggle, isDisabled }) {
  return (
    <fieldset className="picker">
      <legend>{label} <small>choose one or more</small></legend>
      <div>
        {options.map((o) => {
          const on = values.includes(o.id);
          return (
            <button type="button" key={o.id} disabled={isDisabled ? isDisabled(o.id) : false} className={`chip ${on ? "on" : ""}`} aria-pressed={on} onClick={() => onToggle(o.id)}>
              {o.name}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
