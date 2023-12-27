import {useState} from 'react'
import {Card, CardBody, Divider, Image, Input, Spacer, Textarea} from "@nextui-org/react";
import {toJalaali, toGregorian} from "jalaali-js";
import {sprintf} from "sprintf-js";
import {parseDate} from "chrono-node";

function App() {
    const [jalaali, setJalaali] = useState<string | null>(null)
    const [gregorian, setGregorian] = useState<string | null>(null)

    function parseText(text: string, isJalaali: boolean) {
        if (isJalaali) {
            const monthNames = {
                "farvardin": "January",
                "ordibehesht": "February",
                "khordad": "March",
                "tir": "April",
                "mordad": "May",
                "shahrivar": "June",
                "mehr": "July",
                "aban": "August",
                "azar": "September",
                "dey": "October",
                "bahman": "November",
                "esfand": "December"
            }
            {   // add heuristic to guess jalaali months
                const matches = /(?:^|[0-9 ])([a-zA-Z]+)(?:$|[0-9 ])/[Symbol.matchAll](text)
                outer: for (const match of matches) {
                    for (const k in monthNames) {
                        if (k.substring(0, match[1].length) == match[1].toLowerCase()) {
                            text = text.replace(match[1], monthNames[k])
                            break outer
                        }
                    }
                }
            }

            {   // add heuristic to guess 2-digit years
                const matches = /\b[0-9]+\b/[Symbol.matchAll](text)
                for (const match of matches) {
                    const number = parseInt(match[0]);
                    if (number < 100 && number > 31) {
                        text = text.replace(match[0], `13${match[0]}`)
                        break
                    }

                    if (number >= 100 && number < 1000) {
                        text = text.replace(match[0], `1${match[0]}`)
                        break
                    }
                }
            }
        }

        const date = parseDate(text);
        if (date) {
            return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
        }
    }

    function printText(arr: number[], isJalaali: boolean) {
        const [yyyy, mm, dd] = arr
        const opts: Intl.DateTimeFormatOptions = {
            // dateStyle: 'full',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const simple_formatted = sprintf('%04u-%02u-%02u', yyyy, mm, dd);
        const date =
            (isJalaali) ?
                (() => {
                    const g = toGregorian(yyyy, mm, dd);
                    return new Date(g.gy, g.gm - 1, g.gd)
                })()
                : new Date(yyyy, mm - 1, dd);
        const human_readable_formatted =
            (isJalaali) ?
                new Intl.DateTimeFormat('en-CA-u-ca-persian', opts).format(date).replace(/\bAP\b/, "")
                :
                new Intl.DateTimeFormat('en-CA', opts).format(date)
        ;

        return `simple: ${simple_formatted}\nhuman readable: ${human_readable_formatted}`;
    }

    function parseGregorian(text: string) {
        const parsed = parseText(text, false)
        if (parsed) {
            setGregorian(printText(parsed, false))
            const converted = toJalaali(parsed[0], parsed[1], parsed[2])
            setJalaali(_ => printText([converted.jy, converted.jm, converted.jd], true))
        } else {
            setJalaali("?")
            setGregorian("?")
        }
    }

    function parseJalaali(text: string) {
        const parsed = parseText(text, true)
        if (parsed) {
            setJalaali(printText(parsed, true))
            const converted = toGregorian(parsed[0], parsed[1], parsed[2])
            setGregorian(_ => printText([converted.gy, converted.gm, converted.gd], false))
        } else {
            setJalaali("?")
            setGregorian("?")
        }
    }

    return (
        <>
            <Card className="max-w-md">
                <CardBody>
                    <div className="flex flex-row space-x-1">
                        <Image
                            src="./images/jalali.png"
                            width={64}
                        />
                        <Input type="text"
                               label="Jalali Date"
                               variant="bordered"
                               placeholder="Enter date in jalali"
                               onInput={e => {
                                   parseJalaali((e.target as HTMLInputElement).value)
                               }}/>
                    </div>
                    <Spacer y={2}/>
                    <Textarea
                        label="Output:"
                        placeholder=""
                        value={jalaali ?? ""}
                    />
                </CardBody>
                <Divider/>
                <CardBody>
                    <div className="flex flex-row space-x-1">
                        <Image
                            src="./images/gregorian.png"
                            width={64}
                        />
                        <Input type="text"
                               label="Gregorian Date"
                               variant="bordered"
                               placeholder="Enter date in gregorian"
                               onInput={e => {
                                   parseGregorian((e.target as HTMLInputElement).value)
                               }}/>
                    </div>
                    <Spacer y={2}/>
                    <Textarea
                        label="Output:"
                        placeholder=""
                        value={gregorian ?? ""}
                    />
                </CardBody>
            </Card>
        </>
    )
}

export default App
