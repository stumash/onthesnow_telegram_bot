import sqlite3, { RunResult, Statement } from "sqlite3";

class RegisteredUserStore {
  db: sqlite3.Database;

  constructor() {
    // connect to the db
    this.db = new sqlite3.Database("db.db");

    // TODO: initialize an empty table if it doesn't already exist, else no-op
    this.db.serialize(() => {
      this.db.run(
        "CREATE TABLE IF NOT EXISTS Users (" +
          "telegram_id PRIMARY KEY" +
          ",first_name TEXT" +
          ",last_name TEXT" +
          ")"
      );
    });
  }

  /**
   * Get the entire list of registered users.
   *
   * @returns all the registered Users, or an Error if the query fails
   */
  getUsers(): Promise<User[]> {
    return new Promise<User[]>(
      (resolve: (users: User[]) => any, reject: (err: Error) => any) => {
        this.db.serialize(() => {
          this.db.all(
            "SELECT telegram_id, first_name, last_name FROM Users",
            (_: Statement, err: Error | null, users: User[]) => {
              if (err) {
                console.log(err);
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
   * @returns {boolean} true if the user is added, false if it already exists, and an Error for other failures
   */
  addUser(user: User): Promise<boolean> {
    return new Promise<boolean>(
      (resolve: (value: boolean) => void, reject: (reason: Error) => void) => {
        this.db.serialize(() => {
          const stmt = this.db.prepare("INSERT INTO Users VALUES(?)");

          const tid = `${user.telegram_id}`;
          const fname = `${user.first_name || "NULL"}`;
          const lname = `${user.last_name || "NULL"}`;
          stmt.run(`${tid}, ${fname}, ${lname}`);

          stmt.finalize((err: Error) => {
            console.log(err);
            switch (err.name) {
              case "":
                break;
              default:
                reject(err);
            }
          });
          resolve(true);
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
  removeUser(user: User): void /*Promise<boolean>*/ {}
}

interface User {
  telegram_id: string;
  first_name?: string;
  last_name?: string;
}

const userStore = new RegisteredUserStore();
export default userStore;
export { RegisteredUserStore, User };
