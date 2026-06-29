"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const INPUT_CLS =
  "h-11 min-w-0 flex-1 rounded-s-none rounded-e-xl border-[var(--fb-ink)]/15 bg-[var(--fb-canvas-soft)] text-[var(--fb-ink)] placeholder:text-[var(--fb-mute)] focus-visible:border-[var(--fb-ink)] focus-visible:ring-0";

const COUNTRY_TRIGGER_CLS =
  "h-11 shrink-0 gap-1 rounded-s-xl rounded-e-none border-r-0 border-[var(--fb-ink)]/15 bg-[var(--fb-canvas-soft)] px-3 text-[var(--fb-ink)] hover:bg-[var(--fb-canvas-soft)] focus:z-10 focus-visible:border-[var(--fb-ink)] focus-visible:ring-0";

const PhoneInput = React.forwardRef(function PhoneInput(
  { className, onChange, value, defaultCountry = "IN", ...props },
  ref
) {
  return (
    <RPNInput.default
      ref={ref}
      className={cn("flex w-full min-w-0", className)}
      flagComponent={FlagComponent}
      countrySelectComponent={CountrySelect}
      inputComponent={InputComponent}
      smartCaret={false}
      defaultCountry={defaultCountry}
      value={value || undefined}
      onChange={(nextValue) => onChange?.(nextValue || "")}
      {...props}
    />
  );
});
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef(function InputComponent(
  { className, ...props },
  ref
) {
  return (
    <Input
      className={cn(INPUT_CLS, className)}
      {...props}
      ref={ref}
    />
  );
});
InputComponent.displayName = "InputComponent";

function CountrySelect({ disabled, value: selectedCountry, options: countryList, onChange }) {
  const scrollAreaRef = React.useRef(null);
  const [searchValue, setSearchValue] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Popover
      open={isOpen}
      modal
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) {
          setSearchValue("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={COUNTRY_TRIGGER_CLS}
          disabled={disabled}
          aria-label="Country code"
        >
          <FlagComponent country={selectedCountry} countryName={selectedCountry} />
          <ChevronsUpDown
            className={cn("-mr-1 size-4 opacity-50", disabled && "hidden")}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(300px,calc(100vw-2rem))] p-0" align="start">
        <Command>
          <CommandInput
            value={searchValue}
            onValueChange={(nextValue) => {
              setSearchValue(nextValue);
              setTimeout(() => {
                const viewportElement = scrollAreaRef.current?.querySelector(
                  "[data-radix-scroll-area-viewport]"
                );
                if (viewportElement) {
                  viewportElement.scrollTop = 0;
                }
              }, 0);
            }}
            placeholder="Search country..."
          />
          <CommandList>
            <ScrollArea ref={scrollAreaRef} className="h-72">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countryList.map(({ value, label }) =>
                  value ? (
                    <CountrySelectOption
                      key={value}
                      country={value}
                      countryName={label}
                      selectedCountry={selectedCountry}
                      onChange={onChange}
                      onSelectComplete={() => setIsOpen(false)}
                    />
                  ) : null
                )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function CountrySelectOption({
  country,
  countryName,
  selectedCountry,
  onChange,
  onSelectComplete,
}) {
  function handleSelect() {
    onChange(country);
    onSelectComplete();
  }

  return (
    <CommandItem className="gap-2" onSelect={handleSelect}>
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="text-sm text-foreground/50">
        +{RPNInput.getCountryCallingCode(country)}
      </span>
      <CheckIcon
        className={cn(
          "ml-auto size-4",
          country === selectedCountry ? "opacity-100" : "opacity-0"
        )}
      />
    </CommandItem>
  );
}

function FlagComponent({ country, countryName }) {
  const Flag = flags[country];

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg:not([class*='size-'])]:size-full">
      {Flag ? <Flag title={countryName} /> : null}
    </span>
  );
}

export { PhoneInput };
export default PhoneInput;
