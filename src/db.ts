import sqlite3, { Statement } from "sqlite3"
sqlite3.verbose()

/**
 * Access persisted data for users, mountains, and snow reports
 *
 * async getUsers() -> User[]
 * async addUser(user: User): boolean
 * async removeUser(user: User): void
 *
 * async getMountain(mountainName: string): Mountain
 * async addMountain(mountain: Mountain): boolean
 * async removeMountain(mountainName: string): void
 *
 * async getSnowReport(mountainName: sting, date: Date): SnowReport
 * async addSnowReport(snowReport: SnowReport): boolean
 * async removeSnowReport(mountainName: string, date: Date): void
 * async getTodaySnowReports(): SnowReport[]
 */
class DataStore {
  private db: sqlite3.Database

  private addUserStmt: sqlite3.Statement
  private delUserStmt: sqlite3.Statement
  private showAllUsersStmt: sqlite3.Statement

  private addMountainStmt: sqlite3.Statement
  private delMountainStmt: sqlite3.Statement
  private showMountainStmt: sqlite3.Statement
  private showAllMountainsStmt: sqlite3.Statement

  private addSnowReportStmt: sqlite3.Statement
  private delSnowReportStmt: sqlite3.Statement
  private showSnowReportStmt: sqlite3.Statement
  private showTodaySnowReportsStmt: sqlite3.Statement

  private constructor(
    db: sqlite3.Database,

    addUserStmt: sqlite3.Statement,
    delUserStmt: sqlite3.Statement,
    showAllUsersStmt: sqlite3.Statement,

    addMountainStmt: sqlite3.Statement,
    delMountainStmt: sqlite3.Statement,
    showMountainStmt: sqlite3.Statement,
    showAllMountainsStmt: sqlite3.Statement,

    addSnowReportStmt: sqlite3.Statement,
    delSnowReportStmt: sqlite3.Statement,
    showSnowReportStmt: sqlite3.Statement,
    showTodaySnowReportsStmt: sqlite3.Statement,
  ) {
    this.db = db

    this.addUserStmt = addUserStmt
    this.delUserStmt = delUserStmt
    this.showAllUsersStmt = showAllUsersStmt

    this.addMountainStmt = addMountainStmt
    this.delMountainStmt = delMountainStmt
    this.showMountainStmt = showMountainStmt
    this.showAllMountainsStmt = showAllMountainsStmt

    this.addSnowReportStmt = addSnowReportStmt
    this.delSnowReportStmt = delSnowReportStmt
    this.showSnowReportStmt = showSnowReportStmt
    this.showTodaySnowReportsStmt = showTodaySnowReportsStmt
  }

  static async asyncConstructor(dbFileName: string): Promise<DataStore> {
    // shorter LoC
    const [U, M, S] = ["Users", "Mountains", "SnowReports"]; // table names

    const createUserTable = [
      `CREATE TABLE IF NOT EXISTS ${U} (`,
      "telegram_id INTEGER PRIMARY KEY",
      ",first_name TEXT",
      ",last_name TEXT",
      ")"
    ].join("")
    const createMountainTable = [
      `CREATE TABLE IF NOT EXISTS ${M} (`,
      "mountain_name TEXT PRIMARY KEY",
      ",mountain_full_name TEXT NOT NULL",
      ",state_name TEXT NOT NULL",
      ")"
    ].join("")
    const createSnowReportTable = [
      `CREATE TABLE IF NOT EXISTS ${S} (`,
      "mountain_name TEXT NOT NULL",
      ",unix_date INTEGER NOT NULL", // UNIX time
      ",report_json BLOB NOT NULL",
      ",PRIMARY KEY(mountain_name, unix_date)",
      ",FOREIGN KEY(mountain_name) REFERENCES Mountains(mountain_name) ON DELETE CASCADE",
      ")"
    ].join("")

    return new Promise((resolve) => {
      // connect to the db
      const db = new sqlite3.Database(dbFileName)

      // shorter LoC
      const [i, d, s, v, w, u] = ["INSERT INTO", "DELETE FROM", "SELECT * FROM", "VALUES", "WHERE", "'unixepoch'"]
        const [tid, mn] = ["telegram_id", "mountain_name"]

      // Initialize an empty table if it doesn't already exist, else no-op
      db.serialize(() => {
        db.run("PRAGMA foreign_keys=true;") // sqlite3 is dumb and you have to enable foreign key support

        db.run(createUserTable)
        const addUserStmt = db.prepare(`${i} ${U} ${v} (?, ?, ?)`)
        const delUserStmt = db.prepare(`${d} ${U} ${w} ${tid} = ?`)
        const showAllUsersStmt = db.prepare(`${s} ${U}`)

        db.run(createMountainTable)
        const addMountainStmt = db.prepare(`${i} ${M} ${v} (?, ?, ?)`)
        const delMountainStmt = db.prepare(`${d} ${M} ${w} ${mn} = ?`)
        const showMountainStmt = db.prepare(`${s} ${M} ${w} ${mn} = ?`)
        const showAllMountainsStmt = db.prepare(`${s} ${M}`)

        db.run(createSnowReportTable)
        const addSnowReportStmt = db.prepare(`${i} ${S} ${v} (?, ?, ?)`)
        const delSnowReportStmt = db.prepare(`${d} ${S} ${w} ${mn} = ? AND date(unix_date, ${u}) = date(?, ${u})`)
        const showSnowReportStmt = db.prepare(`${s} ${S} ${w} ${mn} = ? AND date(unix_date, ${u}) = date(?, ${u})`)
        const showTodaySnowReportsStmt = db.prepare(`${s} ${S} ${w} date(unix_date, ${u}) = date('now', ${u})`)

        resolve(new DataStore(
          db,
          addUserStmt, delUserStmt, showAllUsersStmt,
          addMountainStmt, delMountainStmt, showMountainStmt, showAllMountainsStmt,
          addSnowReportStmt, delSnowReportStmt, showSnowReportStmt, showTodaySnowReportsStmt,
        ))
      })
    })
  }

