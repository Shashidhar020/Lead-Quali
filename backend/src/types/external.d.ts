declare module 'pg' {
  export class Pool {
    constructor(config?: { connectionString?: string });
    query(sql: string, params?: any[]): Promise<{ rows: any[] }>;
  }
}

declare module 'bcryptjs' {
  const bcrypt: {
    hash(value: string, saltOrRounds: number): Promise<string>;
    compare(value: string, hash: string): Promise<boolean>;
  };

  export default bcrypt;
}
