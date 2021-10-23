import { expect } from "chai"
import temp from "temp"; temp.track()
import DataStore, { User, Mountain, SnowReport, date_to_unix_date } from "../src/db"

describe('DataStore', () => {

  // arbitrary helpers
  const rTelegramId = () => Math.floor(Math.random() * 10000)
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'
  const rLetter = () => alphabet[Math.floor(Math.random() * alphabet.length) % alphabet.length]
  const rName = () => Array(10).fill(null).map(_ => rLetter()).join("")
  // const plusDays = (d: Date, n: number) => { let e = new Date(); e.setDate(d.getDate() + n); return e }

  // fresh db helper
  const createDataStore = async (fileNameSuffix: string): Promise<DataStore> =>
    await DataStore.asyncConstructor(temp.openSync({ suffix: `${fileNameSuffix}_test_DataStore.db` }).path)

  // the methods being tested
  const sAC = "asyncConstructor"
  const [sAU, sGU, sRU] = ["addUser", "getUsers", "removeUser"]
  const [sAM, sGM, sRM] = ["addMountain", "getMountains", "removeMountain"]
  const [sAS, sGS, sRS] = ["addSnowReport", "getSnowReport", "removeSnowReport"]

  describe(`.${sAC}(dbFileName)`, () => {
    it("should create a DataStore using the dbFileName", async () => {
      const datastore = await createDataStore(sAC)
      expect(datastore).to.exist
    })
  })

  describe("[Users]", () => {
    describe(`.${sAU}(user) and .${sGU}()`, () => {
      const datastorePromise = createDataStore(sAU)

      it("should add and retrieve a single user", async () => {
        const datastore = await datastorePromise

        const user: User = { telegram_id: rTelegramId(), first_name: rName(), last_name: rName() }

        const userWasAdded = await datastore.addUser(user)
        expect(userWasAdded).to.be.true

        const users = await datastore.getUsers()
        expect(users.find(u => u.telegram_id === user.telegram_id)).to.deep.equal(user)
      })

      it("should not add users sharing a telegram_id", async () => {
        const datastore = await datastorePromise

        const telegram_id = rTelegramId()
        const user1: User = { telegram_id, first_name: rName(), last_name: rName() }
        const user2: User = { telegram_id, first_name: rName() }

        expect(await datastore.addUser(user1)).to.be.true
        expect(await datastore.addUser(user2)).to.be.false
      })
    })

    describe(`.${sAU}(user) and .${sRU}(user)`, () => {
      it("should add and remove users", async () => {
        const datastore = await createDataStore(sRU)

        const user1: User = { telegram_id: rTelegramId(), first_name: rName(), last_name: rName() }

        expect(await datastore.addUser(user1)).to.be.true
        expect((await datastore.getUsers()).find(u => u.telegram_id === user1.telegram_id)).to.deep.equal(user1)
        expect(async () => await datastore.removeUser({ telegram_id: user1.telegram_id })).to.not.throw()
        expect((await datastore.getUsers()).some(u => u.telegram_id === user1.telegram_id)).to.be.false
      })
    })
  })

  describe("[Mountains]", () => {
    describe(`.${sAM}(mountain) and .${sGM}()`, () => {
      const datastorePromise = createDataStore(sAM)

      it("should add and retrieve a single mountain", async () => {
        const datastore = await datastorePromise

        const mountain: Mountain = { mountain_name: rName(), mountain_full_name: rName(), state_name: rName() }

        expect(await datastore.addMountain(mountain)).to.be.true
        expect(await datastore.getMountain(mountain.mountain_name)).to.deep.equal(mountain)
      })

      it("should not add Mountains sharing a mountain_name", async () => {
        const datastore = await datastorePromise

        const mountain_name = rName()
        const m1: Mountain = { mountain_name, mountain_full_name: rName(), state_name: rName() }
        const m2: Mountain = { mountain_name, mountain_full_name: rName(), state_name: rName() }

        expect(await datastore.addMountain(m1)).to.be.true
        expect(await datastore.addMountain(m2)).to.be.false
      })
    })

    describe(`.${sAM}(mountain) and .${sRM}()`, () => {
      const datastorePromise = createDataStore(sRM)

      it('should add and remove mounatains', async () => {
        const datastore = await datastorePromise

        const mountain: Mountain = { mountain_name: rName(), mountain_full_name: rName(), state_name: rName() }

        expect(await datastore.addMountain(mountain)).to.be.true
        expect(await datastore.getMountain(mountain.mountain_name)).to.deep.equal(mountain)

        expect(async () => await datastore.removeMountain(mountain.mountain_name)).to.not.throw()
        expect(await datastore.getMountain(mountain.mountain_name)).to.be.undefined
      });
    })
  })

  describe("[SnowReports]", () => {
    describe(`.${sAS}(snowReport) and .${sGS}()`, () => {
      const datastorePromise = createDataStore(sAS)

      it("should add and retrieve a single snow report", async () => {
        const datastore = await datastorePromise

        const mountain_name = rName()

        await datastore.addMountain({ mountain_name, mountain_full_name: rName(), state_name: rName() })

        const sr: SnowReport = {
          mountain_name,
          unix_date: new Date(),
          report_json: { description: "it was a bad day for skiing" },
        }

        // test insertion was successful
        expect(await datastore.addSnowReport(sr)).to.be.true
        let result = await datastore.getSnowReport(sr.mountain_name, sr.unix_date)
        expect(result).to.exist; if (!result) return
        expect(result.mountain_name).to.equal(sr.mountain_name)
        expect(date_to_unix_date(result.unix_date)).to.equal(date_to_unix_date(sr.unix_date))
        expect(result.report_json).to.deep.equal(sr.report_json)
      })
    })

    describe(`.${sAS}(snowReport) and .${sRS}(mountainName, date)`, () => {
      const datastorePromise = createDataStore(sRS)

      it("should add and remove snow reports", async () => {
        const datastore = await datastorePromise

        const mountain_name = rName()
        await datastore.addMountain({ mountain_name, mountain_full_name: rName(), state_name: rName() })
        const sr: SnowReport = {
          mountain_name,
          unix_date: new Date(),
          report_json: { description: "it was a bad day for skiing" },
        }

        // test insertion was successful
        expect(await datastore.addSnowReport(sr)).to.be.true
        let result = await datastore.getSnowReport(mountain_name, sr.unix_date)
        expect(result).to.exist; if (!result) return
        expect(result.mountain_name).to.equal(mountain_name)
        expect(date_to_unix_date(result.unix_date)).to.equal(date_to_unix_date(sr.unix_date))
        expect(result.report_json).to.deep.equal(sr.report_json)

        // test removal was successful
        expect(async () => await datastore.removeSnowReport(mountain_name, sr.unix_date)).to.not.throw()
        expect(await datastore.getSnowReport(mountain_name, sr.unix_date)).to.be.undefined
      })

      it("should add snow reports and delete them when their mountain is removed", async () => {
        const datastore = await datastorePromise

        const mountain_name = rName()
        await datastore.addMountain({ mountain_name, mountain_full_name: rName(), state_name: rName() })
        const sr: SnowReport = {
          mountain_name,
          unix_date: new Date(),
          report_json: { description: "it was a bad day for skiing" },
        }

        // test insertion was successful
        expect(await datastore.addSnowReport(sr)).to.be.true
        let result = await datastore.getSnowReport(mountain_name, sr.unix_date)
        expect(result).to.exist; if (!result) return
        expect(result.mountain_name).to.equal(mountain_name)
        expect(date_to_unix_date(result.unix_date)).to.equal(date_to_unix_date(sr.unix_date))
        expect(result.report_json).to.deep.equal(sr.report_json)

        // test mountain removal causes snow report removal
        await datastore.removeMountain(mountain_name)
        expect(await datastore.getSnowReport(mountain_name, sr.unix_date)).to.not.exist
      })
    })
  })
})
