class LignePanier {
  codeArticle: string;
  qteArticle: number;
  prixArticle: number;

  constructor(code: string, qte: number, prix: number) {
    this.codeArticle = code;
    this.qteArticle = qte;
    this.prixArticle = prix;
  }
  ajouterQte(qte: number): void {
    this.qteArticle += qte;
  }
  getPrixLigne(): number {
    const resultat = this.prixArticle * this.qteArticle;
    return resultat;
  }
  getCode(): string {
    return this.codeArticle;
  }
  getQte(): number {
    return this.qteArticle;
  }
  getPrix(): number {
    return this.prixArticle;
  }
}

module.exports = class Panier {
  liste = [];

  constructor() {
    this.liste = [];
  }

  ajouterArticle(code: string, qte: number, prix: number): void {
    const index = this.getArticle(code);
    if (index == -1) {
      this.liste.push(new LignePanier(code, qte, prix));
    } else {
      this.liste[index].ajouterQte(qte);
    }
  }
  getPrixPanier(): number {
    let total = 0;
    for (let i = 0; i < this.liste.length; i++) {
      total += this.liste[i].getPrixLigne();
    }
    return total;
  }
  getArticle(code: string): number {
    for(let i = 0; i < this.liste.length; i++) {
      if (code == this.liste[i].getCode()) return i;
    }
    return -1;
  }
  supprimerArticle(code: string): void {
    const index = this.getArticle(code);
    if (index > -1) this.liste.splice(index, 1);
  }
}