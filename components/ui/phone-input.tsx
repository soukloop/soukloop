import { forwardRef, useState, useMemo } from "react";
import PhoneInput, { getCountryCallingCode, Country, getCountries } from "react-phone-number-input";
import en from "react-phone-number-input/locale/en.json";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";

// Custom Input component to forward props to Shadcn Input
const CustomInput = forwardRef<HTMLInputElement, any>((props, ref) => {
  return (
    <Input
      {...props}
      ref={ref}
      className={cn(
        "border-0 shadow-none focus-visible:ring-0 rounded-l-none bg-transparent h-full",
        props.className
      )}
    />
  );
});
CustomInput.displayName = "CustomInput";

interface PhoneInputProps {
  value: string;
  onChange: (value?: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function StyledPhoneInput({ value, onChange, className, placeholder, disabled }: PhoneInputProps) {
  const [country, setCountry] = useState<Country | undefined>('US');

  return (
    <div
      className={cn(
        // Common input styles applied to the container
        "flex w-full items-center rounded-xl border border-input bg-background ring-offset-background transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden px-1",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <style jsx global>{`
        .PhoneInput {
          display: flex;
          align-items: center;
          width: 100%;
          gap: 0;
        }
        /* Hide default country selectors from the library since we use our own */
        .PhoneInputCountry {
          display: none; 
        }
        .PhoneInputInput {
          flex: 1 1;
          min-width: 0;
          background: transparent;
        }
      `}</style>

      {/* Custom Country Select */}
      <CountrySelect
        value={country}
        onChange={(c) => setCountry(c)}
        disabled={disabled}
      />

      <PhoneInput
        defaultCountry="US"
        value={value}
        onChange={onChange}
        onCountryChange={setCountry}
        country={country}
        placeholder={placeholder}
        disabled={disabled}
        inputComponent={CustomInput}
        className="w-full h-10 border-none bg-transparent"
      />
    </div>
  );
}

const CountrySelect = ({ value, onChange, disabled }: { value: Country | undefined, onChange: (value: Country) => void, disabled?: boolean }) => {
  const [open, setOpen] = useState(false)

  const callingCode = value ? getCountryCallingCode(value) : '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          role="combobox"
          aria-expanded={open}
          className="flex shrink-0 items-center gap-1 rounded-l-lg pl-3 pr-1 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50 outline-none"
          type="button"
        >
          <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-slate-100 items-center justify-center text-xs border border-slate-200">
            {value && (
              <img
                src={`https://catamphetamine.gitlab.io/country-flag-icons/3x2/${value}.svg`}
                alt={value}
                className="h-full w-full object-cover"
              />
            )}
          </span>
          <span className="text-muted-foreground ml-1">+{callingCode}</span>
          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start" side="bottom">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              <CountryListContent onSelect={(c) => {
                onChange(c);
                setOpen(false);
              }} selectedCountry={value} />
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const CountryListContent = ({ onSelect, selectedCountry }: { onSelect: (c: Country) => void, selectedCountry: Country | undefined }) => {
  const countries = getCountries();

  return (
    <>
      {countries.map((country) => (
        <CommandItem
          key={country}
          value={`${en[country]} ${getCountryCallingCode(country)}`}
          onSelect={() => onSelect(country)}
        >
          <span className="mr-2 flex h-4 w-6 shrink-0 overflow-hidden rounded-sm border border-slate-200">
            <img
              src={`https://catamphetamine.gitlab.io/country-flag-icons/3x2/${country}.svg`}
              alt={country}
              className="h-full w-full object-cover"
            />
          </span>
          <span className="flex-1 truncate">{en[country]}</span>
          <span className="ml-2 text-muted-foreground text-xs">+{getCountryCallingCode(country)}</span>
          <Check
            className={cn(
              "ml-auto h-4 w-4",
              selectedCountry === country ? "opacity-100" : "opacity-0"
            )}
          />
        </CommandItem>
      ))}
    </>
  )
}
