export interface QuoteInput {
  serviceType: string;
  finishType: string;
  panels: string[];
  hourlyRate: number;
  materialMarkup: number;
  taxRate: number;
}

export interface LineItem {
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  total: number;
  isLabor: boolean;
}

export interface QuoteCalculation {
  lineItems: LineItem[];
  laborHours: number;
  laborTotal: number;
  materialsTotal: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

const LABOR_HOURS_PER_PANEL: Record<string, Record<string, number>> = {
  full_repaint: {
    Hood: 3.0, Roof: 3.5, Trunk: 2.5,
    "Front Bumper": 2.5, "Rear Bumper": 2.5,
    "Front Left Fender": 2.0, "Front Right Fender": 2.0,
    "Rear Left Quarter": 3.0, "Rear Right Quarter": 3.0,
    "Left Front Door": 2.5, "Left Rear Door": 2.5,
    "Right Front Door": 2.5, "Right Rear Door": 2.5,
    "Left Rocker Panel": 1.5, "Right Rocker Panel": 1.5,
    "Left Mirror": 0.5, "Right Mirror": 0.5,
  },
  panel_repair: {
    Hood: 2.5, Roof: 3.0, Trunk: 2.0,
    "Front Bumper": 2.0, "Rear Bumper": 2.0,
    "Front Left Fender": 1.5, "Front Right Fender": 1.5,
    "Rear Left Quarter": 2.5, "Rear Right Quarter": 2.5,
    "Left Front Door": 2.0, "Left Rear Door": 2.0,
    "Right Front Door": 2.0, "Right Rear Door": 2.0,
    "Left Rocker Panel": 1.0, "Right Rocker Panel": 1.0,
    "Left Mirror": 0.3, "Right Mirror": 0.3,
  },
  touch_up: {
    Hood: 0.75, Roof: 1.0, Trunk: 0.75,
    "Front Bumper": 0.75, "Rear Bumper": 0.75,
    "Front Left Fender": 0.5, "Front Right Fender": 0.5,
    "Rear Left Quarter": 0.75, "Rear Right Quarter": 0.75,
    "Left Front Door": 0.5, "Left Rear Door": 0.5,
    "Right Front Door": 0.5, "Right Rear Door": 0.5,
    "Left Rocker Panel": 0.5, "Right Rocker Panel": 0.5,
    "Left Mirror": 0.25, "Right Mirror": 0.25,
  },
  spot_repair: {
    Hood: 1.5, Roof: 1.5, Trunk: 1.0,
    "Front Bumper": 1.0, "Rear Bumper": 1.0,
    "Front Left Fender": 1.0, "Front Right Fender": 1.0,
    "Rear Left Quarter": 1.5, "Rear Right Quarter": 1.5,
    "Left Front Door": 1.0, "Left Rear Door": 1.0,
    "Right Front Door": 1.0, "Right Rear Door": 1.0,
    "Left Rocker Panel": 0.75, "Right Rocker Panel": 0.75,
    "Left Mirror": 0.25, "Right Mirror": 0.25,
  },
  custom_paint: {
    Hood: 4.0, Roof: 4.5, Trunk: 3.5,
    "Front Bumper": 3.0, "Rear Bumper": 3.0,
    "Front Left Fender": 3.0, "Front Right Fender": 3.0,
    "Rear Left Quarter": 4.0, "Rear Right Quarter": 4.0,
    "Left Front Door": 3.5, "Left Rear Door": 3.5,
    "Right Front Door": 3.5, "Right Rear Door": 3.5,
    "Left Rocker Panel": 2.0, "Right Rocker Panel": 2.0,
    "Left Mirror": 0.75, "Right Mirror": 0.75,
  },
  clear_coat: {
    Hood: 1.5, Roof: 2.0, Trunk: 1.5,
    "Front Bumper": 1.5, "Rear Bumper": 1.5,
    "Front Left Fender": 1.0, "Front Right Fender": 1.0,
    "Rear Left Quarter": 1.5, "Rear Right Quarter": 1.5,
    "Left Front Door": 1.5, "Left Rear Door": 1.5,
    "Right Front Door": 1.5, "Right Rear Door": 1.5,
    "Left Rocker Panel": 0.75, "Right Rocker Panel": 0.75,
    "Left Mirror": 0.25, "Right Mirror": 0.25,
  },
};

// Material cost per panel (base cost in USD, before markup)
const BASE_MATERIAL_COST_PER_PANEL: Record<string, number> = {
  Hood: 45, Roof: 55, Trunk: 40,
  "Front Bumper": 35, "Rear Bumper": 35,
  "Front Left Fender": 30, "Front Right Fender": 30,
  "Rear Left Quarter": 40, "Rear Right Quarter": 40,
  "Left Front Door": 35, "Left Rear Door": 35,
  "Right Front Door": 35, "Right Rear Door": 35,
  "Left Rocker Panel": 20, "Right Rocker Panel": 20,
  "Left Mirror": 8, "Right Mirror": 8,
};

const FINISH_MULTIPLIERS: Record<string, number> = {
  solid: 1.0,
  metallic: 1.25,
  pearl: 1.5,
  matte: 1.35,
  satin: 1.3,
  candy: 1.75,
};

const PREP_HOURS_PER_PANEL = 0.5;
const SHOP_SUPPLIES_PERCENT = 0.08;

export function calculateQuote(input: QuoteInput): QuoteCalculation {
  const { serviceType, finishType, panels, hourlyRate, materialMarkup, taxRate } = input;
  const lineItems: LineItem[] = [];
  const laborTable = LABOR_HOURS_PER_PANEL[serviceType] ?? LABOR_HOURS_PER_PANEL.panel_repair;
  const finishMult = FINISH_MULTIPLIERS[finishType] ?? 1.0;

  let totalLaborHours = 0;
  let totalMaterialsCost = 0;

  for (const panel of panels) {
    const paintHours = laborTable[panel] ?? 1.5;
    const prepHours = PREP_HOURS_PER_PANEL;
    const panelHours = paintHours + prepHours;
    totalLaborHours += panelHours;

    lineItems.push({
      description: `${panel} — Prep & Sand`,
      category: "Preparation",
      quantity: 1,
      unitPrice: round(prepHours * hourlyRate),
      total: round(prepHours * hourlyRate),
      isLabor: true,
    });

    lineItems.push({
      description: `${panel} — Paint Application`,
      category: "Paint Labor",
      quantity: 1,
      unitPrice: round(paintHours * hourlyRate),
      total: round(paintHours * hourlyRate),
      isLabor: true,
    });

    const baseMaterial = BASE_MATERIAL_COST_PER_PANEL[panel] ?? 30;
    const materialCost = round(baseMaterial * finishMult * (1 + materialMarkup / 100));
    totalMaterialsCost += materialCost;

    lineItems.push({
      description: `${panel} — Paint & Materials (${finishType})`,
      category: "Materials",
      quantity: 1,
      unitPrice: materialCost,
      total: materialCost,
      isLabor: false,
    });
  }

  // Masking & taping (flat per-panel charge for multi-panel jobs)
  if (panels.length > 1) {
    const maskingCost = round(panels.length * 15);
    lineItems.push({
      description: "Masking & Taping",
      category: "Preparation",
      quantity: panels.length,
      unitPrice: 15,
      total: maskingCost,
      isLabor: false,
    });
    totalMaterialsCost += maskingCost;
  }

  const laborTotal = round(totalLaborHours * hourlyRate);

  // Shop supplies (percentage of labor + materials)
  const shopSupplies = round((laborTotal + totalMaterialsCost) * SHOP_SUPPLIES_PERCENT);
  lineItems.push({
    description: "Shop Supplies & Cleanup",
    category: "Overhead",
    quantity: 1,
    unitPrice: shopSupplies,
    total: shopSupplies,
    isLabor: false,
  });

  const subtotal = round(laborTotal + totalMaterialsCost + shopSupplies);
  const taxAmount = round(subtotal * (taxRate / 100));
  const total = round(subtotal + taxAmount);

  return {
    lineItems,
    laborHours: round(totalLaborHours),
    laborTotal,
    materialsTotal: round(totalMaterialsCost + shopSupplies),
    subtotal,
    taxAmount,
    total,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