  /**
   * Get the entire list of registered users.
   *
   * @returns all the registered Users, or an Error if the query fails
   */
  async getUsers(): Promise<User[]> {
    try {
      return await this.runStatementAll(this.showAllUsersStmt)
    } catch (err) {
      logSqliteError(err, "GET USERS FAILED SQL")
      throw err
    }
  }

  /**
   * Add a user to the list of registered users.
   *
   * @param {User} user the user to add
   * @returns {boolean} true if the user is added, false if insertion fails violating a db constraint, else err
   */
  async addUser(user: User): Promise<boolean> {
    try {
      await this.runStatement(
        this.addUserStmt,
        user.telegram_id,
        user.first_name || null,
        user.last_name || null
      )
      return true
    } catch (err) {
      if (isSqlite3Error(err) && err.errno === Sqlite3Errno.SqliteConstraint)
          return false
      logSqliteError(err, "ADD USER FAILED SQL")
      throw err
    }
  }

  /**
   * Remove a uesr from the list of registered users.
   *
   * @param {User} user the user to remove
   * @returns {void}
   */
  async removeUser(user: User): Promise<void> {
    try {
      await this.runStatement(this.delUserStmt, user.telegram_id)
    } catch (err) {
      logSqliteError(err, "REMOVE USER FAILED SQL")
      throw err
    }
  }

  /**
   * Get a particular mountain
   *
   * @param {string} mountainName the name of the mountain to get
   * @returns {Mountain} the mountain with the given mountain_name or undefined if not found
   * @throws {Sqlite3Error} propagated db error
   */
  async getMountain(mountainName: string): Promise<Mountain|undefined> {
    try {
      let mountains: Mountain[] = await this.runStatementAll(this.showMountainStmt, mountainName)
      // mountainName is the primary key so there should only be one result
      return mountains[0]
    } catch (err) {
      logSqliteError(err, "GET MOUNTAINS FAILED SQL")
      throw err
    }
  }

  async getAllMountains(): Promise<Mountain[]|undefined> {
    try {
      let mountains: Mountain[] = await this.runStatementAll(this.showAllMountainsStmt)
      return mountains[0] && mountains
    } catch (err) {
      logSqliteError(err, "GET ALL MOUNTAINS FAILED SQL")
      throw err
    }
  }

  /**
   * Add a mountain to the list of stored mountains.
   *
   * @param {Mountain} mountain the mountain to add
   * @returns {boolean} true if the mountain is added, false if it already exists
   * @throws {Sqlite3Error} propagated db error
   */
  async addMountain(mountain: Mountain): Promise<boolean> {
    try {
      await this.runStatement(
        this.addMountainStmt,
        mountain.mountain_name,
        mountain.mountain_full_name,
        mountain.state_name,
      )
      return true
    } catch (err) {
      if (isSqlite3Error(err) && err.errno === Sqlite3Errno.SqliteConstraint)
          return false
      logSqliteError(err, "ADD MOUNTAIN FAILED SQL")
      throw err
    }
  }

  /**
   * Remove a mountain from the list of stored mountains.
   *
   * @param {string} mountainName the name of the mountain to remove
   * @returns {void}
   * @throws {Sqlite3Error} propagated db error
   */
  async removeMountain(mountainName: string): Promise<void> {
    try {
      await this.runStatement(this.delMountainStmt, mountainName)
    } catch (err) {
      logSqliteError(err, "REMOVE USER FAILED SQL")
      throw err
    }
  }

  /**
   * Get a particular snow report
   *
   * @param {string} mountainName the name of the mountain whose snow report you want to get
   * @param {Date} date the day of the snow report
   * @returns {SnowReport} the snow report for that mountain from that day, undefined if nothing found
   * @throws {Sqlite3Error} propagated db error
   */
  async getSnowReport(mountainName: string, date: Date): Promise<SnowReport|undefined> {
    try {
      const dbSnowReports: DBSnowReport[] = await this.runStatementAll(
        this.showSnowReportStmt,
        mountainName,
        date_to_unix_date(date),
      )
      // mountainName is the primary key so there should only be one result
      return dbSnowReports[0] && DBSnowReport_to_SnowReport(dbSnowReports[0])
    } catch (err) {
      logSqliteError(err, "GET SNOW REPORTS FAILED SQL")
      throw err
    }
  }

