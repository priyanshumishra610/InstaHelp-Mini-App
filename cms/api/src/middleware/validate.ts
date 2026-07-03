import type { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

export function validateBody<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.query = result.data as Request["query"];
    next();
  };
}

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const contentStatusSchema = z.enum([
  "draft",
  "scheduled",
  "active",
  "paused",
  "expired",
  "archived",
]);

export const bannerSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().optional(),
  imageUrl: z.string().url(),
  mobileImageUrl: z.string().url().optional(),
  tabletImageUrl: z.string().url().optional(),
  ctaText: z.string().max(80).optional(),
  ctaUrl: z.string().optional(),
  deepLink: z.string().optional(),
  displayPriority: z.number().int().default(0),
  status: contentStatusSchema.default("draft"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120),
  iconUrl: z.string().url().optional(),
  bannerImageUrl: z.string().url().optional(),
  description: z.string().optional(),
  themeColor: z.string().default("#6366f1"),
  displayPriority: z.number().int().default(0),
  isFeatured: z.boolean().default(false),
  isHidden: z.boolean().default(false),
  status: contentStatusSchema.default("active"),
  metadata: z.record(z.unknown()).optional(),
});

export const featuredCardSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  imageUrl: z.string().url(),
  category: z.string().optional(),
  deepLink: z.string().optional(),
  ctaText: z.string().max(80).optional(),
  displayPriority: z.number().int().default(0),
  status: contentStatusSchema.default("draft"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const dealSchema = z.object({
  dealTitle: z.string().min(1).max(200),
  description: z.string().optional(),
  dealBannerUrl: z.string().url().optional(),
  merchantLogoUrl: z.string().url().optional(),
  couponCode: z.string().max(50).optional(),
  discount: z.string().optional(),
  ctaText: z.string().max(80).optional(),
  ctaUrl: z.string().optional(),
  affiliateUrl: z.string().optional(),
  category: z.string().optional(),
  status: contentStatusSchema.default("draft"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  displayPriority: z.number().int().default(0),
  metadata: z.record(z.unknown()).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
