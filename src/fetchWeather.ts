import 'reflect-metadata';
import { jsonObject, jsonArrayMember, jsonMember, TypedJSON } from 'typedjson';


@jsonObject
class SnowDepth {
  @jsonMember({preserveNull: true})
  public readonly min: number | null
  @jsonMember({preserveNull: true})
  public readonly max: number | null
  constructor(min: number | null, max: number | null) {
    this.min=min; this.max=max }
}
@jsonObject
class SnowFall {
  @jsonMember({ serializer: dateToString, deserializer: dateFromString })
  public readonly date: Date
  @jsonMember
  public readonly snow: number
  constructor(date: Date, snow: number) { this.date=date; this.snow=snow }
}
@jsonObject
class MountainSnowReport {
  @jsonArrayMember((mn:number,mx:number) => new SnowDepth(mn,mx))
  public readonly depthes: SnowDepth[]
  @jsonArrayMember((dt:Date,n:number) => new SnowFall(dt,n))
  public readonly recent: SnowFall[]
  @jsonArrayMember((dt:Date,n:number) => new SnowFall(dt,n))
  public readonly forecast: SnowFall[]
  constructor(depthes: SnowDepth[], recent: SnowFall[], forecast: SnowFall[]) {
    this.depthes=depthes; this.recent=recent; this.forecast=forecast }
}
@jsonObject
class SkiReportContents {
  @jsonMember
  public readonly resort: MountainSnowReport
  constructor(resort: MountainSnowReport) { this.resort = resort }
}
@jsonObject
class SkiReportFetch {
   @jsonMember
   public readonly pageProps: SkiReportContents
   constructor(pageProps: SkiReportContents) { this.pageProps = pageProps }
}

function dateFromString(s: string): Date { return new Date(s) }
function dateToString(d: Date): string { return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` }

const srf = new SkiReportFetch(new SkiReportContents(new MountainSnowReport(
  [],
  [],
  []
)))


const sdJsfmt = new TypedJSON(SnowDepth)
console.log(sdJsfmt.toPlainJson(new SnowDepth(0, null)))
//console.log(sdJsfmt.parse(sdJsfmt.toPlainJson(new SnowDepth(0, null))))
//console.log(sdJsfmt.parse({ min: 7, max: '3' }))
