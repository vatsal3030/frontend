import React from 'react';

const MODELS = [
  {
    id: 'default',
    name: 'Smart Router (Auto)',
    tags: [
      { text: 'Recommended', color: 'bg-green-300' },
      { text: 'Fastest', color: 'bg-blue-200' }
    ]
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    tags: [
      { text: 'Fast', color: 'bg-blue-300' }
    ]
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    tags: [
      { text: 'Powerful', color: 'bg-purple-300' },
      { text: 'Slower', color: 'bg-orange-200' }
    ]
  },
  {
    id: 'deepseek/deepseek-chat:free',
    name: 'DeepSeek Chat (V3)',
    tags: [
      { text: 'Free', color: 'bg-yellow-300' },
      { text: 'Strong Reasoning', color: 'bg-pink-200' }
    ]
  },
  {
    id: 'meta-llama/llama-3-8b-instruct:free',
    name: 'Llama 3 (8B)',
    tags: [
      { text: 'Free', color: 'bg-yellow-300' }
    ]
  }
];

export function ModelSelector({ value, onChange }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-black uppercase mb-2">Select AI Engine (Optional)</label>
      <div className="space-y-2 border-2 border-brutal-black bg-brutal-white p-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
        {MODELS.map((model) => (
          <label 
            key={model.id}
            className={`flex items-center justify-between p-3 border-2 border-transparent hover:border-brutal-black cursor-pointer transition-colors ${
              value === model.id ? 'bg-brutal-primary border-brutal-black shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-brutal-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="ai-model"
                value={model.id}
                checked={value === model.id}
                onChange={() => onChange(model.id)}
                className="w-4 h-4 accent-brutal-black"
              />
              <span className="font-bold">{model.name}</span>
            </div>
            
            <div className="flex gap-2">
              {model.tags.map((tag, idx) => (
                <span 
                  key={idx} 
                  className={`text-xs font-bold px-2 py-1 border-2 border-brutal-black shadow-[1px_1px_0px_rgba(0,0,0,1)] ${tag.color}`}
                >
                  {tag.text}
                </span>
              ))}
            </div>
          </label>
        ))}
      </div>
      <p className="text-xs font-bold mt-2 text-gray-600">
        Free models may have rate limits and delays. Fallback to Gemini automatically happens if OpenRouter fails.
      </p>
    </div>
  );
}
