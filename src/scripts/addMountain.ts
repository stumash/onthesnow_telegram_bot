import { DataStore } from "../db"
import { config } from "../../package.json"
import { failWithMessage } from "./utils"

(async () => {
  const args = process.argv.slice(2) // drop first two args, they're just "node" and this file
  const [mountainName, mountainFullName, stateName] = args

  if (args.length !== 3) failWithMessage([
    'need 3 args (mountainName, mountainFullName, stateName), but got:',
  `args: ${args}`,
  ].join("\n"))

  const datastore = await DataStore.asyncConstructor(config.dbFile)
  const mountainToAdd = {
    mountain_name: mountainName,
    mountain_full_name: mountainFullName,
    state_name: stateName,
  }
  const insertSuccess = await datastore.addMountain(mountainToAdd)

  if (!insertSuccess)
    failWithMessage(`failed to insert mountain ${JSON.stringify(mountainToAdd)}`)
})()
.then(() => {})
