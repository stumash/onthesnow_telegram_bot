import sqlite3, { Statement } from "sqlite3";
sqlite3.verbose();

/**
 * Access persisted user data. Encapsulates db.
 *
 * async getUsers() -> User[]
 * async addUser(user: User): boolean
 * async removeUser(user: User): void
 */
class DataStore {
  private db: sqlite3.Database;
  private addUserStmt: sqlite3.Statement;
  private delUserStmt: sqlite3.Statement;

  private constructor(
    db: sqlite3.Database,
    addUserStmt: sqlite3.Statement,
    delUserStmt: sqlite3.Statement
  ) {
    this.db = db;
    this.addUserStmt = addUserStmt;
    this.delUserStmt = delUserStmt;
  }

  static async asyncConstructor(): Promise<DataStore> {
    return new Promise((resolve) => {
      // connect to the db
      const db = new sqlite3.Database("db.db");

      // Initialize an empty table if it doesn't already exist, else no-op
      db.serialize(() => {
        db.run(
          "CREATE TABLE IF NOT EXISTS Users (" +
            "telegram_id PRIMARY KEY" +
            ",first_name TEXT" +
            ",last_name TEXT" +
            ")"
        );

        const addUserStmt = db.prepare("INSERT INTO Users VALUES (?, ?, ?)");

        const delUserStmt = db.prepare(
          "DELETE FROM Users WHERE telegram_id = ?"
        );

        resolve(new DataStore(db, addUserStmt, delUserStmt));
      });
    });
  }

  /**
   * Get the entire list of registered users.
   *
   * @returns all the registered Users, or an Error if the query fails
   */
  getUsers(): Promise<User[]> {
    return new Promise<User[]>(
      (resolve: (users: User[]) => any, reject: (err: Sqlite3Error) => any) => {
        this.db.serialize(() => {
          this.db.all(
            "SELECT telegram_id, first_name, last_name FROM Users",
            (_: Statement, users: User[], err: Sqlite3Error | null) => {
              if (err) {
                console.log("GET USERS FAILED SQL");
                console.log(err);
                console.log(err.stack);
                console.log(err.errno);
                reject(err);
              } else {
                resolve(users);
              }
            }
          );
        });
      }
    );
  }

  /**
   * Add a user to the list of registered users.
   *
   * @param {User} the user to add
   * @returns {boolean} true if the user is added, false ifo it already exists, and an Error for other failures
   */
  async addUser(user: User): Promise<boolean> {
    try {
      await this.runStatement(
        this.addUserStmt,
        user.telegram_id,
        user.first_name || null,
        user.last_name || null
      );
      return true;
    } catch (err) {
      if (isSqlite3Error(err)) {
        if (err.errno === Sqlite3Errno.SqliteConstraint) {
          return false;
        }
      }
      console.log("ADD USER FAILED SQL");
      console.log(`errno: ${err.errno}`);
      console.log(`code: ${err.code}`);
      throw err;
    }
  }

  /**
   * Remove a uesr from the list of registered users.
   *
   * @param {User} the user to remove
   * @returns {void} true if the user is removed, false if the user wasn't found, and an Error for other failures
   */
  async removeUser(user: User): Promise<void> {
    try {
      await this.runStatement(this.delUserStmt, user.telegram_id);
    } catch (err) {
      console.log("REMOVE USER FAILED SQL");
      console.log(`errno: ${err.errno}`);
      console.log(`code: ${err.code}`);
      throw err;
    }
  }

  private runStatement(stmt: sqlite3.Statement, ...params: any): Promise<void> {
    return new Promise<void>((resolve, reject: (_: Sqlite3Error) => void) => {
      this.db.serialize(() => {
        stmt.run(...params, (err: Sqlite3Error | null) => {
          stmt.reset();
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }
}

interface Sqlite3Error {
  errno: Sqlite3Errno;
  code: string;
  stack?: string;
}
enum Sqlite3Errno {
  SqliteConstraint = 19,
}
function isSqlite3Error(a: any): a is Sqlite3Error {
  if (a) {
    return (
      isSqlite3Errno(a.errno) &&
      typeof a.code === "string" &&
      (a.stack === undefined || typeof a.stack === "string")
    );
  } else {
    return false;
  }
}
function isSqlite3Errno(a: any): a is Sqlite3Errno {
  if (typeof a === "number") {
    switch (a) {
      case Sqlite3Errno.SqliteConstraint:
        return true;
      default:
        return false;
    }
  } else {
    return false;
  }
}

interface User {
  telegram_id: string;
  first_name?: string;
  last_name?: string;
}

const dataStorePromise = DataStore.asyncConstructor();
export default dataStorePromise;
export { DataStore, User };
