import { openBrowser, closeBrowser, goto, text, click, waitFor} from "taiko";
import * as dotenv from "dotenv";
dotenv.config();


describe("Add and delete products", () => {
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
  test("Add to shopping cart", async () => {
    expect.assertions(1)
    const website = process.env.URL || "";
    await goto(website);
    await click("Games");
    await click ("Ajouter Panier")
    await click ("Panier");
    await click ("Payer");
    await waitFor("Paiement de vos Achats");
    expect(await text("Paiement de vos Achats").exists()).toBeTruthy();
});
});