import { Request, Response } from "express";
import PanierModel from "../models/panierModel";

const clientWantsJson = (request: Request): boolean => request.get("accept") === "application/json";

export function index(panierModel: PanierModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const panier = await panierModel.findAll();
    if (clientWantsJson(request)) {
      response.json(panier);
    } else {
      let totalpanier = 0;
      panier.forEach((ligne) => {
        const pp = Number(ligne.price);
        totalpanier += pp;
      });
      response.render("panier/index", { panier, totalpanier });
    }
  };
}

export function newPanier() {
  return async (request: Request, response: Response): Promise<void> => {
    response.render("panier/new", { action: "/panier", callToAction: "Create" });
  };
}

export function show(panierModel: PanierModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const panier = await panierModel.findByPanierSlug(request.params.slug);
    if (panier) {
      if (clientWantsJson(request)) {
        response.json(panier);
      } else {
        response.render("panier/show", { panier });
      }
    } else {
      response.status(404);
      if (clientWantsJson(request)) {
        response.json({ error: "This game does not exist." });
      } else {
        response.status(404).render("pages/not-found");
      }
    }
  };
}

export function list(panierModel: PanierModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const panier = await panierModel.findByPanierSlug(request.params.slug);
    if (clientWantsJson(request)) {
      response.json(panier);
    } else {
      response.render("panier/index", { panier });
    }
  };
}

export function create(panierModel: PanierModel) {
  return async (request: Request, response: Response): Promise<void> => {
    // If we're getting JSON

    const errors = panierModel.validate({ ...request.body });
    if (errors.length > 0) {
      response.status(400).json({ errors });
    } else {
      const { ...panierInput } = request.body;
      const panier = await panierModel.insertOne(panierInput);

      if (request.get("Content-Type") === "application/json") {
        response.status(201).json(panier);
      } else if (request.get("Content-Type") === "application/x-www-form-urlencoded") {
        response.redirect(`/platforms`);
      }
    }
  };
}

export function edit(panierModel: PanierModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const panier = await panierModel.findByPanierSlug(request.params.slug);
    if (panier) {
      response.render("panier/edit", { panier, action: `/panier/${panier.slug}`, callToAction: "Save" });
    } else {
      response.status(404);
      response.status(404).render("pages/not-found");
    }
  };
}

export function update(panierModel: PanierModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const panier = await panierModel.findByPanierSlug(request.params.slug);
    if (panier) {
      if (request.get("Content-Type") === "application/json") {
        // If we're getting JSON
        const errors = panierModel.validate({ ...request.body, slug: request.params.slug });
        if (errors.length > 0) {
          response.status(400).json({ errors });
        } else {
          const updatedPanier = await panierModel.updateOne(panier._id, {
            ...panier,
            ...request.body,
            _id: panier._id,
          });
          response.status(201).json(updatedPanier);
        }
      } else if (request.get("Content-Type") === "application/x-www-form-urlencoded") {
        // If we're in a Form
        console.log(request.body);
        const { ...panierInput } = request.body;
        const updatedPanier = await panierModel.updateOne(panier._id, { ...panier, ...panierInput, _id: panier._id });
        response.redirect(`/games/${updatedPanier.slug}`);
      }
    } else {
      response.status(404).end();
    }
  };
}

export function destroy(panierModel: PanierModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const panier = await panierModel.findByPanierSlug(request.params.slug);
    if (panier) {
      panierModel.remove(panier._id);
      response.status(204).end();
    } else {
      response.status(404).end();
    }
  };
}
