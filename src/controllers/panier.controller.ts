class Ligne {
  code: string;
  qty: number;
  price: number;
  slug: string;

  constructor(code: string, qty: number, price: number, slug: string) {
    this.code = code;
    this.qty = qty;
    this.price = price;
    this.slug = slug;
  }
  ajouterQte(): void {
    if (this.qty < 10) this.qty = this.qty + 1;
  }
  getPrixLigne(): number {
    const resultat = this.price * this.qty;
    return resultat;
  }
  getCode(): string {
    return this.code;
  }
  getQte(): number {
    return this.qty;
  }
}

module.exports = class Panier {
  liste = [];

  constructor() {
    this.liste = [];
  }

  ajouterArticle(code: string, qty: number, price: number, slug: string): void {
    this.liste.push(new LignePanier(code, qty, price, slug));
  }
}