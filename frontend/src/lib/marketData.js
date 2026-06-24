import {
  BadgeIndianRupee,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  LineChart,
  PiggyBank,
  ShieldCheck
} from "lucide-react";

export const indices = [
  ["NIFTY", "24,074.90", "250.80 (1.05%)"],
  ["SENSEX", "77,155.01", "954.33 (1.25%)"],
  ["BANKNIFTY", "58,213.40", "1,029.65 (1.80%)"],
  ["MIDCPNIFTY", "14,548.60", "67.05 (0.46%)"],
  ["FINNIFTY", "26,767.55", "90.20 (0.34%)"]
];

export const instruments = [
  { name: "NovaGrid Energy", symbol: "NGE", exchange: "NSE", price: 418.6, change: "8.15 (1.99%)", trend: "up", low: 402.2, high: 428.9, sector: "Power", volume: "21,45,011" },
  { name: "BluePeak Finance", symbol: "BPF", exchange: "NSE", price: 1260.2, change: "-14.20 (1.11%)", trend: "down", low: 1248.5, high: 1294.3, sector: "Financials", volume: "8,12,440" },
  { name: "Astra Foods", symbol: "ASF", exchange: "BSE", price: 312.75, change: "5.40 (1.76%)", trend: "up", low: 304.15, high: 316.8, sector: "FMCG", volume: "16,90,223" },
  { name: "Zenith Motors", symbol: "ZMO", exchange: "NSE", price: 892.1, change: "21.20 (2.43%)", trend: "up", low: 861.4, high: 905.2, sector: "Auto", volume: "9,84,300" },
  { name: "CloudNine Tech", symbol: "CNT", exchange: "NSE", price: 1740.3, change: "-18.65 (1.06%)", trend: "down", low: 1711.9, high: 1788.4, sector: "IT", volume: "6,54,711" },
  { name: "GreenRail Infra", symbol: "GRI", exchange: "BSE", price: 98.45, change: "2.10 (2.18%)", trend: "up", low: 94.1, high: 101.3, sector: "Infrastructure", volume: "31,11,980" },
  { name: "Hindustan Aeronautics Simulation", symbol: "HALS", exchange: "NSE", price: 4384.5, change: "-115.70 (2.57%)", trend: "down", low: 4309.1, high: 4505.6, sector: "Defence", volume: "6,94,351" },
  { name: "Finboard Flexi Cap", symbol: "FFC", exchange: "AMC", price: 64.23, change: "3Y return 18.4%", trend: "up", low: 61.2, high: 66.8, sector: "Mutual Fund", volume: "SIP Ready" },
  { name: "BluePeak Liquid Fund", symbol: "BLF", exchange: "AMC", price: 101.42, change: "Low risk", trend: "up", low: 100.9, high: 101.8, sector: "Debt Fund", volume: "Instant Redeem" }
];

