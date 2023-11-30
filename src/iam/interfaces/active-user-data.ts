export interface ActiveUserData {
  /**
   * The user's id.
   */
  sub: number;
  /**
   * The user's email
   */
  email: string;

  /**
   * The user's role.
   */
  role: string;
}
