export class PhoneNumber {
  private readonly value: string;

  constructor(phoneNumber: string) {
    const cleaned = this.clean(phoneNumber);
    if (!this.isValid(cleaned)) {
      throw new Error('Invalid phone number format');
    }
    this.value = cleaned;
  }

  private clean(phoneNumber: string): string {
    // Remove all non-digit characters
    return phoneNumber.replace(/\D/g, '');
  }

  private isValid(phoneNumber: string): boolean {
    // Accept 10-15 digit phone numbers
    return phoneNumber.length >= 10 && phoneNumber.length <= 15;
  }

  getValue(): string {
    return this.value;
  }

  getFormatted(): string {
    // Simple formatting, can be customized based on locale
    if (this.value.length === 10) {
      return `(${this.value.slice(0, 3)}) ${this.value.slice(3, 6)}-${this.value.slice(6)}`;
    }
    return this.value;
  }

  equals(other: PhoneNumber): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
