import { Collection, ObjectId } from "mongodb";

export type PanierInput = {
  code: string;
  qty: number;
  price: number;
  slug: string;
};

export type Panier = PanierInput & {
  _id: ObjectId;
};

export default class PanierModel {
  private collection: Collection;
  constructor(collection: Collection) {
    this.collection = collection;
  }

  findAll(): Promise<Panier[]> {
    return this.collection.find({}).toArray();
  }

  findByPanierSlug(slug: string): Promise<Panier | null> {
    return this.collection.findOne({
      slug: slug,
    });
  }

  async insertOne(payload: PanierInput): Promise<Panier> {
    const dbResponse = await this.collection.insertOne(payload);
    const { ops } = dbResponse;
    return ops[0];
  }

  async updateOne(id: ObjectId, payload: Panier): Promise<Panier> {
    const dbResponse = await this.collection.replaceOne({ _id: id }, payload);
    const { ops } = dbResponse;
    return ops[0];
  }

  async remove(id: ObjectId): Promise<void> {
    await this.collection.deleteOne({ _id: id });
  }

  validate(payload: Record<string, unknown>): string[] {
    const errors: string[] = [];
    const mandatoryKeys = ["code", "qty", "price", "slug"];
    mandatoryKeys.forEach((key) => {
      if (!payload[key]) {
        errors.push(`Field '${key}' must be present.`);
      }
    });

    return errors;
  }
}
