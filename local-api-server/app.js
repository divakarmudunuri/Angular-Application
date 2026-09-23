import express from 'express';

const app = express();

const audiences = [
  { id: 'individual', name: 'Individuals and families', description: 'Flexible plans to protect you and the people you love.' },
  { id: 'senior', name: 'Seniors and retirees', description: 'Affordable coverage for the next chapter of your life.' },
  { id: 'business', name: 'Businesses', description: 'Group plans that help you attract and keep great employees.' },
];

const products = [
  { id: 1, audience: 'individual', name: 'Health Shield PPO', planType: 'PPO', networkSize: 'Large', monthlyPremium: 120, deductible: 500, copay: 20, coverage: 500000, description: 'See any in-network doctor with low out-of-pocket costs.' },
  { id: 2, audience: 'individual', name: 'Health Basic HMO', planType: 'HMO', networkSize: 'Medium', monthlyPremium: 75, deductible: 0, copay: 10, coverage: 250000, description: 'Low-cost coverage focused on preventive care.' },
  { id: 3, audience: 'individual', name: 'Family Saver', planType: 'Discount plan', networkSize: 'Small', monthlyPremium: 25, deductible: 0, copay: null, coverage: null, description: 'Pay discounted fees directly to participating providers.' },
  { id: 4, audience: 'senior', name: 'Golden Years PPO', planType: 'PPO', networkSize: 'Large', monthlyPremium: 95, deductible: 250, copay: 15, coverage: 300000, description: 'Broad network coverage including dentures and vision.' },
  { id: 5, audience: 'senior', name: 'Medicare Supplement Plus', planType: 'Supplement', networkSize: 'Large', monthlyPremium: 140, deductible: 0, copay: 0, coverage: 200000, description: 'Fills the gaps in Original Medicare coverage.' },
  { id: 6, audience: 'business', name: 'Small Business Group', planType: 'PPO', networkSize: 'Large', monthlyPremium: 300, deductible: 1000, copay: 25, coverage: 1000000, description: 'Group health coverage for teams of 2-50 employees.' },
  { id: 7, audience: 'business', name: 'Enterprise Choice', planType: 'HMO', networkSize: 'Medium', monthlyPremium: 250, deductible: 500, copay: 15, coverage: 1000000, description: 'Customizable benefits for organizations of 50+ employees.' },
];

// Allow the Angular dev server to call this API
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', 'http://localhost:4200');
  next();
});

app.get('/api/audiences', (req, res) => res.json(audiences));

app.get('/api/audiences/:id', (req, res) => {
  const audience = audiences.find((a) => a.id === req.params.id);
  audience ? res.json(audience) : res.status(404).json({ message: 'Audience not found' });
});

// Optional filter: /api/products?audience=senior
app.get('/api/products', (req, res) => {
  const { audience } = req.query;
  res.json(audience ? products.filter((p) => p.audience === audience) : products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  product ? res.json(product) : res.status(404).json({ message: 'Product not found' });
});

export default app;
