import { Request, Response } from "express";
import PlatformModel from "../models/platformModel";
import slugify from "slug";
import { checkAccess } from "./connection.controller";

const clientWantsJson = (request: Request): boolean => request.get("accept") === "application/json";
let access = false;

export function index(platformModel: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const platforms = await platformModel.findAll();
    if (clientWantsJson(request)) {
      response.json(platforms);
    } else {
      await checkAccess()(request).then((result) => (access = result));
      response.render("platforms/index", { platforms, access });
    }
  };
}

export function newPlatform() {
  return async (request: Request, response: Response): Promise<void> => {
    await checkAccess()(request).then((result) => (access = result));
    response.render("platforms/new", { action: "/platforms", callToAction: "Create", access });
  };
}

export function show(platformModel: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const platform = await platformModel.findBySlug(request.params.slug);
    if (platform) {
      if (clientWantsJson(request)) {
        response.json(platform);
      } else {
        await checkAccess()(request).then((result) => (access = result));
        response.render("platforms/show", { platform, access });
      }
    } else {
      response.status(404);
      if (clientWantsJson(request)) {
        response.json({ error: "This platform does not exist." });
      } else {
        await checkAccess()(request).then((result) => (access = result));
        response.status(404).render("pages/not-found", { access });
      }
    }
  };
}

export function edit(platformModel: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const platform = await platformModel.findBySlug(request.params.slug);
    if (platform) {
      await checkAccess()(request).then((result) => (access = result));
      response.render("platforms/edit", {
        platform,
        action: `/platforms/${platform.slug}`,
        callToAction: "Save",
        access,
      });
    } else {
      response.status(404);
      await checkAccess()(request).then((result) => (access = result));
      response.status(404).render("pages/not-found", { access });
    }
  };
}

export function create(platformModel: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    if (request.get("Content-Type") === "application/json") {
      // If we're getting JSON

      const platformInput = { ...request.body, slug: slugify(request.body.name) };
      const errors = platformModel.validate(platformInput);

      if (errors.length > 0) {
        response.status(400).json({ errors });
      } else {
        const platform = await platformModel.insertOne(platformInput);
        response.status(201).json(platform);
      }
    } else if (request.get("Content-Type") === "application/x-www-form-urlencoded") {
      // If we're in a Form
      const { platform_logo_url, platform_logo_width, platform_logo_height, ...rest } = request.body;

      const platformInput = {
        ...rest,
        slug: slugify(request.body.name),
        platform_logo: {
          url: platform_logo_url,
          width: parseFloat(platform_logo_width),
          height: parseFloat(platform_logo_height),
        },
      };
      const errors = platformModel.validate(platformInput);

      if (errors.length > 0) {
        response.status(400).json({ errors });
      } else {
        const platform = await platformModel.insertOne(platformInput);
        response.redirect(`/platforms/${platform.slug}`);
      }
    } else {
      response.status(400).end();
    }
  };
}

export function update(platformModel: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const platform = await platformModel.findBySlug(request.params.slug);
    if (platform) {
      if (request.get("Content-Type") === "application/json") {
        // If we're getting JSON
        const errors = platformModel.validate({ ...request.body, slug: request.params.slug });
        if (errors.length > 0) {
          response.status(400).json({ errors });
        } else {
          const updatedPlatform = await platformModel.updateOne(platform._id, {
            ...platform,
            ...request.body,
            _id: platform._id,
          });
          response.status(201).json(updatedPlatform);
        }
      } else if (request.get("Content-Type") === "application/x-www-form-urlencoded") {
        // If we're in a Form
        const { platform_logo_url, platform_logo_width, platform_logo_height, ...rest } = request.body;

        const platformInput = {
          ...rest,
          slug: slugify(request.body.name),
          platform_logo: {
            url: platform_logo_url,
            width: parseFloat(platform_logo_width),
            height: parseFloat(platform_logo_height),
          },
        };
        const errors = platformModel.validate(platformInput);
        if (errors.length > 0) {
          response.status(400).json({ errors });
        } else {
          const updatedPlatform = await platformModel.updateOne(platform._id, {
            ...platform,
            ...platformInput,
            _id: platform._id,
          });
          response.redirect(`/platforms/${updatedPlatform.slug}`);
        }
      }
    } else {
      response.status(404).end();
    }
  };
}

export function destroy(platformModel: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const platform = await platformModel.findBySlug(request.params.slug);
    if (platform) {
      platformModel.remove(platform._id);
      response.status(204).end();
    } else {
      response.status(404).end();
    }
  };
}
