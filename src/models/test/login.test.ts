import { openBrowser, closeBrowser, goto, text, click, waitFor, write, into, textBox } from "taiko";
import * as dotenv from "dotenv";
dotenv.config();


describe("We can open our website and Login", () => {
  jest.setTimeout(20000);

  beforeAll(async () => {
    await openBrowser({
      args: [
        "--window-size=1280,800",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--disable-setuid-sandbox",
        "--no-first-run",
        "--no-sandbox",
        "--no-zygote",
      ],
      headless: false,
    });
  });

  afterAll(async () => {
    await closeBrowser();
  });

  test("We can Login", async () => {
    expect.assertions(1);
    const password = process.env.PASSWORD|| "";
    const mail = process.env.EMAIL || "";
    const website = process.env.URL || "";
    await goto(website);
    await click("Login");
    await click("Do you want to log ?");
    await write(mail, into(textBox("Email")));
    await click("NEXT");
    await write(password, into(textBox("Password")));
    await click("NEXT");
    await waitFor("Logout");
    expect(await text("Logout").exists()).toBeTruthy();
  });
  });
  