export const tabs = {
  stocks: {
    label: "Stocks",
    eyebrow: "Equity market",
    heading: "Explore live stock opportunities",
    subheading: "Simulated quotes, trading screens, sectors, and stock discovery built for your KYC onboarding flow.",
    button: "Buy",
    products: [
      ["IPO", "6 open", BriefcaseBusiness],
      ["ETFs", "18 baskets", BarChart3],
      ["Stocks SIP", "monthly", CalendarDays],
      ["Stock Screener", "new filters", LineChart]
    ],
    cards: instruments.slice(0, 4),
    movers: [
      ["IRFC Logistics", "Rs. 93.70", "-5.05%", "4,85,67,051"],
      ["Helio Aero", "Rs. 4,391.80", "-2.41%", "6,94,351"],
      ["CG Digital Grid", "Rs. 921.90", "-3.01%", "29,35,099"],
      ["Bajaj AutoSim", "Rs. 9,831.00", "-1.94%", "2,91,005"],
      ["Siemens Mobility", "Rs. 3,594.90", "-2.47%", "2,09,474"]
    ],
    sectors: [
      ["Textiles", 143, 91, "+3.47%"],
      ["Batteries", 6, 2, "+2.18%"],
      ["Distributors", 96, 57, "+2.11%"],
      ["Electrical Equipment", 44, 63, "-1.68%"],
      ["Education", 13, 20, "-2.45%"]
    ]
  },
  fo: {
    label: "F&O",
    eyebrow: "Derivatives",
    heading: "Trade simulated futures and options",
    subheading: "A mock derivatives desk with option contracts, breakout signals, and margin-style product cards.",
    button: "Trade",
    products: [
      ["Index Futures", "4 active", LineChart],
      ["Options Chain", "live strikes", BarChart3],
      ["Hedge Builder", "strategy", ShieldCheck],
      ["Expiry Calendar", "weekly", CalendarDays]
    ],
    cards: [
      { name: "NIFTY Jul Futures", symbol: "NFUT", exchange: "NFO", price: 24080.5, change: "112.50 (0.47%)", trend: "up", low: 23880.5, high: 24192.1, sector: "Index Future", volume: "Weekly" },
      { name: "BANKNIFTY Jul Futures", symbol: "BNF", exchange: "NFO", price: 58210.25, change: "-95.35 (0.16%)", trend: "down", low: 57910.4, high: 58620.0, sector: "Index Future", volume: "Weekly" },
      { name: "FinServe 1720 CE", symbol: "FCE", exchange: "NFO", price: 74.8, change: "6.35 (9.28%)", trend: "up", low: 61.1, high: 82.3, sector: "Option", volume: "11,20,000" },
      { name: "AutoMax 900 PE", symbol: "APE", exchange: "NFO", price: 38.4, change: "-4.10 (9.65%)", trend: "down", low: 35.2, high: 44.9, sector: "Option", volume: "8,90,100" }
    ],
    movers: [
      ["Resistance Breakouts", "Bullish", "+18 signals", "NIFTY 100"],
      ["MACD above signal", "Bullish", "+11 signals", "Large Cap"],
      ["RSI overbought", "Bearish", "7 alerts", "Mid Cap"],
      ["OI Buildup", "Neutral", "22 contracts", "Weekly"]
    ],
    sectors: [
      ["Index Options", 118, 76, "+1.82%"],
      ["Banking Futures", 42, 31, "+1.14%"],
      ["IT Options", 37, 49, "-0.64%"],
      ["Auto Futures", 29, 21, "+0.88%"]
    ]
  },
  "mutual-funds": {
    label: "Mutual Funds",
    eyebrow: "Fund investing",
    heading: "Build SIPs and long-term baskets",
    subheading: "Creative mock fund data with SIP cards, risk labels, categories, and simple investment simulation.",
    button: "Start SIP",
    products: [
      ["SIP Planner", "monthly", PiggyBank],
      ["ELSS Funds", "tax saver", ShieldCheck],
      ["Liquid Funds", "low risk", BadgeIndianRupee],
      ["Fund Screener", "returns", BarChart3]
    ],
    cards: instruments.slice(7),
    movers: [
      ["Large Cap Index Fund", "Rs. 1,000 SIP", "Very High", "18.2% 3Y"],
      ["Balanced Advantage", "Rs. 500 SIP", "Moderate", "13.7% 3Y"],
      ["Short Duration Debt", "Rs. 1,000 SIP", "Low", "7.2% 3Y"],
      ["ELSS Tax Saver", "Rs. 500 SIP", "High", "16.1% 3Y"]
    ],
    sectors: [
      ["Equity Funds", 84, 26, "+2.12%"],
      ["Hybrid Funds", 42, 9, "+1.24%"],
      ["Debt Funds", 31, 3, "+0.42%"],
      ["Tax Saver", 20, 7, "+1.86%"]
    ]
  }
};

export function findInstrument(symbol) {
  const all = [...instruments, ...tabs.fo.cards];
  return all.find((item) => item.symbol.toLowerCase() === String(symbol || "").toLowerCase());
}
