const Faq = require('./src/models/Faq');

async function seed() {
  try {
    const faqs = [
      {
        question: "Do you offer same-day delivery?",
        answer: "Yes, for orders placed before 2:00 PM local time. We deliver throughout the greater metropolitan area using our climate-controlled courier fleet to ensure your blooms arrive in harvest-fresh condition.",
        position: 1
      },
      {
        question: "How long will my arrangement stay fresh?",
        answer: "Most of our signature bouquets last between 7-10 days. We include a specialty ‘Studio Bloom’ nutrient packet and a digital care guide with every order to help you maximize the longevity of your stems.",
        position: 2
      },
      {
        question: "Are your flowers sustainably sourced?",
        answer: "Transparency is our core value. 100% of our stems are sourced from certified ethical farms that prioritize biodiversity and soil health. Plus, our packaging is entirely compostable and plastic-free.",
        position: 3
      },
      {
        question: "Can I request a custom color palette?",
        answer: "Absolutely. Our master florists specialize in bespoke architecture. You can select 'Custom Edit' at checkout or contact our studio directly to discuss a one-of-a-kind palette for your event.",
        position: 4
      },
      {
        question: "What is your substitution policy?",
        answer: "Since we work with seasonal nature, occasionally a specific stem may be unavailable. In these rare cases, our lead florists will substitute with a bloom of equal or greater value that maintains the specific aesthetic integrity of your chosen design.",
        position: 5
      }
    ];

    for (const f of faqs) {
      await Faq.findOrCreate({ where: { question: f.question }, defaults: f });
    }
    console.log("FAQ seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
