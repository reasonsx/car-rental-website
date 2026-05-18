import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";

export const EMAIL_MAX_LENGTH = 254;
export const NAME_MAX_LENGTH = 100;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;
export const BCRYPT_MAX_BYTES = 72;

const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

export function noHtmlTagsValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? "");
    return value && HTML_TAG_PATTERN.test(value) ? { htmlTag: true } : null;
  };
}

export function noControlCharactersValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? "");
    return value && CONTROL_CHARACTER_PATTERN.test(value) ? { controlCharacter: true } : null;
  };
}

export function maxUtf8BytesValidator(maxBytes: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? "");
    const byteLength = new TextEncoder().encode(value).length;

    return byteLength > maxBytes
      ? { maxUtf8Bytes: { requiredLength: maxBytes, actualLength: byteLength } }
      : null;
  };
}

export const nameValidators = [
  Validators.required,
  Validators.minLength(3),
  Validators.maxLength(NAME_MAX_LENGTH),
  noHtmlTagsValidator(),
  noControlCharactersValidator(),
];

export const emailValidators = [
  Validators.required,
  Validators.email,
  Validators.maxLength(EMAIL_MAX_LENGTH),
  noHtmlTagsValidator(),
  noControlCharactersValidator(),
];

export const loginPasswordValidators = [Validators.required];

export const newPasswordValidators = [
  Validators.required,
  Validators.minLength(PASSWORD_MIN_LENGTH),
  Validators.maxLength(PASSWORD_MAX_LENGTH),
  maxUtf8BytesValidator(BCRYPT_MAX_BYTES),
  noHtmlTagsValidator(),
  noControlCharactersValidator(),
];
