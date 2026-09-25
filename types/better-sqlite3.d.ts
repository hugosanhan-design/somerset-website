declare module 'better-sqlite3' {
  namespace Database {
    interface Database {
      prepare(sql: string): Statement
      exec(sql: string): void
      pragma(pragma: string): unknown
      close(): void
      transaction<F extends (...args: any[]) => any>(fn: F): F
    }
    interface Statement {
      run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint }
      get(...params: unknown[]): unknown
      all(...params: unknown[]): unknown[]
    }
  }
  class Database {
    constructor(path: string, options?: object)
    prepare(sql: string): Database.Statement
    exec(sql: string): void
    pragma(pragma: string): unknown
    close(): void
    transaction<F extends (...args: any[]) => any>(fn: F): F
  }
  export = Database
}
