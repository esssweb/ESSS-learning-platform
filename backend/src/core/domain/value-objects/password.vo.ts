export class Password {
  private readonly value: string;

  constructor(password: string, isHashed: boolean = false) {
    if (!isHashed && !this.isValid(password)) {
      throw new Error(
        'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character',
      );
    }
    this.value = password;
  }

  private isValid(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }
}
