import { DataStore } from "../db"
import { config } from "../../package.json"
import { failWithMessage } from "./utils"

(async () => {
  const args = process.argv.slice(2) // drop first two args, they're just "node" and this file
  const [mountainName] = args

  if (args.length !== 1) failWithMessage([
    'need 1 args (mountainName), but got:',
    `args: ${args}`,
  ].join("\n"))

  const datastore = await DataStore.asyncConstructor(config.dbFile)
  await datastore.removeMountain(mountainName)
  const m = await datastore.getMountain(mountainName)
  if (m) failWithMessage("failed to delete mountain: ${mountainName}")
})()
.then(() => {})
