import { openBrowser, closeBrowser, goto, text, click, waitFor, write, into, textBox } from "taiko";

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

  test.only("We can Login", async () => {
    expect.assertions(1);

    const website = process.env.URL || "";
    await goto(website);
    await click("Login");
    await click("Do you want to log ?");
    await write('sarahtina38@gmail.com', into(textBox("Email")));
    await click("NEXT");
    await write('codepassecret', into(textBox("Password")));
    await click("NEXT");
    await waitFor("Logout");
    expect(await text("Logout").exists()).toBeTruthy();
  });
});