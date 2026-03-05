import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  decimal,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const quoteStatusEnum = pgEnum("quote_status", [
  "draft",
  "sent",
  "viewed",
  "approved",
  "rejected",
  "expired",
]);

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free",
  "pro",
  "shop",
]);

export const serviceTypeEnum = pgEnum("service_type", [
  "full_repaint",
  "panel_repair",
  "touch_up",
  "custom_paint",
  "clear_coat",
  "spot_repair",
]);

export const finishTypeEnum = pgEnum("finish_type", [
  "solid",
  "metallic",
  "pearl",
  "matte",
  "satin",
  "candy",
]);

// ─── Users ──────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  shopId: uuid("shop_id").references(() => shops.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
  shop: one(shops, { fields: [users.shopId], references: [shops.id] }),
}));

// ─── Shops ──────────────────────────────────────────
export const shops = pgTable("shops", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zip: varchar("zip", { length: 20 }),
  logoUrl: text("logo_url"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).default("75.00"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0.00"),
  materialMarkup: decimal("material_markup", { precision: 5, scale: 2 }).default("25.00"),
  currency: varchar("currency", { length: 3 }).default("USD"),
  subscriptionTier: subscriptionTierEnum("subscription_tier").default("free"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  quotesThisMonth: integer("quotes_this_month").default(0),
  quotesResetAt: timestamp("quotes_reset_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shopsRelations = relations(shops, ({ many }) => ({
  users: many(users),
  customers: many(customers),
  quotes: many(quotes),
}));

// ─── Customers ──────────────────────────────────────
export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  shopId: uuid("shop_id")
    .references(() => shops.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customersRelations = relations(customers, ({ one, many }) => ({
  shop: one(shops, { fields: [customers.shopId], references: [shops.id] }),
  quotes: many(quotes),
}));

// ─── Quotes ─────────────────────────────────────────
export const quotes = pgTable("quotes", {
  id: uuid("id").defaultRandom().primaryKey(),
  shopId: uuid("shop_id")
    .references(() => shops.id, { onDelete: "cascade" })
    .notNull(),
  customerId: uuid("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  quoteNumber: varchar("quote_number", { length: 50 }).notNull(),
  status: quoteStatusEnum("status").default("draft").notNull(),

  // Vehicle info
  vehicleYear: integer("vehicle_year"),
  vehicleMake: varchar("vehicle_make", { length: 100 }),
  vehicleModel: varchar("vehicle_model", { length: 100 }),
  vehicleColor: varchar("vehicle_color", { length: 100 }),
  vehicleVin: varchar("vehicle_vin", { length: 20 }),

  // Paint details
  serviceType: serviceTypeEnum("service_type"),
  paintColor: varchar("paint_color", { length: 100 }),
  paintBrand: varchar("paint_brand", { length: 100 }),
  finishType: finishTypeEnum("finish_type"),
  panels: text("panels"), // JSON array of panel names

  // Totals
  laborHours: decimal("labor_hours", { precision: 10, scale: 2 }).default("0"),
  laborTotal: decimal("labor_total", { precision: 10, scale: 2 }).default("0"),
  materialsTotal: decimal("materials_total", { precision: 10, scale: 2 }).default("0"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).default("0"),

  notes: text("notes"),
  internalNotes: text("internal_notes"),
  validUntil: timestamp("valid_until"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  shop: one(shops, { fields: [quotes.shopId], references: [shops.id] }),
  customer: one(customers, {
    fields: [quotes.customerId],
    references: [customers.id],
  }),
  lineItems: many(quoteLineItems),
}));

// ─── Quote Line Items ───────────────────────────────
export const quoteLineItems = pgTable("quote_line_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  quoteId: uuid("quote_id")
    .references(() => quotes.id, { onDelete: "cascade" })
    .notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  isLabor: boolean("is_labor").default(false),
  sortOrder: integer("sort_order").default(0),
});

export const quoteLineItemsRelations = relations(quoteLineItems, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteLineItems.quoteId],
    references: [quotes.id],
  }),
}));
