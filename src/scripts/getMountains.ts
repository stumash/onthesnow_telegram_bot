import { DataStore } from "../db"
import { config } from "../../package.json"
import { failWithMessage } from "./utils"

(async () => {
  const datastore = await DataStore.asyncConstructor(config.dbFile)
  const mountains = await datastore.getAllMountains()

  if (!mountains) {
    failWithMessage('found no mountains'); return }

  console.log(`found ${mountains.length} mountain${mountains.length ? 's' : ''}`)
  for (const mountain of mountains) {
    console.log(JSON.stringify(mountain, undefined, 2));
  }
})()
.then(() => {})
