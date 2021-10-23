import Slimbot from "slimbot"
import { DataStore } from "./db"
import { scheduleJob } from "node-schedule"
import axioshttp from "axios"
import _fs from "fs"; const { writeFile } = _fs.promises

const NOON_EVERYDAY = { hour: 12 }
const skiReportUrl = (stateName: string, mountainFullName: string) =>
  `https://www.onthesnow.com/_next/data/0.6.9_en-US/${stateName}/${mountainFullName}/skireport.json`

const startScheduler = (bot: Slimbot, datastore: DataStore) => {
  scheduleJob(NOON_EVERYDAY, async () => {
    const todaysSnowReports = await datastore.getTodaySnowReports()

    if (todaysSnowReports) return // already have today's reports, no need to fetch right now

    let mountains = await datastore.getAllMountains()
    if (!mountains) {
      console.error("THERE ARE NO MOUNTAINS IN THE DB"); return }

    await Promise.all(mountains.map(async mountain => {
      const { state_name, mountain_full_name } = mountain
      let skireport = await axioshttp.get(skiReportUrl(state_name, mountain_full_name))
    }))
  })
}

  // here's an example url that serves pure json for a given ski resort
  // the json includes the weather report - and much more
  // https://www.onthesnow.com/_next/data/0.6.9_en-US/vermont/stowe-mountain-resort/skireport.json
  // https://www.onthesnow.com/_next/data/0.6.9_en-US/wyoming/jackson-hole/skireport.json

export { startScheduler }
