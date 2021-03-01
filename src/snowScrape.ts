import cheerio from "cheerio";
import axios from "axios";

async function fetchSnowReport(
  mountain: SkiMountain
): Promise<void> /*SnowReport*/ {
  const url = [
    `https://onthesnow.com/`,
    `${mountain.urlNameState}`,
    `/`,
    `${mountain.urlName}`,
    `/`,
    `skireport.html`,
  ].join("");

  const response = await axios(url);
  console.log(response.data);
}

abstract class SkiMountain {
  urlName: string;
  urlNameState: string;
  constructor(p: { urlName: string; urlNameState: string }) {
    this.urlName = p.urlName;
    this.urlNameState = p.urlNameState;
  }
}
class MountSnow extends SkiMountain {
  constructor() {
    super({ urlName: "mount-snow", urlNameState: "vermont" });
  }
}
class Okemo extends SkiMountain {
  constructor() {
    super({ urlName: "okemo-mountain-resort", urlNameState: "vermont" });
  }
}
const MOUNTAINS: SkiMountain[] = [new MountSnow(), new Okemo()];

export default fetchSnowReport;
export { MOUNTAINS, fetchSnowReport };
