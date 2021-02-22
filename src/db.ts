import sqlite3, { Statement } from "sqlite3";
sqlite3.verbose();

interface Sqlite3Error {
  errno: Sqlite3Errno;
  code: string;
  stack?: string;
}
enum Sqlite3Errno {
  SqliteConstraint = 19,
}

class RegisteredUserStore {
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

  static async asyncConstructor(): Promise<RegisteredUserStore> {
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

        resolve(new RegisteredUserStore(db, addUserStmt, delUserStmt));
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
            (_: Statement, err: Sqlite3Error | null, users: User[]) => {
              if (err) {
                console.log("GET USERS FAILED SQL");
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
  addUser(user: User): Promise<boolean> {
    return new Promise<boolean>(
      (resolve: (_: boolean) => void, reject: (_: Sqlite3Error) => void) => {
        this.db.serialize(() => {
          // supply values to insert
          this.addUserStmt.run(
            user.telegram_id,
            user.first_name || null,
            user.last_name || null,
            (err: Sqlite3Error | null) => {
              if (err) {
                if (err.errno === Sqlite3Errno.SqliteConstraint) {
                  // The constraint that the telegram_id be unique was not met, meaning the user already exists.
                  resolve(false);
                } else {
                  console.log("ADD USER FAILED SQL");
                  console.log(err.stack);
                  console.log(err.errno);
                  reject(err);
                }
              } else {
                this.addUserStmt.finalize();
                resolve(true);
              }
            }
          );
        });
      }
    );
  }

  /**
   * Remove a uesr from the list of registered users.
   *
   * @param {User} the user to remove
   * @returns {boolean} true if the user is removed, false if the user wasn't found, and an Error for other failures
   */
  removeUser(user: User): Promise<boolean> {
    return new Promise<boolean>(
      (resolve: (_: boolean) => void, reject: (_: Sqlite3Error) => void) => {
        this.db.serialize(() => {
          // supply value to delete
          this.delUserStmt.run(user.telegram_id, (err: Sqlite3Error | null) => {
            if (err) {
              console.log("REMOVE USER FAILED SQL");
              console.log(err.errno);
              console.log(err.code);
              reject(err);
            } else {
              this.delUserStmt.finalize();
              resolve(true);
            }
          });
        });
      }
    );
  }
}

interface User {
  telegram_id: string;
  first_name?: string;
  last_name?: string;
}

const userStorePromise = RegisteredUserStore.asyncConstructor();
export default userStorePromise;
export { RegisteredUserStore, User };
