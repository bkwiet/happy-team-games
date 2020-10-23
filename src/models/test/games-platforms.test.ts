import { openBrowser, closeBrowser, goto, text, click, waitFor, $} from "taiko";
import * as dotenv from "dotenv";
dotenv.config();


describe("Explore Games and Platforms ", () => {
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
      headless: true,
    });
  });

  afterAll(async () => {
    await closeBrowser();
  });
  test("Games appear when we click on Explore games", async () => {
    expect.assertions(1)
    const website = process.env.URL || "";
    await goto(website);
    await click("Explore Video Games");
    await waitFor($(`games`));
    expect(await text("Games").exists()).toBeTruthy();
});
test("Platforms appear when we click on Explore Platforms", async () => {
    expect.assertions(1)
    const website = process.env.URL || "";
    await goto(website);
    await click("Explore Platforms");
    await waitFor("Platforms");
    expect(await text("Platforms").exists()).toBeTruthy();
});

});
