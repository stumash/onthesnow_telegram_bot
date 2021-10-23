import _fs from "fs"; const fs = _fs.promises
import { /*DataStore,*/ Mountain } from "../db"
import axioshttp from "axios"
import { failWithMessage } from "./utils";

if (0==undefined) {
  console.error('you shouldnt be running this. nothing to do here');
  process.exit(1);
}

// lift a Promise to a Maybe
const ltm = async <T>(p: Promise<T>) => {
  try { return await p }
  catch(e) { return undefined }
}

(async () => {
  const mountains: Mountain[] = [
    { mountain_name: "stowe", mountain_full_name: "stowe-mountain-resort", state_name: "vermont" },
    { mountain_name: "okemo", mountain_full_name: "okemo-mountain-resort", state_name: "vermont" },
    { mountain_name: "mad-river-glen", mountain_full_name: "mad-river-glen", state_name: "vermont" },
    { mountain_name: "jay-peak", mountain_full_name: "jay-peak", state_name: "vermont" },
  ]

  // const skiReportUrl = (stateName: string, mountainFullName: string): string =>
    // `https://www.onthesnow.com/_next/data/0.6.11_en-US/${stateName}/${mountainFullName}/skireport.json`
  const fullForecastURl = (stateName: string, mountainFullName: string): string =>
    `https://www.onthesnow.com/_next/data/0.6.11_en-US/${stateName}/${mountainFullName}/weather.json`

  for (const { mountain_name, state_name, mountain_full_name } of mountains) {
    let result = await ltm(axioshttp.get(fullForecastURl(state_name, mountain_full_name)))
    if (!result) {
      failWithMessage(`COULD NOT GET FULL_FORECAST FOR ${mountain_name}`); return }

    const mountain_props = result.data.pageProps.resort
    console.error(result.data.pageProps);
    console.error("FORECAST", mountain_props.forecast);
    console.error("DEPTHES", mountain_props.depthes);
    console.error("RECENT", mountain_props.recent);

    await fs.writeFile(`${mountain_name}_full.json`, JSON.stringify(result.data, undefined, 2))
  }
})()
.then(() => {})