  /**
   * Get today's snow reports, assuming they've already been inserted
   * 
   * @returns {SnowReport[]} today's snow reports, or undefined if they can't be found
   * @throws {Sqlite3Error} propagated db error
   */
  async getTodaySnowReports(): Promise<SnowReport[]|undefined> {
    try {
      const dbSnowReports: DBSnowReport[] = await this.runStatementAll(this.showTodaySnowReportsStmt)
      return dbSnowReports[0] && dbSnowReports.map(x => DBSnowReport_to_SnowReport(x))
    } catch (err) {
      logSqliteError(err, "GET TODAY SNOW REPORTS FAILED SQL")
      throw err
    }
  }

  /**
   * Add a snow report to the list of stored snow reports.
   *
   * @param {SnowReport} snowReport the snow report to add
   * @returns {boolean} true if the snow report is added, false if insertion failed violating a constraint, else err
   * @throws {Sqlite3Error} propagated db error
   */
  async addSnowReport(snowReport: SnowReport): Promise<boolean> {
    try {
      const dbSnowReport = SnowReport_to_DBSnowReport(snowReport)
      await this.runStatement(
        this.addSnowReportStmt,
        dbSnowReport.mountain_name,
        dbSnowReport.unix_date,
        dbSnowReport.report_json,
      )
      return true
    } catch (err) {
      if (isSqlite3Error(err) && err.errno === Sqlite3Errno.SqliteConstraint)
          return false
      logSqliteError(err, "ADD SNOW REPORT FAILED SQL")
      throw err
    }
  }

  /**
   * Remove a snow report from the list of stored snow reports.
   *
   * @param {string} mountainName the name of the mountain whose snow report you want to remove
   * @param {Date} date the day of the snow report
   * @returns {void}
   * @throws {Sqlite3Error} propagated db error
   */
  async removeSnowReport(mountainName: string, date: Date): Promise<void> {
    try {
      await this.runStatement(this.delSnowReportStmt, mountainName, date_to_unix_date(date))
    } catch (err) {
      logSqliteError(err, "REMOVE SNOW REPORT FAILED SQL")
      throw err
    }
  }

  private runStatement(stmt: sqlite3.Statement, ...params: any): Promise<void> {
    return new Promise<void>((resolve, reject: (_: Sqlite3Error) => void) => {
      this.db.serialize(() => {
        stmt.run(...params, (err: Sqlite3Error | null) => {
          stmt.reset()
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    })
  }

  private runStatementAll<T>(stmt: sqlite3.Statement, ...params: any): Promise<T> {
    return new Promise<T>((resolve: (_: T) => void, reject: (_: Sqlite3Error) => void) =>  {
      this.db.serialize(() => {
        stmt.all(...params, (_: Statement, rows: T, err: Sqlite3Error | null) => {
          stmt.reset()
          if (err) {
            reject(err)
          } else {
            resolve(rows)
          }
        })
      })
    })
  }
}

interface Sqlite3Error {
  errno: Sqlite3Errno
  code: string
  stack?: string
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
    )
  } else {
    return false
  }
}
function isSqlite3Errno(a: any): a is Sqlite3Errno {
  if (typeof a === "number") {
    switch (a) {
      case Sqlite3Errno.SqliteConstraint:
        return true
      default:
        return false
    }
  } else {
    return false
  }
}
function logSqliteError(err: Sqlite3Error, msg: String) {
  console.log(msg)
  console.log(`error: ${err}`)
  console.log(`stack: ${err.stack}`)
  console.log(`errno: ${err.errno}`)
  console.log(`code: ${err.code}`)
}

interface User {
  telegram_id: number
  first_name?: string
  last_name?: string
}

interface Mountain {
  mountain_name: string
  mountain_full_name: string
  state_name: string
}

interface SnowReport {
  mountain_name: string
  unix_date: Date,
  report_json: Object, // TODO maybe a particular interface instead of just Object
}
interface DBSnowReport {
  mountain_name: string,
  unix_date: number,
  report_json: string,
}
function DBSnowReport_to_SnowReport(dbsr: DBSnowReport): SnowReport {
  return {
    mountain_name: dbsr.mountain_name,
    unix_date: unix_date_to_date(dbsr.unix_date),
    report_json: JSON.parse(dbsr.report_json),
  }
}
function unix_date_to_date(unix_date: number): Date { return new Date(unix_date * 1000) }
function SnowReport_to_DBSnowReport(sr: SnowReport): DBSnowReport {
  return {
    mountain_name: sr.mountain_name,
    unix_date: date_to_unix_date(sr.unix_date),
    report_json: JSON.stringify(sr.report_json),
  }
}
function date_to_unix_date(date: Date): number { return Math.floor(date.valueOf() / 1000) }

export default DataStore
export {
  DataStore,
  User,
  Mountain,
  SnowReport,
  date_to_unix_date,
  unix_date_to_date
}
