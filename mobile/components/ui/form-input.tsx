import * as React from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Input } from './input';
import { Field, FieldContent, FieldError, FieldLabel } from './field';

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad' | 'number-pad';
  multiline?: boolean;
  editable?: boolean;
  className?: string;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  secureTextEntry,
  autoCapitalize,
  keyboardType,
  multiline,
  editable,
  className,
}: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <Field invalid={!!error}>
          <FieldContent>
            <FieldLabel>{label}</FieldLabel>
            <Input
              onBlur={onBlur}
              onChangeText={onChange}
              value={value ?? ''}
              placeholder={placeholder}
              secureTextEntry={secureTextEntry}
              autoCapitalize={autoCapitalize}
              keyboardType={keyboardType}
              multiline={multiline}
              editable={editable}
              className={className}
            />
            <FieldError errors={error ? [error] : []} />
          </FieldContent>
        </Field>
      )}
    />
  );
}
