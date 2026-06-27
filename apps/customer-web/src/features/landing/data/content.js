export const navLinks = [
  { href: "#journey", label: "Journey", id: "journey", index: "01" },
  { href: "#banking", label: "Banking", id: "banking", index: "02" },
  { href: "#invest", label: "Invest", id: "invest", index: "03" },
  { href: "#security", label: "Security", id: "security", index: "04" },
  { href: "#faq", label: "FAQ", id: "faq", index: "05" }
];

export const navSectionIds = navLinks.map((link) => link.id);

export const problemStats = [
  { value: "14+", label: "days most platforms take to verify your identity" },
  { value: "63%", label: "of investors quit before placing their first trade" },
  { value: "7+", label: "apps needed to manage a single portfolio elsewhere" }
];

export const kycSteps = [
  { id: "upload", title: "Upload your documents", detail: "PAN & Aadhaar, just once", status: "done" },
  { id: "ocr", title: "Instant verification", detail: "Your details are read and checked automatically", status: "done" },
  { id: "match", title: "Identity confirmed", detail: "We make sure everything checks out", status: "active" },
  { id: "review", title: "Final approval", detail: "A compliance expert reviews your account", status: "pending" },
  { id: "unlock", title: "Start investing", detail: "Your portfolio is live the moment your bank is linked", status: "pending" }
];

export const trustMetrics = [
  { value: "₹2", label: "bank verification deposit, refunded within seconds" },
  { value: "<45s", label: "and your refund is back in your account" },
  { value: "256-bit", label: "encryption protecting your session end to end" },
  { value: "100%", label: "of verification steps are permanently recorded" }
];

export const testimonials = [
  {
    quote:
      "Finboard made our compliance review process effortless. Our team went from chasing documents across emails to approving accounts in under two minutes.",
    name: "Priya Menon",
    role: "Head of Operations",
    org: "AMC Partners"
  },
  {
    quote:
      "The onboarding experience is exactly what our clients expect — fast, clear, and secure. Finboard makes the entire process feel human.",
    name: "Arjun Kulkarni",
    role: "Product Lead",
    org: "Finboard"
  }
];

export const faqItems = [
  {
    q: "How does identity verification work?",
    a: "You upload your PAN and Aadhaar once. We read and verify your details automatically, then a compliance expert does a final review before approving your account — usually in under two minutes."
  },
  {
    q: "What is the ₹2 bank verification?",
    a: "To confirm your bank account, we send a small ₹2 test deposit. It is refunded automatically within seconds — you just need to confirm the amount you received."
  },
  {
    q: "What can I do after my account is approved?",
    a: "Once your identity and bank account are verified, you can invest in stocks, mutual funds, and set up SIP plans — all from a single dashboard."
  },
  {
    q: "Is my personal information safe?",
    a: "Yes. Your documents and personal data are encrypted end to end. Only authorised compliance reviewers can access your application, and every action is permanently recorded for your protection."
  }
];

export const techStack = [
  "256-bit encryption",
  "Secure sessions",
  "Full audit trail",
  "Verified identity",
  "Instant refunds",
  "Bank-grade accuracy"
];
