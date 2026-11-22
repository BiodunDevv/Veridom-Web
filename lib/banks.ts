/**
 * Nigerian banks and their Paystack bank codes. The API has no bank-list
 * endpoint yet; replace this with `GET /banks` when it exists.
 */
export const BANKS: { code: string; name: string }[] = [
  { code: "044", name: "Access Bank" },
  { code: "063", name: "Access Bank (Diamond)" },
  { code: "035A", name: "ALAT by WEMA" },
  { code: "401", name: "ASO Savings and Loans" },
  { code: "023", name: "Citibank Nigeria" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "562", name: "Ekondo Microfinance Bank" },
  { code: "070", name: "Fidelity Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "214", name: "First City Monument Bank (FCMB)" },
  { code: "00103", name: "Globus Bank" },
  { code: "058", name: "Guaranty Trust Bank (GTBank)" },
  { code: "030", name: "Heritage Bank" },
  { code: "301", name: "Jaiz Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "50211", name: "Kuda Microfinance Bank" },
  { code: "50515", name: "Moniepoint Microfinance Bank" },
  { code: "999992", name: "OPay" },
  { code: "104", name: "Parallex Bank" },
  { code: "999991", name: "PalmPay" },
  { code: "076", name: "Polaris Bank" },
  { code: "105", name: "PremiumTrust Bank" },
  { code: "101", name: "Providus Bank" },
  { code: "125", name: "Rubies Microfinance Bank" },
  { code: "51310", name: "Sparkle Microfinance Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "068", name: "Standard Chartered Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "100", name: "Suntrust Bank" },
  { code: "302", name: "TAJ Bank" },
  { code: "102", name: "Titan Trust Bank" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "215", name: "Unity Bank" },
  { code: "566", name: "VFD Microfinance Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
]

export const bankName = (code?: string | null) =>
  BANKS.find((b) => b.code === code)?.name
