import axios from "axios"

(async function() {
  const MOUNTAIN_INFOS: {[key: string]: MountainInfo}  = {
    "stowe": { fullName: "stowe-mountain-resort", state: "vermont" },
  }

  const version = SemVer.build(0, 6, 9)
  if (!version) return

  for (let mInfo of Object.entries(MOUNTAIN_INFOS)) {
    let [, { fullName, state}] = mInfo
    axios.get(`https://www.onthesnow.com/_next/data/${version.toString()}_en-US/${state}/${fullName}/skireport.json`)
    // https://www.onthesnow.com/_next/data/0.6.10_en-US/vermont/stowe-mountain-resort/skireport.json
    // https://www.onthesnow.com/_next/data/0.6.10_en-US/vermont/skireport.json
    // https://www.onthesnow.com/_next/data/0.6.10_en-US/vermont/stowe-mountain-resort/weather.json
  }
})()

class SemVer {
  private _major: number
  private _minor: number
  private _patch: number
  get major(): number { return this._major }
  get minor(): number { return this._minor }
  get patch(): number { return this._patch }

  private constructor(aMajor: number, aMinor: number, aPatch: number) {
    this._major = aMajor
    this._minor = aMinor
    this._patch = aPatch
  }
  static build(aMajor: number, aMinor: number, aPatch: number): SemVer|undefined {
    return [aMajor, aMinor, aPatch].every(x => x >= 0) ? new SemVer(aMajor, aMinor, aPatch) : undefined
  }

  incrPatch(): SemVer { return new SemVer(this.major, this.minor, this.patch+1) }
  incrMinor(): SemVer { return new SemVer(this.major, this.minor+1, 0) }
  incrMajor(): SemVer { return new SemVer(this.major+1, 0, 0) }

  toString(): string { return `${this.major}.${this.minor}.${this.patch}` }
}


interface MountainInfo {
  fullName: String,
  state: String,
}

