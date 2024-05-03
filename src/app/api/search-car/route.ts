import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as puppeteer from "puppeteer";

interface Body {
  vin: string;
  plate: string;
}

let page: puppeteer.Page | undefined;
let browser: puppeteer.Browser | undefined;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;

    if (!browser) {
      browser = await puppeteer.launch({
        headless: true,
        executablePath: "/usr/bin/chromium",
        args: [
          "--incognito",
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
        ],
      });
    }

    page = (await browser.pages())[0] ?? (await browser.newPage());

    if (!page) {
      console.log("There are no open pages");
      return NextResponse.json(
        { error: "The requested service is currently unavailable" },
        { status: 503 },
      );
    }

    await page.goto("https://www.dmv.ca.gov/wasapp/ipp2/initPers.do", {
      waitUntil: "networkidle0",
    });
    await page.click("input#agree");
    (await page.$$("button"))[1]?.click() ??
      console.log("The button does not exist");

    await page.waitForNavigation({ waitUntil: "networkidle0" });
    await page.select("select#vehicleType", 'AUTO');
    await page.type("input#licPlateReplaced", body.plate);
    await page.type("input#last3Vin", body.vin);
    await page.click("label[for=isRegExpire60N]");
    await page.click("label[for=isVehLeasedN]");
    await page.click(`label[for=plate_type_R]`);
    (await page.$$("button"))[1]?.click() ??
    console.log("The button does not exist");
    await page.waitForNavigation({ waitUntil: "networkidle0" });
    const spanElement = await page.$(".progress__tooltip");

    if (spanElement === null) {
      return NextResponse.json({ message: "NO", status: 200 });
    } else {
      const spanText = await spanElement.getProperty("textContent");
      const text = await spanText.jsonValue();
      if (text === "Progress: 20%") {
        return NextResponse.json({ message: "OK", status: 200 });
      } else {
        return NextResponse.json({ message: "NO", status: 200 });
      }
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred. Please try again later" },
        { status: 500 },
      );
    }
  } finally {
    if (browser) {
      await browser.close();
      browser = undefined;
    }
  }
}
