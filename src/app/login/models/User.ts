// login/models/User.ts
export class User {
  constructor(
    public id: string,
    public email: string,
    public name?: string,
    public createdAt?: Date
  ) {}

  static fromResponse(data: any): User {
    return new User(
      data.userId || data.id,
      data.user?.email || data.email,
      data.user?.name || data.name,
      data.user?.createdAt ? new Date(data.user.createdAt) : undefined
    );
  }

  get displayName(): string {
    return this.name || this.email.split('@')[0];
  }

  isEmailVerified(): boolean {
    // Logic để check email verified
    return true;
  }
}
