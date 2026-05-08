export const pricingData = {
  cursor: {
    hobby: { price: 0, type: 'per_user' },
    pro: { price: 20, type: 'per_user' },
    business: { price: 40, type: 'per_user' }
  },
  github_copilot: {
    individual: { price: 10, type: 'per_user' },
    business: { price: 19, type: 'per_user' },
    enterprise: { price: 39, type: 'per_user' }
  },
  claude: {
    free: { price: 0, type: 'per_user' },
    pro: { price: 20, type: 'per_user' },
    team: { price: 30, type: 'per_user', minSeats: 5 },
    max: { price: 100, type: 'per_user' },
    enterprise: { price: 'custom', type: 'custom' }
  },
  chatgpt: {
    plus: { price: 20, type: 'per_user' },
    team: { price: 30, type: 'per_user', minSeats: 2 },
    enterprise: { price: 'custom', type: 'custom' }
  },
  anthropic_api: {
    pay_as_you_go: { type: 'per_token' }
  },
  openai_api: {
    pay_as_you_go: { type: 'per_token' }
  },
  gemini: {
    advanced: { price: 19.99, type: 'per_user' }, // Gemini Advanced (1 user)
    business: { price: 30, type: 'per_user' }, // Workspace
    api: { type: 'per_use' }
  },
  windsurf: {
    free: { price: 0, type: 'per_user' },
    pro: { price: 15, type: 'per_user' },
    team: { price: 35, type: 'per_user' }
  }
} as const;

export type ToolId = keyof typeof pricingData;
